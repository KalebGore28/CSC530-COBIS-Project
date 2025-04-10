import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * A reusable modal component built with Shadcn UI Dialog
 * 
 * @param isOpen Boolean that controls whether the modal is visible
 * @param onClose Function to call when the modal should close
 * @param title The title displayed in the modal header
 * @param description Optional description text displayed below the title
 * @param children Content to display in the modal body
 * @param footer Optional footer content (typically action buttons)
 * @param size Modal size variant: 'sm', 'md', 'lg', or 'xl'
 */
const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	description,
	children,
	footer,
	size = 'md',
}) => {
	// Size class mapping
	const sizeClasses = {
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-md',
		lg: 'sm:max-w-lg',
		xl: 'sm:max-w-xl',
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => {
			if (!open) onClose();
		}}>
			<DialogContent className={`${sizeClasses[size]} p-0`}>
				<DialogHeader className="px-6 pt-6 pb-4">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-xl">{title}</DialogTitle>
						<DialogClose asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full"
								onClick={onClose}
							>
								<X className="h-4 w-4" />
								<span className="sr-only">Close</span>
							</Button>
						</DialogClose>
					</div>
					{description && (
						<DialogDescription className="mt-2">
							{description}
						</DialogDescription>
					)}
				</DialogHeader>

				<div className="px-6 py-4">{children}</div>

				{footer && (
					<DialogFooter className="px-6 py-4 bg-muted/10">
						{footer}
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default Modal;