import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SearchIcon, UsersIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SortableTable } from "@/components/tables/sortable-table";
import type { SortableColumnDef } from "@/components/tables/sortable-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdviseePanel } from "@/components/advisees/advisee-panel";
import { AttentionBadges, fullName, needsAttention } from "@/components/advisees/attention-badges";
import { useAdvisees } from "@/hooks/use-advisees";
import type { Advisee } from "@/hooks/use-advisees";
import { useAuthentication } from "@/lib/auth-client";
import { requirePageCapability } from "@/lib/page-guards";
import { useCurrentTerm } from "@/providers/current-term-provider";

export const Route = createFileRoute("/_authenticated/_layout/advisees")({
  beforeLoad: ({ context }) => {
    requirePageCapability(context.userSession, "advisees.view");
  },
  // The open student lives in the URL, so Back closes the panel and a link can open it directly
  validateSearch: (search): AdviseesSearch => ({
    student: typeof search.student === "string" ? search.student : undefined,
  }),
  component: RouteComponent,
  context: () => ({ getTitle: () => "Advisees" }),
});

type AdviseesSearch = { student?: string };

type AdviseeFilter = "all" | "attention" | "low_gpa" | "standing" | "not_registered";

function matchesFilter(advisee: Advisee, filter: AdviseeFilter) {
  if (filter === "attention") return needsAttention(advisee);
  if (filter === "low_gpa") return advisee.low_gpa;
  if (filter === "standing") return advisee.needs_standing_review;
  if (filter === "not_registered") return advisee.not_registered;
  return true;
}

function matchesSearch(advisee: Advisee, search: string) {
  const text = search.trim().toLowerCase();
  if (!text) return true;
  return [advisee.first_name, advisee.last_name, advisee.mnumber, advisee.email ?? ""].some(
    (value) => value.toLowerCase().includes(text),
  );
}

// A few students list many programs, so only the first is spelled out
function ProgramSummary({ advisee }: { advisee: Advisee }) {
  const [first, ...rest] = advisee.programs;
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

const columns: Array<SortableColumnDef<Advisee>> = [
  {
    id: "student",
    header: "Student",
    accessorFn: (row) => `${row.last_name}, ${row.first_name}`,
    cell: ({ row }) => (
      <div className="space-y-1 whitespace-normal">
        <div>
          <div className="font-medium">{fullName(row.original)}</div>
          <div className="text-muted-foreground text-xs">{row.original.mnumber}</div>
        </div>
        {/* The attention column is hidden on phones, so the badges sit under the name there */}
        <div className="md:hidden">
          <AttentionBadges advisee={row.original} />
        </div>
      </div>
    ),
  },
  {
    id: "program",
    header: "Program",
    accessorFn: (row) => row.programs[0]?.description,
    cell: ({ row }) => <ProgramSummary advisee={row.original} />,
    meta: { hideOnMobile: true },
  },
  {
    id: "class_level",
    header: "Level",
    accessorFn: (row) => row.class_level ?? undefined,
    cell: ({ row }) => row.original.class_level ?? "—",
    meta: { hideOnMobile: true },
  },
  {
    id: "gpa",
    header: "GPA",
    accessorFn: (row) => row.overall_gpa ?? undefined,
    cell: ({ row }) => row.original.overall_gpa?.toFixed(2) ?? "—",
    meta: { numeric: true },
  },
  {
    id: "hours",
    header: "Hours",
    accessorFn: (row) => row.hours,
    meta: { numeric: true },
  },
  {
    id: "attention",
    header: "Needs attention",
    // Sorts the students with the most reasons to check in first
    accessorFn: (row) =>
      Number(row.low_gpa) + Number(row.needs_standing_review) + Number(row.not_registered),
    cell: ({ row }) => <AttentionBadges advisee={row.original} />,
    meta: { hideOnMobile: true },
  },
];

function AdviseesMessage({ title, description }: { title: string; description: string }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UsersIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function RouteComponent() {
  const { userSession } = useAuthentication();
  const { currentTerm, isLoading: termLoading } = useCurrentTerm();
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<AdviseeFilter>("all");
  const search: AdviseesSearch = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { advisees, isLoading } = useAdvisees(userSession?.user.mnumber ?? "", currentTerm);

  if (!userSession || termLoading || isLoading) {
    return (
      <div className="container mx-auto space-y-4 py-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const termLabel = `${currentTerm.description} ${currentTerm.year}`;

  if (advisees.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <AdviseesMessage
          title="No advisees this term"
          description={`You aren't assigned any advisees for ${termLabel}.`}
        />
      </div>
    );
  }

  const filterCounts: Record<AdviseeFilter, number> = {
    all: advisees.length,
    attention: advisees.filter(needsAttention).length,
    low_gpa: advisees.filter((advisee) => advisee.low_gpa).length,
    standing: advisees.filter((advisee) => advisee.needs_standing_review).length,
    not_registered: advisees.filter((advisee) => advisee.not_registered).length,
  };
  const filterLabels: Record<AdviseeFilter, string> = {
    all: "All",
    attention: "Needs attention",
    low_gpa: "Low GPA",
    standing: "Standing",
    not_registered: "Not registered",
  };

  // Only a student in this list opens, so an M-Number in the URL that isn't an advisee does nothing
  const openAdvisee = advisees.find((advisee) => advisee.mnumber === search.student);

  const shown = advisees.filter(
    (advisee) => matchesFilter(advisee, filter) && matchesSearch(advisee, searchText),
  );

  return (
    <div className="container mx-auto space-y-4 py-6">
      <div>
        <h1 className="text-xl font-semibold">Advisees</h1>
        <p className="text-muted-foreground text-sm">
          {advisees.length} {advisees.length === 1 ? "student" : "students"} for {termLabel}
          {filterCounts.attention > 0 && ` · ${filterCounts.attention} need attention`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="w-72 max-md:w-full">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search name, M-Number or email"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="Search advisees"
          />
        </InputGroup>

        <ToggleGroup
          type="single"
          variant="outline"
          value={filter}
          // Clicking the active filter again would clear it, so that's ignored
          onValueChange={(value) => value && setFilter(value as AdviseeFilter)}
          className="flex-wrap"
          aria-label="Filter advisees"
        >
          {(Object.keys(filterLabels) as Array<AdviseeFilter>).map((key) => (
            <ToggleGroupItem
              key={key}
              value={key}
              disabled={key !== "all" && filterCounts[key] === 0}
              // The toggle's own "on" style matches its hover, so the active filter is filled in to stand out
              className="data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90 h-(--control-height)"
            >
              {filterLabels[key]}
              <span className="text-muted-foreground group-data-[state=on]/toggle:text-primary-foreground/80 tabular-nums">
                {filterCounts[key]}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <SortableTable
            columns={columns}
            data={shown}
            initialSorting={[{ id: "attention", desc: true }]}
            emptyMessage="No advisees match your search."
            onRowClick={(advisee) => void navigate({ search: { student: advisee.mnumber } })}
          />
        </CardContent>
      </Card>

      <Sheet
        open={!!openAdvisee}
        onOpenChange={(open) => {
          if (!open) void navigate({ search: {} });
        }}
      >
        <SheetContent className="bg-background gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          {openAdvisee && (
            <>
              <SheetHeader className="pr-12">
                <SheetTitle>{fullName(openAdvisee)}</SheetTitle>
                <SheetDescription>{openAdvisee.mnumber}</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-auto px-4 pb-6">
                {/* Keyed so switching students starts each panel's queries fresh */}
                <AdviseePanel key={openAdvisee.mnumber} advisee={openAdvisee} term={currentTerm} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
