// @/components/ui/date-picker.tsx (Create this new file)
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
	id: string;
	value: Date | undefined;
	onChange: (date: Date | undefined) => void;
	placeholder: string;
}

export function DatePicker({
	id,
	value,
	onChange,
	placeholder,
}: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant={"outline"}
					className={cn(
						"border border-gray-300 shadow-sm dark:shadow-lg  dark:shadow-neutral-700/50 dark:placeholder-text-neutral-600 flex h-11 w-full rounded-md bg-white px-3 py-2 text-sm text-black transition-all duration-300 group-hover/input:shadow-xl file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:focus-visible:ring-neutral-600 ",
						!value && "text-muted-foreground"
					)}>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? format(value, "PPP") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0"
				align="start">
				<Calendar
					mode="single"
					selected={value}
					onSelect={onChange}
					initialFocus
					// Add constraints if needed, e.g., setting the max date to today:
					captionLayout="dropdown"
					fromYear={1900}
					toYear={new Date().getFullYear()}
				/>
			</PopoverContent>
		</Popover>
	);
}
