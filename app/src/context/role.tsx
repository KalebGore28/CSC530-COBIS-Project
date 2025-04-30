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
	const { session, isLoading: sessionLoading } = useSession();
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

	// 1. Fetch roles from session
	useEffect(() => {
		if (!sessionLoading && session?.info.roles?.length) {
			const fetched = session.info.roles.map(r => ({
				id: r.role_id,
				name: roleNameMap[r.role_name] ?? r.role_name,
				logo: getLogoForRole(r.role_name),
			}));
			setRoles(fetched);
		}
	}, [session, sessionLoading]);

	// 2. Once roles are loaded, pick either stored or default
	useEffect(() => {
		if (roles.length === 0) return;

		// Try storage first
		const raw = localStorage.getItem("selectedRoleId");
		const storedId = raw != null ? Number(raw) : NaN;
		const fromStorage = roles.find(r => r.id === storedId);

		// Fallback to first role if storage miss
		const initial = fromStorage ?? roles[0];
		setSelectedRole(initial);
	}, [roles]);

	// 3. Persist any change of selectedRole
	useEffect(() => {
		if (!selectedRole) return;
		if (selectedRole) {
			localStorage.setItem("selectedRoleId", String(selectedRole.id));
		}
	}, [selectedRole]);

	// Delay until we have a session + at least one role
	if (sessionLoading || (session && roles.length === 0)) {
		return null;
	}

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