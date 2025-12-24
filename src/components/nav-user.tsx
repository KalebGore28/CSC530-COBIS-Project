import { LogOutIcon } from 'lucide-react'
import { useSidebar } from './ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { signOut, useAuthentication } from '@/lib/auth-client'

export function NavUser() {
    const { userSession } = useAuthentication()
    const { open, isMobile } = useSidebar()

    if (!userSession) return null

    const { user, faculty } = userSession

    return (
        <div className="flex items-center gap-2 rounded-lg">
            <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg text-black">
                    {faculty.firstName.charAt(0)}
                </AvatarFallback>
            </Avatar>
            {(open || isMobile) && (
                <>
                    <div className="flex-1 text-left text-sm leading-tight">
                        <span className="block truncate font-medium">
                            {user.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                            {user.email}
                        </span>
                    </div>
                    <button
                        onClick={signOut}
                        className="p-2 border rounded-lg hover:bg-secondary hover:text-white transition-colors"
                    >
                        <LogOutIcon className="w-5 h-5" />
                    </button>
                </>
            )}
        </div>
    )
}
