-- Super admin is now called Developer. Same access (every section, the
-- permission matrix, manages everyone); only the stored name changes.
--
-- Run after the code that knows 'developer' is live. The code also reads an
-- old 'super_admin' row as Developer, so running this a little later is safe.

UPDATE staff SET role = 'developer' WHERE lower(trim(role)) = 'super_admin';

-- The top role is never read from the matrix, but keep the table tidy.
DELETE FROM admin_role_permissions WHERE role = 'super_admin';
