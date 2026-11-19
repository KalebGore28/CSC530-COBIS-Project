import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ACCESS_REASONS } from "@/lib/access-reasons";
import type { DataRelationship } from "@/types/access-checks";

/**
 * A small label for why the viewer can see a student, shown only when it sets them apart from the
 * rest of the table. Hovering lists every reason; the student sheet explains them in full.
 */
export function AccessChip({
  shown,
  all,
}: {
  // The reasons that set this student apart; the first is the label
  shown: ReadonlyArray<DataRelationship>;
  // Every reason, for the tooltip
  all: ReadonlyArray<DataRelationship>;
}) {
  const [first] = shown;
  if (!first) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Focusable, so keyboard users can reach the tooltip too */}
        <Badge variant="outline" tabIndex={0} className="cursor-default text-[0.7rem] font-normal">
          {ACCESS_REASONS[first].label}
          {shown.length > 1 && <span className="text-muted-foreground">+{shown.length - 1}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        <p className="mb-1 font-medium">Why you can see them</p>
        <ul className="space-y-0.5">
          {all.map((reason) => (
            <li key={reason}>{ACCESS_REASONS[reason].description}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
