"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Trophy, Target, TrendingUp, AlertTriangle, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CompetitiveMatrixResponse,
  BrandAggregatedStats,
  PromptMatrixEntry,
} from "@/api/api-types/session";

interface MarketLandscapeProps {
  data: CompetitiveMatrixResponse;
  primaryBrand?: string;
}

const PRIMARY_BRAND_COLOR = "#22c55e";
const COMPETITOR_COLORS = [
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#06b6d4",
  "#eab308",
  "#ec4899",
];

export function MarketLandscape({ data, primaryBrand }: MarketLandscapeProps) {
  const { matrix, aggregatedStats, brands, totalPrompts } = data;

  const getBrandColor = (brand: string, index: number) => {
    if (brand === primaryBrand) return PRIMARY_BRAND_COLOR;
    const competitorIndex = brands.filter(
      (b, i) => b !== primaryBrand && i < index
    ).length;
    return COMPETITOR_COLORS[competitorIndex % COMPETITOR_COLORS.length];
  };

  const chartData = useMemo(() => {
    return brands
      .map((brand, index) => ({
        brand: brand === primaryBrand ? `${brand} (You)` : brand,
        originalBrand: brand,
        citationShare: aggregatedStats[brand]?.citationShare || 0,
        promptsWon: aggregatedStats[brand]?.promptsWon || 0,
        totalMentions: aggregatedStats[brand]?.totalMentions || 0,
        color: getBrandColor(brand, index),
        isPrimary: brand === primaryBrand,
      }))
      .sort((a, b) => b.citationShare - a.citationShare);
  }, [brands, aggregatedStats, primaryBrand]);

  const marketLeader = useMemo(() => {
    const sorted = [...brands].sort(
      (a, b) =>
        (aggregatedStats[b]?.citationShare || 0) -
        (aggregatedStats[a]?.citationShare || 0)
    );
    return sorted[0];
  }, [brands, aggregatedStats]);

  const battlegroundPrompts = useMemo(() => {
    return matrix
      .filter((entry) => {
        const presentCount = brands.filter(
          (b) => entry.brandPerformance[b]?.isPresent
        ).length;
        return presentCount >= Math.ceil(brands.length * 0.6);
      })
      .slice(0, 3);
  }, [matrix, brands]);

  const opportunityGaps = useMemo(() => {
    const gaps: Record<string, string[]> = {};
    brands.forEach((brand) => {
      gaps[brand] = matrix
        .filter((entry) => !entry.brandPerformance[brand]?.isPresent)
        .map((entry) => entry.promptText)
        .slice(0, 3);
    });
    return gaps;
  }, [matrix, brands]);

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Share of Voice
          </CardTitle>
          <CardDescription>
            Which brands dominate AI recommendations?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis
                  type="category"
                  dataKey="brand"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Citation Share"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="citationShare" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>
              Total Mentions:{" "}
              <strong className="text-foreground">
                {Object.values(aggregatedStats).reduce(
                  (sum, s) => sum + s.totalMentions,
                  0
                )}
              </strong>
            </span>
            <span>
              Prompts Analyzed:{" "}
              <strong className="text-foreground">{totalPrompts}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Competitive Matrix
          </CardTitle>
          <CardDescription>
            See exactly which brand wins each prompt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-[300px]">Prompt</TableHead>
                  {brands.map((brand, index) => (
                    <TableHead
                      key={brand}
                      className="text-center min-w-[100px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            brand === primaryBrand
                              ? "ring-2 ring-offset-1 ring-green-500"
                              : ""
                          }`}
                          style={{
                            backgroundColor: getBrandColor(brand, index),
                          }}
                        />
                        <span className="text-xs">
                          {brand === primaryBrand ? `${brand} (You)` : brand}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrix.map((entry, idx) => (
                  <TableRow key={entry.promptId} className="border-border">
                    <TableCell className="font-medium text-sm max-w-[300px]">
                      <span className="line-clamp-2">{entry.promptText}</span>
                    </TableCell>
                    {brands.map((brand) => {
                      const perf = entry.brandPerformance[brand];
                      return (
                        <TableCell key={brand} className="text-center">
                          {perf?.isWinner ? (
                            <Badge className="bg-green-500/10 text-green-600 border-0">
                              🏆 {perf.mentionCount}
                            </Badge>
                          ) : perf?.isPresent ? (
                            <Badge className="bg-yellow-500/10 text-yellow-600 border-0">
                              {perf.mentionCount}
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border-0">
                              —
                            </Badge>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                <TableRow className="border-t-2 border-border bg-muted/30">
                  <TableCell className="font-semibold">Total Wins</TableCell>
                  {brands.map((brand, index) => (
                    <TableCell key={brand} className="text-center">
                      <span
                        className="font-bold text-lg"
                        style={{
                          color: getBrandColor(brand, index),
                        }}
                      >
                        {aggregatedStats[brand]?.promptsWon || 0}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Badge className="bg-green-500/10 text-green-600 border-0 text-xs">
                🏆
              </Badge>
              Winner (most mentions)
            </span>
            <span className="flex items-center gap-1">
              <Badge className="bg-yellow-500/10 text-yellow-600 border-0 text-xs">
                #
              </Badge>
              Mentioned
            </span>
            <span className="flex items-center gap-1">
              <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                —
              </Badge>
              Not mentioned
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            💡 Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {marketLeader && aggregatedStats[marketLeader] && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <Trophy className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-600">
                  Market Leader: {marketLeader}
                </p>
                <p className="text-sm text-muted-foreground">
                  Wins {aggregatedStats[marketLeader].promptsWon} out of{" "}
                  {totalPrompts} prompts (
                  {Math.round(
                    (aggregatedStats[marketLeader].promptsWon / totalPrompts) *
                      100
                  )}
                  %)
                </p>
              </div>
            </div>
          )}

          {battlegroundPrompts.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <Target className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-600">
                  Competitive Battlegrounds
                </p>
                <p className="text-sm text-muted-foreground">
                  {battlegroundPrompts.length} prompts where most brands compete
                  directly
                </p>
                <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                  {battlegroundPrompts.map((p, i) => (
                    <li key={i} className="truncate">
                      • {p.promptText}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {brands.map((brand, index) => {
            const gaps = opportunityGaps[brand];
            if (!gaps || gaps.length === 0) return null;
            return (
              <div
                key={brand}
                className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-600">
                    Opportunity Gap: {brand}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Not mentioned in{" "}
                    {aggregatedStats[brand]?.promptsMissed || 0} prompts
                  </p>
                  {gaps.length > 0 && (
                    <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                      {gaps.slice(0, 2).map((g, i) => (
                        <li key={i} className="truncate">
                          • {g}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
