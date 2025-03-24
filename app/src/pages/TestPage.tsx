// TestPage.tsx
import { useUnsavedChanges } from "../components/UnsavedChangesContext";
import { Link } from "react-router-dom";

export default function TestPage() {
  const { setHasUnsavedChanges } = useUnsavedChanges();

  const handleSimulateChange = () => {
    setHasUnsavedChanges(true);
    alert("Unsaved changes have been simulated!");
  };

  return (
    <div>
      <h1>Test Page</h1>
      <button onClick={handleSimulateChange}>Simulate Unsaved Change</button>
      <br />
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
}