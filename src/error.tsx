import { useNavigate } from '@tanstack/react-router'
import { Check, CircleAlert, Copy, House, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorComponentProps {
    error: Error
    reset?: () => void
    info?: { componentStack: string }
}

export function ErrorComponent(props: ErrorComponentProps) {
    const navigate = useNavigate()
    const [copied, setCopied] = useState(false)

    const isDevelopment = import.meta.env.DEV

    const copyErrorDetails = async () => {
        const errorDetails =
            `Error: ${props.error.message}\n\n` +
            `Stack Trace:\n${props.error.stack || 'N/A'}\n\n` +
            `Component Stack:\n${props.info?.componentStack || 'N/A'}`

        try {
            await navigator.clipboard.writeText(errorDetails)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="text-center space-y-8 max-w-2xl w-full">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
                        <CircleAlert className="w-16 h-16 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        We encountered an unexpected error. Please try again or
                        return home.
                    </p>
                </div>

                {/* Error Details (Development Only) */}
                {isDevelopment && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                                Error Details:
                            </p>
                            <Button
                                onClick={copyErrorDetails}
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-400 font-mono wrap-break-word">
                            {props.error.message}
                        </p>
                        {props.error.stack && (
                            <details className="mt-3">
                                <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                                    Stack Trace
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto whitespace-pre-wrap">
                                    {props.error.stack}
                                </pre>
                            </details>
                        )}
                        {props.info?.componentStack && (
                            <details className="mt-3">
                                <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                                    Component Stack
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto whitespace-pre-wrap">
                                    {props.info.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {props.reset && (
                        <Button
                            onClick={() => props.reset?.()}
                            size="lg"
                            className="gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Try Again
                        </Button>
                    )}
                    <Button
                        onClick={() => navigate({ to: '/' })}
                        variant={props.reset ? 'outline' : 'default'}
                        size="lg"
                        className="gap-2"
                    >
                        <House className="w-4 h-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    )
}
