import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { GradeBreakdown, GradeGroup } from "@/hooks/use-instructor-teaching";

type Grouping = "overall" | "term" | "course";

const OUTCOMES = ["A", "B", "C", "D", "E", "W"] as const;

const chartConfig = {
  A: { label: "A", color: "var(--chart-1)" },
  B: { label: "B", color: "var(--chart-2)" },
  C: { label: "C", color: "var(--chart-3)" },
  D: { label: "D", color: "var(--chart-4)" },
  E: { label: "E", color: "var(--chart-5)" },
  W: { label: "W", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

export function formatGpa(gpa: number | null) {
  return gpa === null ? "—" : gpa.toFixed(2);
}

export function formatRate(rate: number | null) {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

// Each group's outcomes as a share of its students, so a big class and a small one compare evenly
function percentRow(label: string, grades: GradeBreakdown) {
  const total = OUTCOMES.reduce((sum, outcome) => sum + grades.counts[outcome], 0);
  return {
    label,
    ...Object.fromEntries(
      OUTCOMES.map((outcome) => [outcome, total > 0 ? (grades.counts[outcome] / total) * 100 : 0]),
    ),
  };
}

/**
 * How an instructor's final grades are spread, overall, per term or per course.
 */
export function GradeDistributionCard({
  overall,
  byTerm,
  byCourse,
}: {
  overall: GradeBreakdown;
  byTerm: Array<GradeGroup>;
  byCourse: Array<GradeGroup>;
}) {
  const [grouping, setGrouping] = useState<Grouping>("overall");

  const groups: Array<GradeGroup> =
    grouping === "term"
      ? byTerm
      : grouping === "course"
        ? byCourse
        : [{ key: "overall", label: "All classes", grades: overall }];
  const chartData = groups.map((group) => percentRow(group.label, group.grades));
  const finished = overall.graded + overall.withdrawn;

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle>Grade distribution</CardTitle>
          <CardDescription>
            {finished === 0
              ? "No final grades are in for these terms yet."
              : `Final grades and W's for ${finished.toLocaleString()} students`}
          </CardDescription>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          value={grouping}
          onValueChange={(value) => value && setGrouping(value as Grouping)}
          aria-label="Group grades by"
        >
          {(
            [
              ["overall", "Overall"],
              ["term", "By term"],
              ["course", "By course"],
            ] as const
          ).map(([value, label]) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90 h-(--control-height)"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent className="space-y-4">
        {finished > 0 && (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full"
            // One bar per group, so the chart grows with the number of groups
            style={{ height: Math.max(120, chartData.length * 36 + 60) }}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 8 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={grouping === "overall" ? 90 : 140}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string) =>
                  value.length > 20 ? `${value.slice(0, 19)}…` : value
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span>
                        {name}: {Math.round(Number(value))}%
                      </span>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {OUTCOMES.map((outcome) => (
                <Bar
                  key={outcome}
                  dataKey={outcome}
                  stackId="grades"
                  fill={`var(--color-${outcome})`}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {grouping === "course" ? "Course" : grouping === "term" ? "Term" : ""}
                </TableHead>
                {OUTCOMES.map((outcome) => (
                  <TableHead key={outcome} className="text-right max-md:hidden">
                    {outcome}
                  </TableHead>
                ))}
                <TableHead className="text-right">GPA</TableHead>
                <TableHead className="text-right">DFW</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.key}>
                  <TableCell className="whitespace-normal">{group.label}</TableCell>
                  {OUTCOMES.map((outcome) => (
                    <TableCell key={outcome} className="text-right tabular-nums max-md:hidden">
                      {group.grades.counts[outcome]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right tabular-nums">
                    {formatGpa(group.grades.gpa)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRate(group.grades.dfw_rate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
