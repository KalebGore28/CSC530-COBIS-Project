"use client"

import * as React from "react"
import { Check, ChevronsUpDown, ContactRound } from "lucide-react"
import { cn } from "@/lib/utils"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"

const frameworks = [
	{ value: "faculty", label: "Faculty" },
	{ value: "sveltekit", label: "SvelteKit" },
	{ value: "nuxt.js", label: "Nuxt.js" },
	{ value: "remix", label: "Remix" },
	{ value: "astro", label: "Astro" },
]

export function ComboboxDemo({ collapsed = false }) {
	const [open, setOpen] = React.useState(false)
	const [value, setValue] = React.useState("")

	if (collapsed) {
		return <ContactRound className="h-4 w-4" />
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<div
					role="combobox"
					aria-expanded={open}
					className={cn(
						"w-full flex items-center justify-between",
						"h-9 py-4",
						"cursor-pointer",
						"text-white",
						"hover:text-blue-950",
					)}
				>
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center w-8 h-8 bg-blue-900 rounded-md">
							<ContactRound className="h-6 w-6" />
						</div>
						<span className="text-nowrap">
							{value
								? frameworks.find((framework) => framework.value === value)?.label
								: "Select role..."}
						</span>
					</div>
					<ChevronsUpDown className="h-4 w-4 opacity-50" />
				</div>
			</PopoverTrigger>
			<PopoverContent
				className="w-[var(--radix-popover-trigger-width)] p-0"
				align="start"
			>
				<Command className="bg-background">
					<CommandList>
						<CommandEmpty>No role found.</CommandEmpty>
						<CommandGroup>
							{frameworks.map((framework) => (
								<CommandItem
									key={framework.value}
									value={framework.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue)
										setOpen(false)
									}}
									className="hover:bg-accent/50"
								>
									{framework.label}
									<Check
										className={cn(
											"ml-auto h-4 w-4",
											value === framework.value ? "opacity-100" : "opacity-0"
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}