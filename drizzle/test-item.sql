-- Insert a test item to verify timestamp handling

-- First, get an item_group_id from the item_groups table
SELECT id FROM item_groups LIMIT 1;

-- Insert a test item with explicit timestamp
INSERT INTO items (id, item_code, name, item_group_id, created_at)
VALUES (
  lower(hex(randomblob(16))), 
  'TEST001', 
  'Test Item', 
  (SELECT id FROM item_groups LIMIT 1), 
  unixepoch()
);
