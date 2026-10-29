import { useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ImportCard() {
  const navigate = useNavigate();

  return (
    <Card
      className="h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={() => navigate({ to: "/cobis-tools/import" })}
    >
      <CardHeader className="h-full">
        <div className="mb-2 flex items-center gap-2">
          <Upload className="h-6 w-6" />

          <CardTitle>Import Data</CardTitle>
        </div>
        <CardDescription>
          <span>Begin a new import process to add or update data in the system</span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
