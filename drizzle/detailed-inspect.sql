-- Detailed inspection of the database tables and their contents

-- Check table structure for item_groups
PRAGMA table_info(item_groups);

-- Check table structure for items
PRAGMA table_info(items);

-- View all records in item_groups with formatted timestamps
SELECT 
  _id, 
  id, 
  name, 
  code, 
  created_at,
  datetime(created_at, 'unixepoch') as formatted_date
FROM item_groups;

-- View all records in items with formatted timestamps
SELECT 
  _id, 
  id, 
  item_code, 
  name, 
  item_group_id, 
  created_at,
  datetime(created_at, 'unixepoch') as formatted_date
FROM items;
