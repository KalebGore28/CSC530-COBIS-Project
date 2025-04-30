// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useRoleContext } from '@/context/role'; // Make sure this path is correct
import { toast } from "sonner";

interface ProtectedRouteProps {
	allowedRoles: string[]; // Array of role names allowed to access
	children?: React.ReactNode; // Used if wrapping a single component directly
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
	const { selectedRole, roles } = useRoleContext();

	// ⏳ Wait until roles are loaded and role restoration has had a chance to run
	const isRolesLoaded = roles.length > 0;

	// Avoid redirecting prematurely while roles are being restored
	if (!isRolesLoaded) {
		return <></>; // or a loading spinner if you prefer
	}

	if (!selectedRole) { // Wait for role restoration
		return;
	}

	const isAllowed = allowedRoles.includes(selectedRole.name);

	if (!isAllowed) {
		toast.error("This page either does not exist or you do not have permission to access it.");
		return <Navigate to="/dashboard" replace />;
	}

	return children ? <>{children}</> : <Outlet />;
};


export default ProtectedRoute;