import { Suspense, useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton";
import type { Department } from "@cobis/types";