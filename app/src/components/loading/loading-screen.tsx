import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/primary-icon.png';

interface LoadingScreenProps {
	text?: string;
	logoSrc?: string;
	onExited?: () => void;  // Callback for when exit animation completes
	fullScreen?: boolean;   // Whether to cover the full screen
	show?: boolean;         // Control visibility from parent
}

const LoadingScreen = ({
	text = 'Loading...',
	logoSrc = logo,
	onExited,
	fullScreen = true,
	show = true,
}: LoadingScreenProps) => {
	// Track both visibility and mounted state
	const [isVisible, setIsVisible] = useState(false);
	const [isMounted, setIsMounted] = useState(true);

	useEffect(() => {
		let fadeInTimer: ReturnType<typeof setTimeout>;
		let fadeOutTimer: ReturnType<typeof setTimeout>;

		if (show) {
			// Fade in when component mounts or show becomes true
			setIsMounted(true);
			fadeInTimer = setTimeout(() => {
				setIsVisible(true);
			}, 50);
		} else if (isVisible) {
			// Fade out when show becomes false
			setIsVisible(false);

			// Wait for animation to complete before unmounting
			fadeOutTimer = setTimeout(() => {
				setIsMounted(false);
				onExited?.();
			}, 500); // Match the duration-500 in the classes
		}

		return () => {
			clearTimeout(fadeInTimer);
			clearTimeout(fadeOutTimer);
		};
	}, [show, isVisible, onExited]);

	// If not mounted, don't render anything
	if (!isMounted) return null;

	return (
		<div
			className={`flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 ${fullScreen ? 'fixed inset-0 z-50 min-h-screen' : 'w-full h-full'
				}`}
		>
			<Card
				className="w-80 shadow-lg transition-all duration-500 ease-in-out"
				style={{
					opacity: isVisible ? 1 : 0,
					transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
					pointerEvents: isVisible ? 'auto' : 'none'
				}}
			>
				<CardContent className="flex flex-col items-center pt-6">
					{/* Logo */}
					<div className="w-32 h-32 mb-6">
						<img
							src={logoSrc}
							alt="Logo"
							className="w-full h-full object-contain"
						/>
					</div>

					{/* Spinner */}
					<Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />

					{/* Loading Text */}
					<p className="text-muted-foreground font-medium">{text}</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default LoadingScreen;