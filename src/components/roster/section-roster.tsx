import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DownloadIcon, SearchIcon } from "lucide-react";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SortableTable } from "@/components/tables/sortable-table";
import type { SortableColumnDef } from "@/components/tables/sortable-table";
import { LETTER_GRADES, useSectionRoster } from "@/hooks/use-roster";
import type { GradeSummary, RosterStudent } from "@/hooks/use-roster";

type Term = { year: number; term_id: string; description: string };

const chartConfig = {
  students: { label: "Students", color: "var(--chart-1)" },
} satisfies ChartConfig;

function fullName(student: RosterStudent) {
  return `${student.first_name} ${student.last_name}${student.suffix ? ` ${student.suffix}` : ""}`;
}

function formatGrade(grade: string | null, visible: boolean) {
  if (!visible) return "Hidden";
  return grade ?? "—";
}

function formatAverage(summary: GradeSummary) {
  return summary.average === null ? "—" : summary.average.toFixed(2);
}

function SummaryTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="gap-1 py-(--card-padding)">
      <CardHeader className="px-(--card-padding)">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground px-(--card-padding) text-xs">
        {detail}
      </CardContent>
    </Card>
  );
}

// A student's programs, majors first, cut down when there are many
function ProgramSummary({ student }: { student: RosterStudent }) {
  const [first, ...rest] = student.programs;
  if (!first) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="max-w-56 whitespace-normal">
      <div>{first.description}</div>
      <div className="text-muted-foreground text-xs">
        {first.type === "MAJOR" ? "Major" : "Minor"}
        {rest.length > 0 && ` · ${rest.length} more`}
      </div>
    </div>
  );
}

const columns: Array<SortableColumnDef<RosterStudent>> = [
  {
    id: "student",
    header: "Student",
    accessorFn: (row) => `${row.last_name}, ${row.first_name}`,
    cell: ({ row }) => (
      <div className="whitespace-normal">
        <div className="font-medium">{fullName(row.original)}</div>
        <div className="text-muted-foreground text-xs">
          {row.original.mnumber}
          {/* Says why a faded row is there */}
          {!row.original.enrolled && row.original.status && ` · ${row.original.status}`}
        </div>
      </div>
    ),
  },
  {
    id: "programs",
    header: "Programs",
    accessorFn: (row) => row.programs[0]?.description,
    cell: ({ row }) => <ProgramSummary student={row.original} />,
    meta: { hideOnMobile: true },
  },
  {
    id: "midterm",
    header: "Midterm",
    // Letters sort A first, and hidden or missing grades go last
    accessorFn: (row) => (row.grades_visible ? (row.midterm_grade ?? undefined) : undefined),
    cell: ({ row }) => formatGrade(row.original.midterm_grade, row.original.grades_visible),
  },
  {
    id: "final",
    header: "Final",
    accessorFn: (row) => (row.grades_visible ? (row.final_grade ?? undefined) : undefined),
    cell: ({ row }) => formatGrade(row.original.final_grade, row.original.grades_visible),
  },
  {
    id: "last_attendance",
    header: "Last attended",
    accessorFn: (row) =>
      row.last_attendance ? new Date(row.last_attendance).getTime() : undefined,
    cell: ({ row }) =>
      row.original.last_attendance
        ? new Date(row.original.last_attendance).toLocaleDateString()
        : "—",
    meta: { hideOnMobile: true },
  },
  {
    id: "email",
    header: "Email",
    accessorFn: (row) => row.email ?? undefined,
    cell: ({ row }) =>
      row.original.email ? (
        <a href={`mailto:${row.original.email}`} className="hover:underline">
          {row.original.email}
        </a>
      ) : (
        "—"
      ),
    meta: { hideOnMobile: true },
  },
];

