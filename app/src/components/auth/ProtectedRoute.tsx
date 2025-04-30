// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRoleContext } from '@/context/role'; // Make sure this path is correct
import { toast } from "sonner";

interface ProtectedRouteProps {
	allowedRoles: string[]; // Array of role names allowed to access
	children?: React.ReactNode; // Used if wrapping a single component directly
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
	const { selectedRole } = useRoleContext();
	const location = useLocation(); // Get location object

	// 1. Handle Role Loading State (Optional but Recommended)
	// If your useRoleContext provides a loading state, check it here
	// E.g., if (isLoadingRole) return <LoadingSpinner />;

	// 2. Check if a role is selected
	if (!selectedRole) {
		// This can happen if the role is still loading, or if the user genuinely has no role.
		// Redirecting to login is a safe default if role is required.
		console.warn(`ProtectedRoute: No role selected for path "${location.pathname}". Redirecting to login.`);
		// Optionally pass the intended destination via state for redirection after login
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// 3. Check if the selected role is allowed
	const isAllowed = allowedRoles.includes(selectedRole.name);

	if (!isAllowed) {
		// Role is selected, but not allowed for this route
		console.log(`ProtectedRoute: Role "${selectedRole.name}" not allowed for path "${location.pathname}". Needs one of [${allowedRoles.join(', ')}]. Redirecting.`);
		toast.error("You do not have permission to access this page.");
		// Redirect to a safe page like the dashboard
		return <Navigate to="/dashboard" replace />;
	}

	// 4. Role is allowed - Render the child content
	// If 'children' prop is provided, render that (for wrapping single Route elements).
	// Otherwise, render <Outlet /> (for wrapping nested Route structures).
	return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;