-- First, get the item group IDs
WITH item_group_ids AS (
    SELECT id, name FROM item_groups
)

-- Insert records into items table
INSERT INTO items (id, item_code, name, item_group_id, created_at)
SELECT 
    lower(hex(randomblob(16))), -- Generate UUID
    'BPS-001', -- Item code
    'Boy''s Blue Polo Shirt', -- Name
    id, -- Item group ID
    unixepoch() -- Current timestamp
FROM item_group_ids
WHERE name = 'BOY''S POLO SHIRT'

UNION ALL

SELECT 
    lower(hex(randomblob(16))), -- Generate UUID
    'BPS-002', -- Item code
    'Boy''s Red Polo Shirt', -- Name
    id, -- Item group ID
    unixepoch() -- Current timestamp
FROM item_group_ids
WHERE name = 'BOY''S POLO SHIRT'

UNION ALL

SELECT 
    lower(hex(randomblob(16))), -- Generate UUID
    'BSP-001', -- Item code
    'Boy''s Blue Short Pant', -- Name
    id, -- Item group ID
    unixepoch() -- Current timestamp
FROM item_group_ids
WHERE name = 'BOY''S SHORT PANT'

UNION ALL

SELECT 
    lower(hex(randomblob(16))), -- Generate UUID
    'BSP-002', -- Item code
    'Boy''s Black Short Pant', -- Name
    id, -- Item group ID
    unixepoch() -- Current timestamp
FROM item_group_ids
WHERE name = 'BOY''S SHORT PANT';
