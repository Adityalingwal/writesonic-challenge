import { Worker, Job } from "bullmq";
import { redis as connection } from "../lib/redis";
import { AuditJobData } from "../lib/queue";
import { getChatGPTResponse } from "../services/providers/chatgpt-service";
import { updateSessionStatus } from "../db/dao/session/sessionDAO";
import { getPromptsBySessionId } from "../db/dao/prompt/promptDAO";
import { createResponse } from "../db/dao/response/responseDAO";
import { analyzeWithLLM } from "../services/analysis/llm-analysis";
import { createMentionsBatch } from "../db/dao/mention/mentionDAO";
import { createCitationsBatch } from "../db/dao/citation/citationDAO";
import { DraftMention } from "../db/dao/mention/types";

const processAuditJob = async (job: Job<AuditJobData>) => {
  const { sessionId, brands } = job.data;
  const platform = "chatgpt";

  try {
    const prompts = await getPromptsBySessionId(sessionId);

    if (prompts.length === 0) {
      await updateSessionStatus(sessionId, "FAILED");
      return;
    }

    let promptsProcessed = 0;

    // Loop through each prompt linearly
    for (const prompt of prompts) {
      try {
        await job.updateProgress({
          message: `Processing prompt ${promptsProcessed + 1}/${
            prompts.length
          }...`,
          currentPrompt: prompt.promptText,
          platform,
        });

        const response = await getChatGPTResponse(prompt.promptText);

        if (response.success && response.content) {
          const savedResponse = await createResponse({
            promptId: prompt.id,
            sessionId: sessionId,
            rawResponse: response.content,
            platform: "CHATGPT",
          });

          await job.updateProgress({
            message: `Analyzing AI response...`,
            currentPrompt: prompt.promptText,
            platform,
          });

          const result = await analyzeWithLLM(response.content, brands);

          const mentionsToCreate: DraftMention[] = [];
          for (const mention of result.mentions) {
            if (brands.includes(mention.brand)) {
              mentionsToCreate.push({
                responseId: savedResponse.id,
                sessionId,
                promptId: prompt.id,
                brandName: mention.brand,
                mentionCount: mention.count,
                context: mention.context,
              });
            }
          }

          if (mentionsToCreate.length > 0) {
            await createMentionsBatch(mentionsToCreate);
          }

          if (result.citations.length > 0) {
            const validCitations = result.citations
              .map((url) => {
                try {
                  return {
                    responseId: savedResponse.id,
                    sessionId,
                    url: url,
                    domain: new URL(url).hostname,
                  };
                } catch (e) {
                  return null;
                }
              })
              .filter((c) => c !== null);

            if (validCitations.length > 0) {
              await createCitationsBatch(validCitations);
            }
          }

          promptsProcessed++;
        } else {
          console.error(
            `Failed to get response for prompt: ${prompt.promptText}`
          );
        }
      } catch (promptError) {
        console.error(`Error processing prompt ${prompt.id}:`, promptError);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (promptsProcessed > 0) {
      await updateSessionStatus(
        sessionId,
        "COMPLETED",
        new Date().toISOString()
      );
    } else {
      await updateSessionStatus(sessionId, "FAILED");
    }
  } catch (error) {
    console.error("Critical Worker Error:", error);
    await updateSessionStatus(sessionId, "FAILED");
    throw error;
  }
};

export const initWorkers = () => {
  const auditWorker = new Worker("audit", processAuditJob, {
    connection,
    concurrency: 1,
    lockDuration: 300000,
  });
};
