import React, { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  LineChart,
  BarChart3,
  FileText,
  Telescope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSession } from "@/context/session";
import { useRoleContext } from "@/context/role";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { GradeDistribution } from "@/components/charts/term-grade-distributions";
import { Skeleton } from "@/components/ui/skeleton";


// Custom skeleton for Dashboard
const DashboardSkeleton: React.FC = () => (
  <div className="p-6">
    <div className="flex flex-col items-center space-y-2 mb-8">
      <Skeleton className="h-10 w-[300px] mb-2" />
      <Skeleton className="h-7 w-[250px] mb-2" />
      <Skeleton className="h-5 w-[220px]" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, index) => (
        <Card key={index} className="transition-all hover:shadow-md">
          <CardHeader className="text-center pt-6">
            <Skeleton className="h-8 w-[100px] mb-4" />
            <Skeleton className="h-8 w-[200px] mb-4" />
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Skeleton className="h-8 w-[150px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);


export const Dashboard: React.FC = () => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

const gradeDistributionRoles = ["Faculty", "Department Chair"];

// Define dashboard cards structure - uses routePermissions for visibility
const dashboardCardsStructure = [
  {
    title: "Student Lookup",
    description:
      "Search for students by name, ID, department, major, minor, GPA, or previous classes.",
    icon: <Users className="h-8 w-8 mb-4 text-primary" />,
    link: "/students/lookup",
    buttonText: "Search Students",
  },
  {
    title: "Class Roster",
    description:
      "View and manage class rosters, including attendance and grades.",
    icon: <Users className="h-8 w-8 mb-4 text-primary" />,
    link: "/class-roster",
    buttonText: "View Roster",
  },
  {
    title: "Faculty Information",
    description:
      "View teaching loads, course enrollment, and student counts for faculty in your department.",
    icon: <BookOpen className="h-8 w-8 mb-4 text-primary" />,
    link: "/instructors",
    buttonText: "View Faculty",
  },
  {
    title: "Student Reports",
    description:
      "Generate and view reports on student performance, enrollment, and academic progress.",
    icon: <FileText className="h-8 w-8 mb-4 text-primary" />,
    link: "/reports/students",
    buttonText: "View Reports",
  },
  // {
  //   title: "Query Builder",
  //   description:
  //     "Create custom database queries for advanced data analysis and reporting.",
  //   icon: <Database className="h-8 w-8 mb-4 text-primary" />,
  //   link: "/cobis-tools/query-builder",
  //   buttonText: "Open Query Builder",
  // },
  {
    title: "Data Import Tools",
    description:
      "Import and manage data from external sources for system integration.",
    icon: <BarChart3 className="h-8 w-8 mb-4 text-primary" />,
    link: "/cobis-tools/imports",
    buttonText: "Access Import Tools",
  },
  {
    title: "Academic Analytics",
    description:
      "Analyze student performance metrics and educational outcomes.",
    icon: <LineChart className="h-8 w-8 mb-4 text-primary" />,
    link: "/reports",
    buttonText: "View Analytics",
  },
  {
    title: "Advisor Page",
    description:
      "Access tools and information specific to academic advising.",
    icon: <Telescope className="h-8 w-8 mb-4 text-primary" />,
    link: "/advisor-page",
    buttonText: "Go to Advisor Page",
  },
  {
    title: "User Management",
    description: "Manage user accounts, roles, and permissions.",
    icon: <Users className="h-8 w-8 mb-4 text-primary" />,
    link: "/cobis-tools/users",
    buttonText: "Manage Users",
  }
];

const DashboardContent: React.FC = () => {
  const { session } = useSession();
  const { selectedRole, routePermissions } = useRoleContext();


  // --- Visibility Logic ---

  // Filter standard cards based on routePermissions from context
  const filteredCards = dashboardCardsStructure.filter((card) => {
    // Ensure context data is available and the specific route has permissions defined
    if (!selectedRole || !routePermissions || !routePermissions[card.link])
      return false;
    return routePermissions[card.link].includes(selectedRole.name);
  });

  // Determine Grade Distribution visibility based on the LOCAL constant
  const canViewGradeDistribution =
    selectedRole && gradeDistributionRoles.includes(selectedRole.name);

  return (
    <div className="p-6">
      <div className="flex flex-col items-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome Back, {session?.session.data?.user.name}
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl text-center">
          Access your tools and information from this dashboard
        </p>
      </div>

      {/* Conditionally Render Grade Distribution (uses local constant check) */}
      {canViewGradeDistribution && (
        <>
          <GradeDistribution
            mnumber={session?.info?.mnumber || ""}
          />
          <Separator className="my-6" />
        </>
      )}

      {/* Grid for standard cards (uses routePermissions check) */}
      {filteredCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <Card key={card.link} className="transition-all hover:shadow-md">
              <CardHeader className="text-center pt-6">
                <div className="flex justify-center">{card.icon}</div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Link to={card.link}>
                  <Button variant="default">{card.buttonText}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message if no cards are visible */}
      {!canViewGradeDistribution && filteredCards.length === 0 && (
        <div className="text-center p-12 text-muted-foreground mt-8">
          <p className="text-lg">
            No dashboard items are currently available for your selected role.
          </p>
          <p>
            Please contact the administrator if you believe this is an error.
          </p>
        </div>
      )}
    </div>
  );
}
