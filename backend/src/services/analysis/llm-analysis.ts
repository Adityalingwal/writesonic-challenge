import { openai } from "../../lib/openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const AnalysisSchema = z.object({
  mentions: z
    .array(
      z.object({
        brand: z.string(),
        count: z.number().int(),
        context: z.string(),
      })
    )
    .default([]),
  citations: z.array(z.string()).default([]),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

const buildSystemPrompt = (brands: string[]): string => {
  return `You are an AI Visibility Analyst specializing in brand monitoring and competitive intelligence.

## YOUR ROLE
Analyze AI-generated content to extract brand visibility metrics for competitive analysis dashboards.

## TARGET BRANDS TO TRACK
${brands.map((b, i) => `${i + 1}. ${b}`).join("\n")}

## ANALYSIS TASKS

### Task 1: Brand Mention Detection
For EACH brand in the target list, identify:
- **count**: Total number of times this brand appears in the text (include variations like "Nike", "Nike's", "by Nike", "@Nike")
- **context**: The most relevant sentence (max 150 chars) showing how the brand is mentioned or positioned

### Task 2: Citation Extraction
Extract all URLs mentioned as sources or references. Only include valid http/https URLs.

## OUTPUT JSON STRUCTURE
Your response MUST be a valid JSON object following this structure:

{
  "mentions": [
    {
      "brand": "<exact brand name from TARGET BRANDS list>",
      "count": <integer: total occurrences of this brand>,
      "context": "<string: most relevant sentence showing the brand>"
    }
  ],
  "citations": ["<url1>", "<url2>"]
}

IMPORTANT: The above is the STRUCTURE template. Analyze the user's input text and extract REAL data from it.

## RULES
1. ONLY include brands from the TARGET BRANDS list above.
2. If a brand is NOT mentioned at all, do NOT include it in the mentions array.
3. For count: Count ALL occurrences including variations (Nike, Nike's, by Nike, @Nike = all count as Nike).
4. For context: Choose the sentence that best shows the brand's positioning (positive, negative, or neutral).
5. For citations: Return empty array [] if no URLs found. Do not invent URLs.
6. Be precise. This data feeds into business dashboards.

## EXAMPLE (FOR UNDERSTANDING ONLY - DO NOT COPY THIS DATA)

If the input text is:
"For CRM software, Salesforce leads the market with 23% share. Salesforce's pricing is competitive. HubSpot is known for ease of use. Check reviews at https://g2.com/crm"

Then the correct output would be:
{
  "mentions": [
    {"brand": "Salesforce", "count": 2, "context": "Salesforce leads the market with 23% share."},
    {"brand": "HubSpot", "count": 1, "context": "HubSpot is known for ease of use."}
  ],
  "citations": ["https://g2.com/crm"]
}

Note: Salesforce has count=2 because it appears twice ("Salesforce leads..." and "Salesforce's pricing...").`;
};

export const analyzeWithLLM = async (
  text: string,
  brands: string[]
): Promise<{ mentions: AnalysisResult["mentions"]; citations: string[] }> => {
  if (!text || text.length < 10) {
    return { mentions: [], citations: [] };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(brands),
        },
        {
          role: "user",
          content: `Analyze the following AI-generated response for brand visibility:\n\n${text}`,
        },
      ],
      response_format: zodResponseFormat(AnalysisSchema, "analysis"),
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return { mentions: [], citations: [] };
    }

    const parsed = AnalysisSchema.parse(JSON.parse(content));
    console.log("Parsed Analysis:", parsed);
    return {
      mentions: parsed.mentions,
      citations: parsed.citations || [],
    };
  } catch (error) {
    console.error("OpenAI Analysis Failed:", error);
    return { mentions: [], citations: [] };
  }
};
