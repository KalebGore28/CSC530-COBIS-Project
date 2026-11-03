import { Badge } from "@/components/ui/badge";
import type { Advisee } from "@/hooks/use-advisees";

export function needsAttention(advisee: Advisee) {
  return advisee.low_gpa || advisee.needs_standing_review || advisee.not_registered;
}

export function fullName(advisee: Advisee) {
  return `${advisee.first_name} ${advisee.last_name}${advisee.suffix ? ` ${advisee.suffix}` : ""}`;
}

export function AttentionBadges({ advisee }: { advisee: Advisee }) {
  if (!needsAttention(advisee)) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {advisee.low_gpa && <Badge variant="destructive">Low GPA</Badge>}
      {advisee.needs_standing_review && <Badge variant="outline">{advisee.standing}</Badge>}
      {advisee.not_registered && <Badge variant="secondary">Not registered</Badge>}
    </div>
  );
}
