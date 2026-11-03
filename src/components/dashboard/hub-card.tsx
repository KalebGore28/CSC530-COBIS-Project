import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type HubStat = {
  label: string;
  value: string;
  // A short line under the number, like a change from last year
  detail?: string;
};

/**
 * One area of the app on the dashboard: a few live numbers, and links into the pages that explain them.
 * Links are passed as children so each one keeps the router's typed `to` and `search`.
 */
export function HubCard({
  icon,
  title,
  description,
  stats,
  isLoading,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: Array<HubStat>;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 [&_svg]:size-4">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: Math.max(stats.length, 2) }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-muted-foreground text-xs">{stat.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{stat.value}</dd>
                {stat.detail && <dd className="text-muted-foreground text-xs">{stat.detail}</dd>}
              </div>
            ))}
          </dl>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t">{children}</CardFooter>
    </Card>
  );
}
