import { Moon, Sun } from 'lucide-react'
import { createContext, useContext, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme)

    useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Theme | null

        if (stored) {
            setTheme(stored)
        } else {
            const systemPrefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches
            const systemTheme: Theme = systemPrefersDark ? 'dark' : 'light'
            localStorage.setItem(storageKey, systemTheme)
            setTheme(systemTheme)
        }
    }, [storageKey])

    useEffect(() => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')

        const applied =
            theme === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                : theme

        root.classList.add(applied)
    }, [theme])

    const value = {
        theme,
        setTheme: (t: Theme) => {
            localStorage.setItem(storageKey, t)
            setTheme(t)
        },
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider')

    return context
}

export function ModeToggle({ className }: { className?: string }) {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={cn(className)}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
