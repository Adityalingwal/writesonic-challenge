import { Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Citation } from "@/api";

interface TopCitedSourcesProps {
  citations: Citation[];
}

export function TopCitedSources({ citations }: TopCitedSourcesProps) {
  return (
    <Card className="bg-card border-border mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Top Cited Sources
        </CardTitle>
        <CardDescription>
          Websites most frequently cited by AI in responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {citations && citations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Source Domain</TableHead>
                <TableHead className="text-right">Citations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(
                citations
                  .filter((c) => c.domain)
                  .reduce((acc: Record<string, number>, curr) => {
                    const domain = curr.domain as string;
                    acc[domain] = (acc[domain] || 0) + 1;
                    return acc;
                  }, {})
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([domain, count], idx) => (
                  <TableRow key={idx} className="border-border">
                    <TableCell className="font-medium">{domain}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No citations found in responses.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
