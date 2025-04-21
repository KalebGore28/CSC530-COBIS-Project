import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from '@/context/session';
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
	const [routePermissions] = useState<{ [key: string]: string[] }>({
		"/dashboard": ["Faculty", "Advisor", "Program Coordinator", "Department Chair", "Administrator", "COBIS Admin"],
		"/cobis-tools": ["COBIS Admin"],
		"/cobis-tools/query-builder": ["COBIS Admin"],
		"/cobis-tools/imports": ["COBIS Admin"],
		"/cobis-tools/users": ["COBIS Admin"],
		"/students/lookup": ["Faculty", "Advisor", "Program Coordinator", "Department Chair", "Administrator", "COBIS Admin"],
		"/instructors": ["Department Chair", "Administrator", "COBIS Admin"],
		"/class-roster": ["Faculty", "Advisor", "Department Chair", "Administrator", "COBIS Admin"],
		"/advisor-page": ["Faculty", "Advisor", "Department Chair", "Administrator", "COBIS Admin"],
	});

	useEffect(() => {
		if (session?.info.roles?.length && roles.length === 0) {
			const fetchedRoles: Role[] = session.info.roles.map((role: { role_id: number; role_name: string }) => ({
				id: role.role_id,
				name: roleNameMap[role.role_name] || role.role_name,
				logo: getLogoForRole(role.role_name),
			}));
			setRoles(fetchedRoles);
		}
	}, [session]); // Only update roles when session.roles become available


	useEffect(() => {
		if (session && roles.length > 0) {
			const savedRoleId = sessionStorage.getItem("selectedRoleId");
			if (savedRoleId) {
				const roleIdNum = Number(savedRoleId);
				const savedRole = roles.find(role => role.id === roleIdNum);
				if (savedRole) {
					setSelectedRole(savedRole); // Restore only if valid
				}
			}
		}
	}, [session, roles]); // Make sure this runs only when roles are available


	useEffect(() => {
		if (selectedRole && selectedRole.id !== Number(sessionStorage.getItem("selectedRoleId"))) {
			sessionStorage.setItem("selectedRoleId", selectedRole.id.toString());
		}
	}, [selectedRole]); // Update sessionStorage whenever selectedRole changes


	return (
		<RoleContext.Provider value={{ roles, selectedRole, setSelectedRole, routePermissions }}>
			{children}
		</RoleContext.Provider>
	);
};

// Helper to map display names to logos
const getLogoForRole = (displayName: string): React.ElementType => {
	const logoMap: { [key: string]: React.ElementType } = {
		"faculty": BookOpen,
		"advisor": Compass,
		"program_coordinator": LayoutList,
		"department_chair": Armchair,
		"administrator": Settings,
		"cobis_administrator": Shield,
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