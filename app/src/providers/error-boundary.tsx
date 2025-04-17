import React from "react";

interface ErrorBoundaryProps {
	fallback: React.ReactNode;
	children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
	state = { hasError: false };

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		// You can also log the error to an error reporting service
		console.error("Error caught in ErrorBoundary:", error, errorInfo);
	}

	render(): React.ReactNode {
		if (this.state.hasError) {
			return this.props.fallback
		}
		return this.props.children;
	}
}

export default ErrorBoundary;