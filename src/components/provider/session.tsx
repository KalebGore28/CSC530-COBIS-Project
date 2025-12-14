import type { UserInfoResponse } from '@/routes/api/user/me'

// @Deprecated: Use useAuthentication from '@/lib/auth-client' instead

type Route = {
    name: string
    allowedRoles: Array<string>
}
const ROUTE_PERMISSIONS: { [key: string]: Route } = {
    '/dashboard': {
        name: 'Dashboard',
        allowedRoles: [
            'faculty',
            'advisor',
            'program_coordinator',
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/cobis-tools': {
        name: 'COBIS Tools',
        allowedRoles: ['cobis_administrator'],
    },
    '/cobis-tools/import': {
        name: 'Imports',
        allowedRoles: ['cobis_administrator'],
    },
    '/cobis-tools/users': {
        name: 'Users',
        allowedRoles: ['cobis_administrator'],
    },
    '/student-lookup': {
        name: 'Student Lookup',
        allowedRoles: [
            'program_coordinator',
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/instructors': {
        name: 'Instructors',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/class-roster': {
        name: 'Class Roster',
        allowedRoles: [
            'faculty',
            'advisor',
            'department_chair',
            'cobis_administrator',
        ],
    },
    '/advisor-page': {
        name: 'Advisor Page',
        allowedRoles: [
            'faculty',
            'advisor',
            'department_chair',
            'cobis_administrator',
        ],
    },
    '/enrollment': {
        name: 'Enrollment',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/enrollment/programs': {
        name: 'Enrollment Programs',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/enrollment/courses': {
        name: 'Enrollment Courses',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/enrollment/faculty': {
        name: 'Enrollment Faculty',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
}
// Mapping from database role_name to display name
export const ROLE_MAP: { [key: string]: string } = {
    faculty: 'Faculty',
    advisor: 'Advisor',
    program_coordinator: 'Program Coordinator',
    department_chair: 'Department Chair',
    administrator: 'Administrator',
    cobis_administrator: 'COBIS Admin',
}

export const hasRouteAccess = (
    route: string,
    userRoles: Array<string>,
): boolean => {
    const routeInfo = ROUTE_PERMISSIONS[route]
    if (!routeInfo) return false
    return routeInfo.allowedRoles.some((role) => userRoles.includes(role))
}
