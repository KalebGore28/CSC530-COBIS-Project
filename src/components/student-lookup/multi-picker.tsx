import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type PickerOption = {
  value: string;
  label: string;
  detail?: string;
};

// There are thousands of courses, so only the first matches are listed and typing narrows them
const MAX_SHOWN = 50;

interface MultiPickerProps {
  label: string;
  options: Array<PickerOption>;
  selected: Array<string>;
  onChange: (selected: Array<string>) => void;
  searchPlaceholder: string;
  emptyMessage: string;
}

/**
 * A button that opens a searchable list, where several options can be picked.
 */
export function MultiPicker({
  label,
  options,
  selected,
  onChange,
  searchPlaceholder,
  emptyMessage,
}: MultiPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const text = query.trim().toLowerCase();
  const matches = options.filter(
    (option) =>
      !text ||
      option.value.toLowerCase().includes(text) ||
      option.label.toLowerCase().includes(text),
  );
  // Picked options stay on top, so they can be unpicked without searching again
  const shown = [
    ...matches.filter((option) => selected.includes(option.value)),
    ...matches.filter((option) => !selected.includes(option.value)),
  ].slice(0, MAX_SHOWN);

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-(--control-height) justify-between font-normal max-md:w-full"
        >
          {label}
          {selected.length > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-xs tabular-nums">
              {selected.length}
            </span>
          )}
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-md:w-(--radix-popover-trigger-width)" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {shown.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggle(option.value)}
                    className="max-md:py-2.5"
                  >
                    <CheckIcon className={cn("shrink-0", !isSelected && "opacity-0")} />
                    <div className="min-w-0">
                      <div className="truncate">{option.label}</div>
                      {option.detail && (
                        <div className="text-muted-foreground truncate text-xs">
                          {option.detail}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {matches.length > MAX_SHOWN && (
              <p className="text-muted-foreground px-3 py-2 text-xs">
                Showing {MAX_SHOWN} of {matches.length}. Keep typing to narrow the list.
              </p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
