// src/components/ui/Modal.tsx (or wherever your Modal component is)
import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog"; // Adjust path if needed
import { cn } from "@/lib/utils"; // Import cn utility if you use it for class merging

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'| 'full';
	contentClassName?: string; // Added: Optional class name for DialogContent
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	description,
	children,
	footer,
	size = 'md',
	contentClassName, // Added
}) => {
	const sizeClasses = {
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-md',
		lg: 'sm:max-w-lg',
		xl: 'sm:max-w-xl',
		"2xl": 'sm:max-w-2xl',
		full: 'sm:max-w-11/12',
	};

	// Use cn to merge default size class, custom class, and base styles
	const dialogContentClasses = cn(
		"p-0", // Keep your base padding reset
		sizeClasses[size], // Apply default size class
		contentClassName // Apply custom class (will override size if specific enough)
	);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => {
			if (!open) onClose();
		}}>
			{/* Apply the merged classes here */}
			<DialogContent className={dialogContentClasses} onEscapeKeyDown={onClose} onPointerDownOutside={onClose}>
				<DialogHeader className="p-4 border-b"> {/* Added border */}
					<div className="flex items-center justify-between">
						<DialogTitle className="text-lg font-semibold">{title}</DialogTitle> {/* Adjusted font */}
						<DialogClose asChild>
						</DialogClose>
					</div>
					{description && (
						<DialogDescription className="mt-1 text-sm"> {/* Adjusted styles */}
							{description}
						</DialogDescription>
					)}
				</DialogHeader>

				{/* Content area with potential for scrolling if StudentDetail handles it */}
				<div className="max-h-[75vh] overflow-y-auto"> {/* Added max-height & scroll */}
					<div className="p-6">{children}</div> {/* Keep padding for content */}
				</div>


				{footer && (
					<DialogFooter className="p-4 border-t bg-muted/50"> {/* Adjusted styles */}
						{footer}
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default Modal;