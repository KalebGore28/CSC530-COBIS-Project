import * as React from "react";

// This breakpoint represents the minimum comfortable width for content
const MIN_CONTENT_WIDTH = 768; // Adjust as needed
const SIDEBAR_WIDTH = 256; // 16rem in pixels
const BUFFER_WIDTH = 100; // Buffer to prevent toggle flickering

export interface ContentWidthOptions {
	onNarrow?: () => void;
	onWide?: () => void;
	minContentWidth?: number;
	sidebarWidth?: number;
	autoExpand?: boolean; // New option to control auto-expansion
}

export function useContentWidth(options: ContentWidthOptions = {}) {
	const {
		onNarrow,
		onWide,
		minContentWidth = MIN_CONTENT_WIDTH,
		sidebarWidth = SIDEBAR_WIDTH,
		autoExpand = true // Default to auto-expanding
	} = options;

	// Track if sidebar was manually collapsed
	const userCollapsed = React.useRef(false);
	const contentRef = React.useRef<HTMLDivElement>(null);

	// Monitor window resize
	React.useEffect(() => {
		// Skip if there's no callback
		if (!onNarrow && !onWide) return;

		const handleResize = () => {
			const windowWidth = window.innerWidth;

			// Narrow viewport - collapse sidebar
			if (onNarrow && windowWidth < minContentWidth + sidebarWidth) {
				onNarrow();
				// This was an automatic collapse, not user initiated
				userCollapsed.current = false;
			}
			// Wide viewport - expand sidebar if it wasn't manually collapsed
			else if (autoExpand && onWide && windowWidth > minContentWidth + sidebarWidth + BUFFER_WIDTH) {
				if (!userCollapsed.current) {
					onWide();
				}
			}
		};

		window.addEventListener('resize', handleResize);

		// Initial check
		handleResize();

		return () => window.removeEventListener('resize', handleResize);
	}, [onNarrow, onWide, minContentWidth, sidebarWidth, autoExpand]);

	// Function to track user-initiated sidebar collapses
	const trackSidebarAction = (isOpen: boolean) => {
		// If the user is manually closing the sidebar, track it
		if (!isOpen) {
			userCollapsed.current = true;
		} else {
			// If user manually opens it, reset the flag
			userCollapsed.current = false;
		}
	};

	return { contentRef, trackSidebarAction };
} 