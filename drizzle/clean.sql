-- Clean script to drop all tables from the D1 database

-- Drop items table first (because it has foreign key constraints)
DROP TABLE IF EXISTS items;

-- Drop item_groups table
DROP TABLE IF EXISTS item_groups;

-- Drop any other tables that might exist
PRAGMA foreign_keys = OFF;
SELECT 'DROP TABLE IF EXISTS ' || name || ';' FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
PRAGMA foreign_keys = ON;
