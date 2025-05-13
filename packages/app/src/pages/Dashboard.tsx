import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSession } from "@/context/session";
import { useRoleContext } from "@/context/role";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  LineChart,
  BarChart3,
  FileText,
  Telescope
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  GradeDistributions,
  GradeDistributionData,
} from "@/components/charts/term-grade-distributions";

type CurrentTermResponse = {
  term: string;
  year: number;
  termName: string;
};

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

export default function Dashboard() {
  const { session } = useSession();
  const { selectedRole, routePermissions } = useRoleContext();

  const [currentTerm, setCurrentTerm] = useState<CurrentTermResponse | null>(
    null,
  );
  const [gradeDistributions, setGradeDistributions] = useState<
    GradeDistributionData[]
  >([]);

  // --- API Fetching Logic ---
  const fetchCurrentTerm = async () => {
    try {
      const response = await axios.get<CurrentTermResponse>(
        "/api/utility/current-term",
        { withCredentials: true },
      );
      setCurrentTerm(response.data);
      return response.data;
    } catch (error) {
      toast.error("Failed to load current term information");
      return null;
    }
  };

  const fetchGradeDistributions = async (offset: number) => {
    if (!session?.info?.mnumber || !currentTerm) {
      console.warn(
        "Skipping grade distribution fetch: Missing M-number or current term.",
      );
      setGradeDistributions([]);
      return;
    }
    try {
      const response = await axios.get<{ gradeTrends: Array<any> }>(
        `/api/instructor/${session.info.mnumber}/trend/grades`,
        {
          params: {
            start_year: currentTerm.year + offset,
            end_year: currentTerm.year,
          },
          withCredentials: true,
        },
      );

      // --- Data Transformation ---
      const transformedData = response.data.gradeTrends.map((trend: any) => {
        const defaultDist = {
          A: { count: 0, percentage: 0 },
          B: { count: 0, percentage: 0 },
          C: { count: 0, percentage: 0 },
          D: { count: 0, percentage: 0 },
          F: { count: 0, percentage: 0 },
          "N/A": { count: 0, percentage: 0 },
        };
        const distribution =
          Object.keys(trend.distribution || {}).length === 0
            ? defaultDist
            : trend.distribution;
        return {
          term: trend.term,
          year: trend.year,
          totalStudents: trend.totalStudents || 0,
          distribution: distribution,
        };
      });
      setGradeDistributions(transformedData);
    } catch (error) {
      toast.error("Failed to load grade distributions");
      setGradeDistributions([]);
    }
  };

  // --- useEffect Hooks ---
  useEffect(() => {
    fetchCurrentTerm();
  }, []);

  useEffect(() => {
    // Determine if the user should see the grade component based on the local constant
    const shouldViewGrades =
      selectedRole && gradeDistributionRoles.includes(selectedRole.name);

    // Fetch grades only if term is known AND the user's role is allowed
    if (currentTerm && shouldViewGrades) {
      fetchGradeDistributions(-1);
    } else {
      // Clear data if user shouldn't see it, role isn't selected, or term unknown
      setGradeDistributions([]);
    }
  }, [currentTerm, selectedRole]); // Depend on role change

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
          <GradeDistributions
            data={gradeDistributions}
            onTimeRangeChange={(offset: number) => {
              fetchGradeDistributions(offset);
            }}
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
