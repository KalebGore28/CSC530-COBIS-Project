// Role definitions
export const ROLES = {
    FACULTY: 'faculty',
    ADVISOR: 'advisor',
    PROGRAM_COORDINATOR: 'program_coordinator',
    DEPARTMENT_CHAIR: 'department_chair',
    ADMINISTRATOR: 'administrator',
    COBIS_ADMINISTRATOR: 'cobis_administrator',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Mapping from database role_name to display name
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
    [ROLES.FACULTY]: 'Faculty',
    [ROLES.ADVISOR]: 'Advisor', // Not used. Might remove as we can know from database data if faculty is an advisor
    [ROLES.PROGRAM_COORDINATOR]: 'Program Coordinator', // Not used
    [ROLES.DEPARTMENT_CHAIR]: 'Department Chair',
    [ROLES.ADMINISTRATOR]: 'Administrator', // Not used
    [ROLES.COBIS_ADMINISTRATOR]: 'COBIS Admin',
}

// Route configuration
type RouteConfig = {
    name: string
    allowedRoles: ReadonlySet<Role>
}

const createRoute = (name: string, roles: Role[]): RouteConfig => ({
    name,
    allowedRoles: new Set(roles),
})

// Store routes with Set for O(1) lookup on role checking
export const ROUTE_PERMISSIONS = {
    '/dashboard': createRoute('Dashboard', [
        ROLES.FACULTY,
        ROLES.COBIS_ADMINISTRATOR,
    ]),
    '/cobis-tools': createRoute('COBIS Tools', [ROLES.COBIS_ADMINISTRATOR]),
    '/cobis-tools/import': createRoute('Imports', [ROLES.COBIS_ADMINISTRATOR]),
    '/cobis-tools/users': createRoute('Users', [ROLES.COBIS_ADMINISTRATOR]),
    '/student-lookup': createRoute('Student Lookup', [
        ROLES.DEPARTMENT_CHAIR,
        ROLES.COBIS_ADMINISTRATOR,
    ]),
    '/instructors': createRoute('Instructors', [
        ROLES.DEPARTMENT_CHAIR,
        ROLES.COBIS_ADMINISTRATOR,
    ]),
    '/class-roster': createRoute('Class Roster', [
        ROLES.FACULTY,
        ROLES.DEPARTMENT_CHAIR,
        ROLES.COBIS_ADMINISTRATOR,
    ]),
    '/advisor-page': createRoute('Advisor Page', [
        ROLES.FACULTY,
        ROLES.DEPARTMENT_CHAIR,
        ROLES.COBIS_ADMINISTRATOR,
    ]),
    '/enrollment': createRoute('Enrollment', [
        ROLES.DEPARTMENT_CHAIR,
        ROLES.COBIS_ADMINISTRATOR,
    ]),
    '/enrollment/programs': createRoute('Enrollment Programs', [
        ROLES.DEPARTMENT_CHAIR,
        ROLES.COBIS_ADMINISTRATOR,
    ]),
    '/enrollment/courses': createRoute('Enrollment Courses', [
        ROLES.DEPARTMENT_CHAIR,
        ROLES.COBIS_ADMINISTRATOR,
    ]),
    '/enrollment/faculty': createRoute('Enrollment Faculty', [
        ROLES.DEPARTMENT_CHAIR,
        ROLES.COBIS_ADMINISTRATOR,
    ]),
} as const satisfies Record<string, RouteConfig>

export type RoutePath = keyof typeof ROUTE_PERMISSIONS

/**
 * Check if a user has access to a specific route
 * Time complexity: O(min(m, n)) where m = userRoles.length, n = route.allowedRoles.size
 */
export const hasRouteAccess = (
    route: string,
    userRoles: readonly string[],
): boolean => {
    const routeInfo = ROUTE_PERMISSIONS[route as RoutePath]
    if (!routeInfo) return false

    // Early exit if no user roles
    if (userRoles.length === 0) return false

    // Check if any user role is in the allowed roles set (O(1) per lookup)
    return userRoles.some((role) => routeInfo.allowedRoles.has(role as Role))
}

/**
 * Check if a user with given roles has access to ANY of the specified required roles
 * Time complexity: O(min(m, n)) where m = userRoles.length, n = requiredRoles.size
 * 
 * @param userRoles - Array of roles the user has
 * @param requiredRoles - Set of roles required for access (at least one must match)
 * @returns true if user has at least one of the required roles
 */
export const hasAnyRole = (
    userRoles: readonly string[],
    requiredRoles: ReadonlySet<string>,
): boolean => {
    if (userRoles.length === 0 || requiredRoles.size === 0) return false

    // Convert smaller collection to Set for optimal performance
    if (userRoles.length < requiredRoles.size) {
        const userRolesSet = new Set(userRoles)
        for (const role of requiredRoles) {
            if (userRolesSet.has(role)) return true
        }
    } else {
        for (const role of userRoles) {
            if (requiredRoles.has(role)) return true
        }
    }

    return false
}

/**
 * Check if user has ALL of the specified required roles
 * Time complexity: O(n) where n = requiredRoles.size
 */
export const hasAllRoles = (
    userRoles: readonly string[],
    requiredRoles: ReadonlySet<string>,
): boolean => {
    if (requiredRoles.size === 0) return true
    if (userRoles.length === 0) return false

    const userRolesSet = new Set(userRoles)
    for (const role of requiredRoles) {
        if (!userRolesSet.has(role)) return false
    }

    return true
}

/**
 * Get all routes accessible by the user
 * Time complexity: O(r * min(m, n)) where r = number of routes
 */
export const getAccessibleRoutes = (
    userRoles: readonly string[],
): Array<{ path: RoutePath; name: string }> => {
    if (userRoles.length === 0) return []

    const accessible: Array<{ path: RoutePath; name: string }> = []

    for (const [path, config] of Object.entries(ROUTE_PERMISSIONS)) {
        if (hasAnyRole(userRoles, config.allowedRoles)) {
            accessible.push({ path: path as RoutePath, name: config.name })
        }
    }

    return accessible
}