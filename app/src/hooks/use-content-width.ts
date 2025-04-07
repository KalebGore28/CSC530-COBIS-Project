import * as React from "react";

// This breakpoint represents the minimum comfortable width for content
const MIN_CONTENT_WIDTH = 768; // Adjust as needed
const SIDEBAR_WIDTH = 256; // 16rem in pixels

export interface ContentWidthOptions {
	onNarrow?: () => void;
	onWide?: () => void;
	minContentWidth?: number;
	sidebarWidth?: number;
}

export function useContentWidth(options: ContentWidthOptions = {}) {
	const {
		onNarrow,
		onWide,
		minContentWidth = MIN_CONTENT_WIDTH,
		sidebarWidth = SIDEBAR_WIDTH
	} = options;

	const contentRef = React.useRef<HTMLDivElement>(null);

	// Monitor window resize
	React.useEffect(() => {
		// Skip if there's no callback
		if (!onNarrow && !onWide) return;

		const handleResize = () => {
			const windowWidth = window.innerWidth;

			// If window width is getting too narrow for comfortable content viewing
			if (onNarrow && windowWidth < minContentWidth + sidebarWidth) {
				onNarrow();
			} else if (onWide && windowWidth > minContentWidth + sidebarWidth + 100) {
				// Add buffer to prevent rapid toggling
				onWide();
			}
		};

		window.addEventListener('resize', handleResize);

		// Initial check
		handleResize();

		return () => window.removeEventListener('resize', handleResize);
	}, [onNarrow, onWide, minContentWidth, sidebarWidth]);

	return contentRef;
} 