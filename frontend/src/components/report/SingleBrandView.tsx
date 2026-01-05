"use client";

import { useMemo } from "react";
import { User, AlertTriangle, Quote, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompetitiveMatrixResponse } from "@/api/api-types/session";

interface SingleBrandViewProps {
  brand: string;
  data: CompetitiveMatrixResponse;
}

export function SingleBrandView({ brand, data }: SingleBrandViewProps) {
  const { matrix, aggregatedStats, totalPrompts } = data;
  const stats = aggregatedStats[brand] || {
    citationShare: 0,
    promptsWon: 0,
    promptsMissed: 0,
    totalMentions: 0,
  };

  const mentions = useMemo(() => {
    return matrix
      .filter((entry) => entry.brandPerformance[brand]?.isPresent)
      .map((entry) => ({
        prompt: entry.promptText,
        isWinner: entry.brandPerformance[brand]?.isWinner,
        count: entry.brandPerformance[brand]?.mentionCount,
      }))
      .sort((a, b) => (b.isWinner === a.isWinner ? 0 : b.isWinner ? 1 : -1));
  }, [matrix, brand]);

  const missedOpportunities = useMemo(() => {
    return matrix
      .filter((entry) => !entry.brandPerformance[brand]?.isPresent)
      .map((entry) => entry.promptText);
  }, [matrix, brand]);

  const visibilityRate =
    Math.round(((totalPrompts - stats.promptsMissed) / totalPrompts) * 100) ||
    0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-primary">
              Visibility Score
            </CardTitle>
            <EyeIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visibilityRate}%</div>
            <p className="text-xs text-muted-foreground">
              Appeared in {totalPrompts - stats.promptsMissed} of {totalPrompts}{" "}
              prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Mentions
            </CardTitle>
            <Quote className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMentions}</div>
            <p className="text-xs text-muted-foreground">
              Across all analyzed prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Missed Opps</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.promptsMissed}</div>
            <p className="text-xs text-muted-foreground">
              Queries where you were absent
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full">
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Where {brand} Shines
              </CardTitle>
              <CardDescription>
                Prompts where you are mentioned or winning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-auto max-h-[400px] pr-4">
                <div className="space-y-4">
                  {mentions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      No mentions found yet. Time to improve optimization!
                    </div>
                  ) : (
                    mentions.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between p-3 rounded-lg border border-border bg-card/50"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {m.prompt}
                          </p>
                          <div className="flex gap-2 pt-1">
                            {m.isWinner && (
                              <Badge className="bg-green-500/10 text-green-600 border-0 h-5 text-[10px] px-1.5">
                                🏆 Winner
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="h-5 text-[10px] px-1.5"
                            >
                              {m.count} Mentions
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EyeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
