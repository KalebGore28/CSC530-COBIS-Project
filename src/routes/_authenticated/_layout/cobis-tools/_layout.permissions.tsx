import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useDbClient, useLiveQuery } from "@tanstack/react-db";
import type { Capability, DataCategory, DataRelationship } from "@/types/access-checks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { roleCapabilitiesCollection } from "@/integrations/tanstack-db/role-capabilities";
import { roleDataAccessCollection } from "@/integrations/tanstack-db/role-data-access";
import { rolesCollection } from "@/integrations/tanstack-db/roles";
import {
  CAPABILITIES,
  DATA_CATEGORIES,
  DATA_RELATIONSHIPS,
  isCapabilityLockedForRole,
  isCategoryLockedForRole,
} from "@/types/access-checks";

const RELATIONSHIP_LABELS: Record<DataRelationship, string> = {
  teaches_course: "Teaches course",
  advises_student: "Advises student",
  coordinates_program: "Coordinates program",
  course_in_department: "Course in my department",
  student_in_department: "Student in my department",
};

const CATEGORY_LABELS: Record<DataCategory, string> = {
  identity: "Name and email",
  demographics: "Gender",
  programs: "Major/program",
  courses: "Courses",
  grades: "Grades",
  attendance: "Attendance",
  academic_info: "GPA, hours and standing",
  advisors: "Advisors",
};

const CAPABILITY_LABELS: Record<Capability, string> = {
  "roster.view": "Class roster",
  "advisees.view": "Advisees",
  "dashboard.metrics": "Dashboard metrics",
  "student.lookup": "Student lookup",
  "instructors.view": "Instructors",
  "enrollment.view": "Enrollment metrics",
  "tools.manage": "COBIS tools",
};

// A category can't be shown without these, so they get ticked and unticked together
function getRequiredCategories(category: DataCategory): Array<DataCategory> {
  if (category === "identity") return [];
  if (category === "grades" || category === "attendance") return ["identity", "courses"];
  return ["identity"];
}

export const Route = createFileRoute("/_authenticated/_layout/cobis-tools/_layout/permissions")({
  beforeLoad: ({ context }) => {
    const dbClient = context.dbClient;
    void dbClient.collection(rolesCollection).preload();
    void dbClient.collection(roleDataAccessCollection).preload();
    void dbClient.collection(roleCapabilitiesCollection).preload();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const dbClient = useDbClient();
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined);

  const { data: roles, isLoading: isRolesLoading } = useLiveQuery((q) =>
    q.from({ role: rolesCollection }).orderBy(({ role }) => role.id, "asc"),
  );
  const { data: dataAccess, isLoading: isDataAccessLoading } = useLiveQuery((q) =>
    q.from({ row: roleDataAccessCollection }),
  );
  const { data: capabilities, isLoading: isCapabilitiesLoading } = useLiveQuery((q) =>
    q.from({ row: roleCapabilitiesCollection }),
  );

  if (isRolesLoading || isDataAccessLoading || isCapabilitiesLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const role = roles.find((r) => r.id === selectedRoleId) ?? roles.at(0);
  if (!role) return null;

  const isTicked = (relationship: DataRelationship, category: DataCategory) =>
    dataAccess.some(
      (row) =>
        row.role_id === role.id && row.relationship === relationship && row.category === category,
    );

  const toggleCategory = (relationship: DataRelationship, category: DataCategory) => {
    const collection = dbClient.collection(roleDataAccessCollection);

    if (isTicked(relationship, category)) {
      // Also untick anything that needs this category
      const toRemove = DATA_CATEGORIES.filter(
        (c) =>
          isTicked(relationship, c) &&
          (c === category || getRequiredCategories(c).includes(category)),
      );
      collection.delete(toRemove.map((c) => `${role.id}-${relationship}-${c}` as const));
      return;
    }

    // Also tick anything this category needs
    const toAdd = [category, ...getRequiredCategories(category)].filter(
      (c) => !isTicked(relationship, c),
    );
    collection.insert(toAdd.map((c) => ({ role_id: role.id, relationship, category: c })));
  };

  const hasCapability = (capability: Capability) =>
    capabilities.some((row) => row.role_id === role.id && row.capability === capability);

  const toggleCapability = (capability: Capability) => {
    const collection = dbClient.collection(roleCapabilitiesCollection);

    if (hasCapability(capability)) {
      collection.delete(`${role.id}-${capability}`);
    } else {
      collection.insert({ role_id: role.id, capability });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role</CardTitle>
          <CardDescription>
            Changes save right away. The API uses them on the next request, and users&apos; menus
            update within 5 minutes. Anyone who teaches or advises gets the faculty or advisor role
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={String(role.id)}
            onValueChange={(value) => setSelectedRoleId(Number(value))}
          >
            <SelectTrigger className="w-64" aria-label="Role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student data</CardTitle>
          <CardDescription>
            What this role can see, and through which connection to the student. Course connections
            only reach the matching course, and every connection only reaches the terms where it
            exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                {DATA_RELATIONSHIPS.map((relationship) => (
                  <TableHead key={relationship} className="text-center whitespace-normal">
                    {RELATIONSHIP_LABELS[relationship]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {DATA_CATEGORIES.map((category) => (
                <TableRow key={category}>
                  <TableCell className="font-medium">{CATEGORY_LABELS[category]}</TableCell>
                  {DATA_RELATIONSHIPS.map((relationship) => (
                    <TableCell key={relationship}>
                      <div className="flex justify-center">
                        <Checkbox
                          aria-label={`${CATEGORY_LABELS[category]}: ${RELATIONSHIP_LABELS[relationship]}`}
                          checked={isTicked(relationship, category)}
                          disabled={isCategoryLockedForRole(role.name, category)}
                          onCheckedChange={() => toggleCategory(relationship, category)}
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App features</CardTitle>
          <CardDescription>Which pages and tools this role can use.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {CAPABILITIES.map((capability) => (
            <div key={capability} className="flex items-center gap-2">
              <Checkbox
                id={capability}
                checked={hasCapability(capability)}
                disabled={isCapabilityLockedForRole(role.name, capability)}
                onCheckedChange={() => toggleCapability(capability)}
              />
              <Label htmlFor={capability}>{CAPABILITY_LABELS[capability]}</Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
