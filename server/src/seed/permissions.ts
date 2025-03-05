import { permissions, roles, rolePermissions } from '../db/schema';
import { sql } from 'drizzle-orm';
import { roleAccessDefinitions } from './data/roleAccess';

// Map role names to IDs
const roleIds: { [key: string]: number } = {
    'faculty': 1,
    'advisor': 2,
    'program_coordinators': 3,
    'department_chairs': 4,
    'administrators_administrative_assistants': 5,
    'cobis_administrator': 6
};

export async function seedPermissions(orm: any): Promise<void> {
    try {
        // Step 1: Get all tables from sqlite_schema
        const tablesResult = await orm.all(sql`SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'`);
        const excludedTables = ['permissions', 'role_permissions', 'user_permissions', 'roles', 'users'];
        const tableNames = tablesResult
            .map((row: { name: string }) => row.name as string)
            .filter((name: string) => !excludedTables.includes(name));


        // Step 2: Get columns for each table and build permissions
        const allPermissions = [];
        for (const table of tableNames) {
            const columnsResult = await orm.all(sql.raw(`PRAGMA table_info("${table}")`));
            const columns = columnsResult.map((row: { name: string }) => row.name as string);
            allPermissions.push(...columns.map((column: string) => ({
                table_name: table,
                column_name: column
            })));
        }

        // Step 3: Insert all permissions into the permissions table
        if (allPermissions.length > 0) {
            await orm.insert(permissions)
                .values(allPermissions)
                .onConflictDoNothing()
                .execute();
            console.log(`Seeded ${allPermissions.length} permissions`);
        } else {
            console.log('No permissions to seed (no tables or columns found)');
        }

        // Step 4: Seed roles
        await orm.insert(roles)
            .values([
                { id: 1, name: 'faculty' },
                { id: 2, name: 'advisor' },
                { id: 3, name: 'program_coordinators' },
                { id: 4, name: 'department_chairs' },
                { id: 5, name: 'administrators_administrative_assistants' },
                { id: 6, name: 'cobis_administrator' },
            ])
            .onConflictDoNothing()
            .execute();
        console.log('Seeded roles');

        // Step 5: Seed role_permissions
        const roleMappings = [];
        for (const [roleName, tables] of Object.entries(roleAccessDefinitions)) {
            const roleId = roleIds[roleName];
            if (!roleId) {
                console.warn(`No role ID found for ${roleName}, skipping`);
                continue;
            }
            for (const [table, columns] of Object.entries(tables)) {
                roleMappings.push(...(columns as string[]).map(column => ({
                    role_id: roleId,
                    table_name: table,
                    column_name: column
                })));
            }
        }

        // Debug: Log mappings to check against permissions
        console.log('Role mappings to insert:', roleMappings);

        if (roleMappings.length > 0) {
            await orm.insert(rolePermissions)
                .values(roleMappings)
                .onConflictDoNothing()
                .execute();
            console.log(`Seeded ${roleMappings.length} role permissions`);
        } else {
            console.log('No role permissions to seed');
        }
    } catch (error) {
        console.error('Error seeding permissions:', error);
        throw error;
    }
}