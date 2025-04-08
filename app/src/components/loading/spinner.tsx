"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the SpinnerLoader component
 */
interface SpinnerLoaderProps {
	/** Text to display below the spinner */
	text?: string;
	/** Size of the spinner in pixels (default: 24) */
	size?: number;
	/** Additional CSS classes */
	className?: string;
  }
  
  /**
   * A simple spinner loader component
   */
  export const SpinnerLoader: React.FC<SpinnerLoaderProps> = ({
	text = "Loading...",
	size = 24,
	className,
  }) => {
	return (
	  <div className={cn("flex flex-col items-center justify-center p-4", className)}>
		<Loader2 className="animate-spin" size={size} />
		{text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
	  </div>
	);
  };