import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-md space-y-8 text-center">
                {/* 404 Number */}
                <div className="relative">
                    <h1 className="text-9xl font-bold text-gray-200 select-none dark:text-gray-700">
                        404
                    </h1>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        The page you're looking for doesn't exist or has been
                        moved.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button
                        onClick={() => navigate({ to: '/dashboard' })}
                        size="lg"
                        className="gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Go to Dashboard
                    </Button>
                    <Button
                        onClick={() => window.history.back()}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    )
}
