-- Inspect the database tables and their contents

-- Check table structure for item_groups
PRAGMA table_info(item_groups);

-- Check table structure for items
PRAGMA table_info(items);

-- View all records in item_groups
SELECT * FROM item_groups;

-- View all records in items
SELECT * FROM items;
