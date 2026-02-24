import { useNavigate } from '@tanstack/react-router'
import { Upload } from 'lucide-react'

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export function ImportCard() {
    const navigate = useNavigate()

    return (
        <Card
            className="hover:shadow-lg cursor-pointer h-full transition-all hover:scale-[1.02]"
            onClick={() => navigate({ to: '/cobis-tools/import' })}
        >
            <CardHeader className="h-full">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                        <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle>Import Data</CardTitle>
                </div>
                <CardDescription className="text-lg">
                    <span className="text-muted-foreground">
                        Begin a new import process to add or update data in the
                        system
                    </span>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}
