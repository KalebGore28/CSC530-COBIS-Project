import { useLiveQuery } from "@tanstack/react-db";
import { Skeleton } from "@/components/ui/skeleton";
import type { ManagedTableSlug } from "@/hooks/use-table-problems";

import { AcademicStandingTable } from "@/components/tables/academic-standing-table";
import { AdmitCodesTable } from "@/components/tables/admit-codes-table";
import { CollegeTable } from "@/components/tables/college-table";
import { CoursesTable } from "@/components/tables/courses-table";
import { CoursePrefixesTable } from "@/components/tables/course-prefixes-table";
import { DepartmentsTable } from "@/components/tables/departments-table";
import { InstructionalMethodsTable } from "@/components/tables/instructional-methods-table";
import { PartOfTermTable } from "@/components/tables/part-of-term-table";
import { ProgramsTable } from "@/components/tables/programs-table";
import { RegistrationStatusTable } from "@/components/tables/registration-status-table";

import { academicStandingCollection } from "@/integrations/tanstack-db/academic-standing";
import { admitCodesCollection } from "@/integrations/tanstack-db/admit-codes";
import { collegesCollection } from "@/integrations/tanstack-db/colleges";
import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { coursePrefixesCollection } from "@/integrations/tanstack-db/course-prefixes";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { instructionalMethodsCollection } from "@/integrations/tanstack-db/instructional-methods";
import { partOfTermCollection } from "@/integrations/tanstack-db/part-of-term";
import { programsCollection } from "@/integrations/tanstack-db/programs";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";

type FilterProps = {
  filterColumn: string | undefined;
  filterValue: string | undefined;
};

// The editable table for one managed table, used in the Manage Tables side panel
export function ManagedTableContent({
  slug,
  filterColumn,
  filterValue,
}: FilterProps & { slug: ManagedTableSlug }) {
  if (slug === "academic-standings")
    return <AcademicStandingsContent filterColumn={filterColumn} filterValue={filterValue} />;
  if (slug === "admit-codes")
    return <AdmitCodesContent filterColumn={filterColumn} filterValue={filterValue} />;
  if (slug === "colleges")
    return <CollegesContent filterColumn={filterColumn} filterValue={filterValue} />;
  if (slug === "courses")
    return <CoursesContent filterColumn={filterColumn} filterValue={filterValue} />;
  if (slug === "course-prefixes")
    return <CoursePrefixesContent filterColumn={filterColumn} filterValue={filterValue} />;
  if (slug === "departments")
    return <DepartmentsContent filterColumn={filterColumn} filterValue={filterValue} />;
  if (slug === "instructional-methods")
    return <InstructionalMethodsContent filterColumn={filterColumn} filterValue={filterValue} />;
  if (slug === "part-of-terms")
    return <PartOfTermsContent filterColumn={filterColumn} filterValue={filterValue} />;
  if (slug === "programs")
    return <ProgramsContent filterColumn={filterColumn} filterValue={filterValue} />;
  return <RegistrationStatusesContent filterColumn={filterColumn} filterValue={filterValue} />;
}

function AcademicStandingsContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: academicStandingCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return (
    <AcademicStandingTable data={data} filterColumn={filterColumn} filterValue={filterValue} />
  );
}

function AdmitCodesContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: admitCodesCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return <AdmitCodesTable data={data} filterColumn={filterColumn} filterValue={filterValue} />;
}

function CollegesContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: collegesCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return <CollegeTable data={data} filterColumn={filterColumn} filterValue={filterValue} />;
}

function CoursesContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: coursesCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return <CoursesTable data={data} filterColumn={filterColumn} filterValue={filterValue} />;
}

function CoursePrefixesContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: coursePrefixesCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return <CoursePrefixesTable data={data} filterColumn={filterColumn} filterValue={filterValue} />;
}

function DepartmentsContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: departmentsCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return <DepartmentsTable data={data} filterColumn={filterColumn} filterValue={filterValue} />;
}

function InstructionalMethodsContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: instructionalMethodsCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return (
    <InstructionalMethodsTable data={data} filterColumn={filterColumn} filterValue={filterValue} />
  );
}

function PartOfTermsContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: partOfTermCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return <PartOfTermTable data={data} filterColumn={filterColumn} filterValue={filterValue} />;
}

function ProgramsContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: programsCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return <ProgramsTable data={data} filterColumn={filterColumn} filterValue={filterValue} />;
}

function RegistrationStatusesContent({ filterColumn, filterValue }: FilterProps) {
  const { data, isLoading } = useLiveQuery((q) => q.from({ rows: registrationStatusCollection }));
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return (
    <RegistrationStatusTable data={data} filterColumn={filterColumn} filterValue={filterValue} />
  );
}
