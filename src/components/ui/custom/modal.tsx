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
import { cn } from "@/lib/utils";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
	className?: string;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	description,
	children,
	footer,
	size = 'md',
	className,
}) => {
	const sizeClasses = {
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-md',
		lg: 'sm:max-w-lg',
		xl: 'sm:max-w-xl',
		"2xl": 'sm:max-w-2xl',
		"3xl": 'sm:max-w-3xl',
		"4xl": 'sm:max-w-4xl',
		"5xl": 'sm:max-w-5xl',
		"6xl": 'sm:max-w-6xl',
		"7xl": 'sm:max-w-7xl',
		full: 'sm:max-w-9/12',
	};

	const dialogContentClasses = cn(
		"p-0",
		sizeClasses[size],
		className
	);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => {
			if (!open) onClose();
		}}>
			<DialogContent className={dialogContentClasses} onEscapeKeyDown={onClose} onPointerDownOutside={onClose}>
				<DialogHeader className="p-4 border-b">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
						<DialogClose asChild>
						</DialogClose>
					</div>
					{description && (
						<DialogDescription className="mt-1 text-sm">
							{description}
						</DialogDescription>
					)}
				</DialogHeader>

				{children}

				{footer && (
					<DialogFooter className="p-4 border-t bg-muted/50">
						{footer}
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default Modal;