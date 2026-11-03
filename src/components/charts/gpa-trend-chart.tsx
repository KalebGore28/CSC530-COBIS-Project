import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  overall_gpa: {
    label: "Overall",
    color: "var(--chart-1)",
  },
  msu_gpa: {
    label: "MSU",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

// One point per term, oldest first
export type GPATrendPoint = {
  overall_gpa: number | null;
  msu_gpa: number | null;
  year_term: string;
};

export function GPATrendChart({ gpaTrend }: { gpaTrend: Array<GPATrendPoint> }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <LineChart accessibilityLayer data={gpaTrend} margin={{ left: -20, right: 28 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="year_term" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="overall_gpa"
          type="monotone"
          stroke="var(--color-overall_gpa)"
          strokeWidth={2}
          connectNulls
        />
        <Line
          dataKey="msu_gpa"
          type="monotone"
          stroke="var(--color-msu_gpa)"
          strokeWidth={2}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
}
