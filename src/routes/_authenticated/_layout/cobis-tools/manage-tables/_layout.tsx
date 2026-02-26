import {
    createFileRoute,
    Outlet,
    useLocation,
    useNavigate,
} from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/manage-tables/_layout',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const location = useLocation()
    const navigate = useNavigate()

    const table = location.pathname.split('/').pop()

    return (
        <div className="w-full mx-auto p-4">
            <div className="w-full col-span-3">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                        navigate({
                            to: `/cobis-tools/manage-tables`,
                        })
                    }
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
            <Outlet />
        </div>
    )
}
