import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, LineChart, BarChart3, Telescope, School, Contact, ChartColumnIncreasing } from "lucide-react";
import { useSession } from "@/components/provider/session";
import { hasRouteAccess } from '@/components/provider/session';
import { TermGradeDistribution } from '@/components/charts/term-grade-distributions';
import { useCurrentTerm } from '@/providers/current-term-provider';

export const Route = createFileRoute('/_authenticated/_layout/dashboard/')({
    component: DashboardPage,
})

const gradeDistributionRoles = ["faculty", "department_chair"];

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
        link: "/cobis-tools/import",
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
    const { session } = useSession();
    if (!session) return null;

    const { isLoading } = useCurrentTerm();

    // Filter cards based on user roles and route permissions
    const visibleCards = dashboardCardsStructure.filter(card =>
        hasRouteAccess(card.link, session.roles)
    );

    return (
        <div className="container p-6 mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">

                <h2 className="col-span-full text-center font-bold text-2xl">
                    Welcome Back, {session?.user.name}
                </h2>
                <p className="text-muted-foreground col-span-full text-center">
                    Access your tools and information from this dashboard
                </p>
            </div>

            <Separator />

            {gradeDistributionRoles.some(role => session.roles.includes(role)) && !isLoading &&
                <TermGradeDistribution mnumber={session.mnumber!} title="Term Grade Distributions" description="View the distribution of class grades over your recent terms." />
            }

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCards.map((card) => (
                    <Card key={card.link} className="transition-all hover:shadow-md">
                        <CardHeader className="text-center pt-6">
                            <div className="flex justify-center">{card.icon}</div>
                            <CardTitle>{card.title}</CardTitle>
                            <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-6">
                            <Link to={card.link} className='cursor-pointer'>
                                <Button variant="default">{card.buttonText}</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

        </div>
    )
}
