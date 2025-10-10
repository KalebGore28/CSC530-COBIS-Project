import { createFileRoute } from '@tanstack/react-router'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Users,
    LineChart,
    BarChart3,
    Telescope,
    School,
    Contact,
    ChartColumnIncreasing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSession } from "@/context/session";
import { useRoleContext } from "@/context/role";
import { Separator } from "@/components/ui/separator";
// import { GradeDistribution } from "@/components/charts/term-grade-distributions";

export const Route = createFileRoute('/_authenticated/_layout/dashboard/')({
    component: DashboardPage,
})

const gradeDistributionRoles = ["Faculty", "Department Chair"];

// Define dashboard cards structure - uses routePermissions for visibility
const dashboardCardsStructure = [
    {
        title: "Student Lookup",
        description:
            "Search for students by name, ID, department, major, minor, GPA, or previous classes.",
        icon: <Users className="h-8 w-8 mb-4 text-primary" />,
        link: "/student-lookup",
        buttonText: "Search Students",
    },
    {
        title: "Class Roster",
        description:
            "View and manage class rosters, including attendance and grades.",
        icon: <School className="h-8 w-8 mb-4 text-primary" />,
        link: "/class-roster",
        buttonText: "View Roster",
    },
    {
        title: "Faculty Information",
        description:
            "View teaching loads, course enrollment, and student counts for faculty in your department.",
        icon: <Contact className="h-8 w-8 mb-4 text-primary" />,
        link: "/instructors",
        buttonText: "View Faculty",
    },
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
    },
    {
        title: "Enrollments",
        description: "See enrollment reports for programs, courses, and faculty.",
        icon: <ChartColumnIncreasing className="h-8 w-8 mb-4 text-primary" />,
        link: "/enrollment",
        buttonText: "View Enrollments",
    }
];

function DashboardPage() {
    return (
        <div className="p-4">
            <h1>Dashboard</h1>
            <p>This content renders inside the Outlet of /</p>
        </div>
    )
}
