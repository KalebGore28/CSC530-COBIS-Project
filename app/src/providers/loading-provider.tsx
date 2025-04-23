import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/primary-icon.png';

// Create a context for the loading state
interface LoadingContextType {
	showLoading: (text?: string) => void;
	hideLoading: () => void;
	isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Provider props
interface LoadingProviderProps {
	children: ReactNode;
	defaultText?: string;
	logoSrc?: string;
	minLoadTime?: number;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
	children,
	defaultText = 'Loading...',
	logoSrc = logo,
	minLoadTime = 600
}) => {
	const [visible, setVisible] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [loadText, setLoadText] = useState(defaultText);
	const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

	const showLoading = (text?: string) => {
		console.log('Loading started');
		setLoadText(text || defaultText);
		setLoadStartTime(Date.now());
		setMounted(true);

		// Short delay to ensure DOM updates before animation starts
		setTimeout(() => {
			setVisible(true);
		}, 50);
	};

	const hideLoading = () => {
		console.log('Loading ended');
		if (loadStartTime !== null) {
			const elapsedTime = Date.now() - loadStartTime;
			const remainingTime = Math.max(0, minLoadTime - elapsedTime);

			setTimeout(() => {
				setVisible(false);

				// Wait for fade-out animation to complete
				setTimeout(() => {
					setMounted(false);
					setLoadStartTime(null);
				}, 500); // Match transition duration
			}, remainingTime);
		}
	};

	return (
		<LoadingContext.Provider value={{ showLoading, hideLoading, isLoading: visible }}>
			{children}

			{mounted && (
				<div
					className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-opacity duration-500 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}
				>
					<Card
						className="w-80 shadow-lg transition-all duration-500 ease-in-out"
						style={{
							transform: visible ? 'translateY(0)' : 'translateY(20px)',
							pointerEvents: visible ? 'auto' : 'none'
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
							<p className="text-muted-foreground font-medium">{loadText}</p>
						</CardContent>
					</Card>
				</div>
			)}
		</LoadingContext.Provider>
	);
};

// Custom hook to use the loading functionality
export const useLoading = () => {
	const context = useContext(LoadingContext);

	if (!context) {
		throw new Error('useLoading must be used within a LoadingProvider');
	}

	return context;
};

// Also expose a wrapper component for simpler use cases
interface WithLoadingProps {
	isLoading: boolean;
	loadingText?: string;
	children: ReactNode;
}

export const WithLoading: React.FC<WithLoadingProps> = ({
	isLoading,
	loadingText,
	children
}) => {
	const { showLoading, hideLoading } = useLoading();

	useEffect(() => {
		if (isLoading) {
			showLoading(loadingText);
		} else {
			hideLoading();
		}
	}, [isLoading, loadingText, showLoading, hideLoading]);

	return <>{children}</>;
};