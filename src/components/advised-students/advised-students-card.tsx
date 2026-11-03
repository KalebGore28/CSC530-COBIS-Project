import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAdvisees } from "@/hooks/use-advisees";

type CurrentTerm = {
  year: number;
  term_id: string;
  description: string | undefined;
};

type AdvisedStudentsCardProps = {
  advisorMnumber: string;
  term_info: CurrentTerm;
  setModalOpen?: (open: boolean) => void;
  setSelectedStudent?: (mnumber: string) => void;
};

export function AdvisedStudentsCard({
  advisorMnumber,
  term_info,
  setModalOpen,
  setSelectedStudent,
}: AdvisedStudentsCardProps) {
  const { advisees: advisedStudents } = useAdvisees(advisorMnumber, term_info);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{advisedStudents.length} Advised Students</CardTitle>
        <CardDescription>
          Term: {term_info.description} {term_info.year}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <div className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>M-Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advisedStudents.length > 0 ? (
                advisedStudents.map((s) => (
                  <TableRow
                    key={s.mnumber}
                    className="hover:bg-muted/50 cursor-pointer transition"
                    onClick={() => {
                      setSelectedStudent && setSelectedStudent(s.mnumber);
                      setModalOpen && setModalOpen(true);
                    }}
                  >
                    <TableCell>{s.mnumber}</TableCell>
                    <TableCell className="max-w-30 truncate">
                      {`${s.last_name}, ${s.first_name}${s.suffix ? " " + s.suffix : ""}`}
                    </TableCell>
                    <TableCell className="max-w-30 truncate">
                      {s.email && (
                        <a href={`mailto:${s.email}`} className="hover:underline">
                          {s.email}
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    No advised students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
