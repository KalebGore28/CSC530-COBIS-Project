import { createFileRoute } from '@tanstack/react-router'
import { DemoDataTable } from '@/components/tables/demo-data-table'

export const Route = createFileRoute('/table-demo')({
    component: TableDemoPage,
})

function TableDemoPage() {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Page Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Table Design Demo
                    </h1>
                    <p className="text-muted-foreground">
                        A demonstration of an interactive data table with column
                        visibility, sorting, and filtering capabilities.
                    </p>
                </div>

                {/* Table Component */}
                <DemoDataTable />
            </div>
        </div>
    )
}