function exportRoster(students: Array<RosterStudent>, filename: string) {
  const csv = Papa.unparse(
    students.map((student) => ({
      "M-Number": student.mnumber,
      "Last name": student.last_name,
      "First name": student.first_name,
      Email: student.email ?? "",
      Programs: student.programs
        .map(
          (program) => `${program.description} (${program.type === "MAJOR" ? "Major" : "Minor"})`,
        )
        .join("; "),
      "Midterm grade": formatGrade(student.midterm_grade, student.grades_visible),
      "Final grade": formatGrade(student.final_grade, student.grades_visible),
      Status: student.enrolled ? "Enrolled" : (student.status ?? "Not enrolled"),
    })),
  );

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * One section's class summary, grade chart and roster.
 * Takes the instructor so other pages, like an instructor's teaching history, can show the same view.
 */
export function SectionRoster({
  instructorMnumber,
  term,
  courseId,
  section,
  title,
}: {
  instructorMnumber: string;
  term: Term;
  courseId: string;
  section: string;
  title: string;
}) {
  const { students, summary, isLoading } = useSectionRoster(
    instructorMnumber,
    term,
    courseId,
    section,
  );
  const [search, setSearch] = useState("");
  const [showDropped, setShowDropped] = useState(false);
  const [chartGrade, setChartGrade] = useState<"final" | "midterm">("final");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const text = search.trim().toLowerCase();
  const shown = students.filter(
    (student) =>
      (showDropped || student.enrolled) &&
      (!text ||
        [student.first_name, student.last_name, student.mnumber, student.email ?? ""].some(
          (value) => value.toLowerCase().includes(text),
        )),
  );

  const chartSummary = chartGrade === "final" ? summary.final : summary.midterm;
  const chartData = LETTER_GRADES.map((grade) => ({
    grade,
    students: chartSummary.counts[grade],
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          {courseId}-{section} · {title}
        </h2>
        <p className="text-muted-foreground text-sm">
          {term.description} {term.year}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryTile
          label="Enrolled"
          value={summary.enrolled.toLocaleString()}
          detail={
            summary.dropped > 0
              ? `${summary.dropped} dropped or withdrawn`
              : "No drops or withdrawals"
          }
        />
        <SummaryTile
          label="Class GPA"
          value={formatAverage(summary.final)}
          detail={`${summary.final.graded} of ${summary.enrolled} final grades in`}
        />
        <SummaryTile
          label="Midterm average"
          value={formatAverage(summary.midterm)}
          detail={`${summary.midterm.graded} of ${summary.enrolled} midterm grades in`}
        />
        <SummaryTile
          label="Credit hours"
          value={summary.credit_hours.toLocaleString()}
          detail="From enrolled students"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>Grade distribution</CardTitle>
            <CardDescription>
              {chartSummary.graded === 0
                ? "No grades are in yet."
                : `${chartSummary.graded} ${chartGrade} ${chartSummary.graded === 1 ? "grade" : "grades"} from enrolled students`}
            </CardDescription>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={chartGrade}
            onValueChange={(value) => value && setChartGrade(value as "final" | "midterm")}
            aria-label="Grades to show"
          >
            {(["final", "midterm"] as const).map((value) => (
              <ToggleGroupItem
                key={value}
                value={value}
                className="data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90 h-(--control-height) capitalize"
              >
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ left: -20 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="grade" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="students" fill="var(--color-students)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="w-72 max-md:w-full">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search name, M-Number or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search the roster"
          />
        </InputGroup>
        {summary.dropped > 0 && (
          <div className="flex items-center gap-2">
            <Switch id="show-dropped" checked={showDropped} onCheckedChange={setShowDropped} />
            <Label htmlFor="show-dropped">Show drops and withdrawals ({summary.dropped})</Label>
          </div>
        )}
        <Button
          variant="outline"
          className="ml-auto max-md:ml-0 max-md:w-full"
          onClick={() =>
            exportRoster(
              shown,
              `${courseId}-${section}_${term.description}_${term.year}_roster.csv`,
            )
          }
        >
          <DownloadIcon />
          Export CSV
        </Button>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <SortableTable
            columns={columns}
            data={shown}
            initialSorting={[{ id: "student", desc: false }]}
            emptyMessage={
              students.length === 0
                ? "No students in this section."
                : "No students match your search."
            }
            rowClassName={(student) => (student.enrolled ? undefined : "text-muted-foreground")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
