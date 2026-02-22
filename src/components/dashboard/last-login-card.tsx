import { useLiveQuery } from '@tanstack/react-db'
import { useNavigate } from '@tanstack/react-router'
import { usersCollection } from '@/integrations/tanstack-db/users'

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

const now = new Date()

const last7Days = new Date()
last7Days.setDate(now.getDate() - 7)

export function LastLoginCard() {
    const navigate = useNavigate()
    const { data: lastLogins, isLoading } = useLiveQuery((q) =>
        q.from({ users: usersCollection }),
    )

    if (isLoading) return null

    const totalLatestLogins = lastLogins.reduce((sum, user) => {
        if (user.lastLogin === null) return sum
        if (user.lastLogin < last7Days) return sum
        return sum + 1
    }, 0)

    return (
        <Card
            className="hover:shadow-lg cursor-pointer"
            onClick={() => navigate({ to: '/cobis-tools/users' })}
        >
            <CardHeader>
                <CardDescription>Latest Logins</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    <div className="flex items-baseline gap-2">
                        <span>{totalLatestLogins}</span>
                        <span className="text-xl">
                            {totalLatestLogins === 1
                                ? 'user logged in the past week'
                                : 'users logged in the past week'}
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>
        </Card>
    )
}
