SELECT DISTINCT p.table_name, p.column_name, p.can_read, p.can_write, p.description
FROM permissions p
JOIN (
    -- Get all permissions assigned via roles
    SELECT rp.permission_id FROM role_permissions rp
    JOIN user_roles ur ON rp.role_id = ur.role_id
    WHERE ur.user_id = 'U002'

    UNION

    -- Get additional permissions granted directly to user
    SELECT up.permission_id FROM user_permissions up
    WHERE up.user_id = 'U002'
) AS user_perms ON p.permission_id = user_perms.permission_id;