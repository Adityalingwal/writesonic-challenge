"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  ExternalLink,
  LinkIcon,
  MessageSquare,
} from "lucide-react";

interface Response {
  id: string;
  platform: string;
  rawResponse: string;
}

interface Mention {
  brandName: string;
  context: string | null;
  mentionCount: number;
  promptId: string;
  responseId: string;
}

interface PromptResponseCardProps {
  promptNumber: number;
  promptText: string;
  responses: Response[];
  mentions: Mention[];
  trackedBrands: string[];
}

export function PromptResponseCard({
  promptNumber,
  promptText,
  responses,
  mentions,
  trackedBrands,
}: PromptResponseCardProps) {
  const selectedPlatform = "chatgpt";
  const [isExpanded, setIsExpanded] = useState(false);

  const currentResponse = responses.find(
    (r) => r.platform.toLowerCase() === selectedPlatform
  );

  const currentMentions = mentions.filter(
    (m) => m.responseId === currentResponse?.id
  );

  const getBrandStatus = (brand: string) => {
    const brandMentions = currentMentions.filter(
      (m) => m.brandName.toLowerCase() === brand.toLowerCase()
    );
    const totalCount = brandMentions.reduce(
      (sum, m) => sum + m.mentionCount,
      0
    );
    const contexts = brandMentions
      .map((m) => m.context)
      .filter((c) => c) as string[];
    return { count: totalCount, contexts, mentioned: totalCount > 0 };
  };

  const platforms = [
    ...new Set(responses.map((r) => r.platform.toLowerCase())),
  ];

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-muted/80 to-muted/40 px-5 py-4 border-b border-border">
        <div className="flex items-start gap-3">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1.5 rounded-md shadow-sm">
            #{promptNumber}
          </span>
          <h3 className="font-semibold text-base text-foreground leading-tight">
            {promptText}
          </h3>
        </div>
      </div>

      {currentResponse ? (
        <div className="p-5 space-y-5">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your Tracked Brands
            </h4>
            <div className="flex flex-wrap gap-2">
              {trackedBrands.map((brand) => {
                const status = getBrandStatus(brand);
                return (
                  <Badge
                    key={brand}
                    variant="outline"
                    className={`px-3 py-1.5 text-sm font-medium ${
                      status.mentioned
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-red-500/10 text-red-500 border-red-500/30"
                    }`}
                  >
                    {status.mentioned ? (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    <span className="font-semibold">{brand}</span>
                    {status.mentioned && (
                      <span className="ml-1 opacity-75">({status.count})</span>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {trackedBrands.map((brand) => {
              const status = getBrandStatus(brand);
              if (!status.mentioned) return null;

              return (
                <div key={brand} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 pl-2 pr-3 py-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-2" />
                      {brand}
                    </Badge>
                  </div>

                  <div className="grid gap-2">
                    {status.contexts.length > 0 ? (
                      status.contexts.map((context, idx) => (
                        <div
                          key={idx}
                          className="bg-muted/30 rounded-r-lg border-l-4 border-primary/40 pl-4 pr-4 py-3 text-sm italic text-foreground/90"
                        >
                          "{context}"
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic pl-2">
                        Context not available for this mention
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {trackedBrands.every(
              (brand) => !getBrandStatus(brand).mentioned
            ) && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-amber-600 font-medium">
                  ⚠️ None of your tracked brands were mentioned in this response
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Full AI Response</span>
              <div className="flex items-center gap-1 text-primary">
                <span className="text-[10px] font-semibold normal-case">
                  {isExpanded ? "Collapse" : "Expand"}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>
            <div
              className={`bg-muted/40 rounded-lg p-4 border border-border/50 transition-all duration-300 ${
                isExpanded
                  ? "max-h-[600px] overflow-y-auto"
                  : "max-h-28 overflow-hidden"
              }`}
            >
              <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-foreground/80">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 leading-relaxed">
                        {children}
                      </p>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mt-4 mb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold mt-3 mb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-bold mt-3 mb-1.5">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 mb-3 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 mb-3 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                    table: ({ children }) => (
                      <table className="w-full border-collapse my-3 text-xs">
                        {children}
                      </table>
                    ),
                    th: ({ children }) => (
                      <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-border px-2 py-1">
                        {children}
                      </td>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {currentResponse.rawResponse}
                </ReactMarkdown>
              </div>
            </div>
            {!isExpanded && currentResponse.rawResponse.length > 200 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
              >
                Show full response →
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">
            No response available for {selectedPlatform}
          </p>
        </div>
      )}
    </div>
  );
}
