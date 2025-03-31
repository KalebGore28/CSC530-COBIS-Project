// TestPage.tsx
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

export default function TestPage() {

	const handleSimulateChange = () => {
		setHasUnsavedChanges(true);
		alert("Unsaved changes have been simulated!");
	};

	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	useEffect(() => {
		const handleBeforeUnload = (event: any) => {
			if (hasUnsavedChanges) {
				event.preventDefault();
				event.returnValue = ''; // Required for the dialog to appear in modern browsers
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		// Cleanup the event listener when the component unmounts
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [hasUnsavedChanges]);

	return (
		<div>
			<h1>Test Page</h1>
			<button onClick={handleSimulateChange}>Simulate Unsaved Change</button>
			<br />
			<Link to="/dashboard">Go to Dashboard</Link>
		</div>
	);
}