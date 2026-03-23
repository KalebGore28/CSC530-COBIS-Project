import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/manage-tables/_layout',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()

    return (
        <div className="container mx-auto flex w-full flex-col gap-4 p-6">
            <Button
                variant="outline"
                size="sm"
                className="w-fit shadow-md"
                onClick={() =>
                    navigate({
                        to: `/cobis-tools/manage-tables`,
                    })
                }
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <Outlet />
        </div>
    )
}
