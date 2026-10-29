import { isNull, useLiveQuery } from "@tanstack/react-db";
import { useNavigate } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { usersCollection } from "@/integrations/tanstack-db/users";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const now = new Date();

const last7Days = new Date();
last7Days.setDate(now.getDate() - 7);

export function UserManangementCard() {
  const navigate = useNavigate();
  const { data: newUsers, isLoading: newUsersLoading } = useLiveQuery((q) =>
    q.from({ users: usersCollection }).where(({ users }) => isNull(users.mnumber)),
  );

  const { data: lastLogins, isLoading: lastLoginsLoading } = useLiveQuery((q) =>
    q.from({ users: usersCollection }),
  );

  if (newUsersLoading || lastLoginsLoading) return null;

  const hasNewUsers = newUsers.length > 0;

  const totalLatestLogins = lastLogins.reduce((sum, user) => {
    if (user.lastLogin === null) return sum;
    if (user.lastLogin < last7Days) return sum;
    return sum + 1;
  }, 0);

  return (
    <Card
      className="h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={() => navigate({ to: "/cobis-tools/users" })}
    >
      <CardHeader className="h-full">
        <div className="mb-2 flex items-center gap-2">
          <Users className="h-6 w-6" />

          <CardTitle>User Management</CardTitle>
        </div>
        <CardDescription>
          {hasNewUsers ? (
            <div className="flex items-baseline gap-2">
              <span className="font-bold">{newUsers.length}</span>
              <span>
                {newUsers.length === 1
                  ? "user waiting to be assigned"
                  : "users waiting to be assigned"}
              </span>
            </div>
          ) : (
            <span className="text-green-600 dark:text-green-500">All users assigned ✓</span>
          )}
          <div className="flex items-baseline gap-2">
            <span className="font-bold">{totalLatestLogins}</span>
            <span>
              {totalLatestLogins === 1
                ? "user logged in the past week"
                : "users logged in the past week"}
            </span>
          </div>
        </CardDescription>
        {hasNewUsers && (
          <CardAction>
            <Badge>Action Required</Badge>
          </CardAction>
        )}
      </CardHeader>
      {hasNewUsers && (
        <CardFooter className="flex-col items-start gap-1.5">
          <span>Review/assign Mnumbers to new users</span>
        </CardFooter>
      )}
    </Card>
  );
}
