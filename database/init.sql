-- Master initialization script for CSF iHub Database
-- This script runs the consolidated setup migration.

-- Run the single consolidated setup script
\i /migrations/setup.sql

-- Final Permissions (redundant but safe)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
