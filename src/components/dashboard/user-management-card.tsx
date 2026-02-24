import { isNull, useLiveQuery } from '@tanstack/react-db'
import { useNavigate } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { usersCollection } from '@/integrations/tanstack-db/users'
import { Badge } from '@/components/ui/badge'

import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

const now = new Date()

const last7Days = new Date()
last7Days.setDate(now.getDate() - 7)

export function UserManangementCard() {
    const navigate = useNavigate()
    const { data: newUsers, isLoading: newUsersLoading } = useLiveQuery((q) =>
        q
            .from({ users: usersCollection })
            .where(({ users }) => isNull(users.mnumber)),
    )

    const { data: lastLogins, isLoading: lastLoginsLoading } = useLiveQuery(
        (q) => q.from({ users: usersCollection }),
    )

    if (newUsersLoading || lastLoginsLoading) return null

    const hasNewUsers = newUsers.length > 0

    const totalLatestLogins = lastLogins.reduce((sum, user) => {
        if (user.lastLogin === null) return sum
        if (user.lastLogin < last7Days) return sum
        return sum + 1
    }, 0)

    return (
        <Card
            className="hover:shadow-lg cursor-pointer h-full transition-all hover:scale-[1.02]"
            onClick={() => navigate({ to: '/cobis-tools/users' })}
        >
            <CardHeader className="h-full">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                        <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle>User Management</CardTitle>
                </div>
                <CardDescription className="text-lg">
                    {hasNewUsers ? (
                        <div className="flex items-baseline gap-2">
                            <span className="text-orange-600 dark:text-orange-500">
                                {newUsers.length}
                            </span>
                            <span>
                                {newUsers.length === 1
                                    ? 'user waiting to be assigned'
                                    : 'users waiting to be assigned'}
                            </span>
                        </div>
                    ) : (
                        <span className="text-green-600 dark:text-green-500">
                            All users assigned ✓
                        </span>
                    )}
                    <div className="flex items-baseline gap-2">
                        <span>{totalLatestLogins}</span>
                        <span>
                            {totalLatestLogins === 1
                                ? 'user logged in the past week'
                                : 'users logged in the past week'}
                        </span>
                    </div>
                </CardDescription>
                {hasNewUsers && (
                    <CardAction>
                        <Badge
                            variant="secondary"
                            className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                        >
                            Action Required
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            {hasNewUsers && (
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="text-muted-foreground">
                        {newUsers.length === 1
                            ? 'Review and assign M-number to the new user'
                            : 'Review and assign M-numbers to new users'}
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}
