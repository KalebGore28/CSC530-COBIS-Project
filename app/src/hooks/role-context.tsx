import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from '@/hooks/session-context';
import {
	Compass,
	BookOpen,
	LayoutList,
	Armchair,
	Settings,
	Shield,
} from "lucide-react";

// Define the Role type
interface Role {
	id: number;
	name: string; // Display name (e.g., "COBIS Admin")
	logo: React.ElementType;
}

interface RoleContextType {
	roles: Role[];
	selectedRole: Role | null;
	setSelectedRole: (role: Role | null) => void;
	routePermissions: { [key: string]: string[] }; // Routes mapped to allowed display names
}

// Mapping from database role_name to display name
const roleNameMap: { [key: string]: string } = {
	"faculty": "Faculty",
	"advisor": "Advisor",
	"program_coordinator": "Program Coordinator",
	"department_chair": "Department Chair",
	"administrator": "Administrator",
	"cobis_administrator": "COBIS Admin",
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { session } = useSession();
	const [roles, setRoles] = useState<Role[]>([]);
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [routePermissions, setRoutePermissions] = useState<{ [key: string]: string[] }>({
		"/dashboard": ["Faculty", "Advisor", "Program Coordinator", "Department Chair", "Administrator", "COBIS Admin"],
		"/reports": ["Faculty", "Advisor", "COBIS Admin"],
		"/reports/students": ["Faculty", "Advisor", "COBIS Admin"],
		"/cobis-tools": ["COBIS Admin"],
		"/cobis-tools/query-builder": ["COBIS Admin"],
		"/cobis-tools/imports": ["COBIS Admin"],
		"/test-page": ["Faculty", "Advisor", "Program Coordinator", "Department Chair", "Administrator", "COBIS Admin"],
		"/student-lookup": ["Faculty", "Advisor", "Program Coordinator", "Department Chair", "Administrator", "COBIS Admin"],
	});

	useEffect(() => {
		if (session) {
			const fetchedRoles: Role[] = session.roles.map((role: { role_id: number; role_name: string }) => {
				const displayName = roleNameMap[role.role_name] || role.role_name; // Fallback to original if not mapped
				return {
					id: role.role_id,
					name: displayName,
					logo: getLogoForRole(displayName),
				};
			});
			setRoles(fetchedRoles);
		}
	}, [session]);

	useEffect(() => {
		if (session && roles.length > 0) {
			const savedRoleId = sessionStorage.getItem("selectedRoleId");
			const roleIdNum = savedRoleId ? Number(savedRoleId) : null;
			const savedRole = roleIdNum ? roles.find(role => role.id === roleIdNum) : null;
			setSelectedRole(savedRole || roles[0] || null);
		}
	}, [session, roles]);

	useEffect(() => {
		if (selectedRole) {
			sessionStorage.setItem("selectedRoleId", selectedRole.id.toString());
		} else {
			sessionStorage.removeItem("selectedRoleId");
		}
	}, [selectedRole]);

	return (
		<RoleContext.Provider value={{ roles, selectedRole, setSelectedRole, routePermissions }}>
			{children}
		</RoleContext.Provider>
	);
};

// Helper to map display names to logos
const getLogoForRole = (displayName: string): React.ElementType => {
	const logoMap: { [key: string]: React.ElementType } = {
		"Faculty": BookOpen,
		"Advisor": Compass,
		"Program Coordinator": LayoutList,
		"Department Chair": Armchair,
		"Administrator": Settings,
		"COBIS Admin": Shield,
	};
	return logoMap[displayName] || Shield; // Default to Shield if unknown
};

export const useRoleContext = () => {
	const context = useContext(RoleContext);
	if (!context) {
		throw new Error('useRoleContext must be used within a RoleProvider');
	}
	return context;
};