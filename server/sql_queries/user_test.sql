-- Sample Query that checks for pending users.
-- Users who have an is_active of 0 AND has no assigned role.
-- On the other hand if they have an is_active of 0 and has an assigned role, they are considered soft deleted.

SELECT u.*
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
WHERE u.is_active = 0 AND ur.user_id IS NULL;

-- UPDATE users 
-- SET is_active = 0, updated_at = GETDATE()