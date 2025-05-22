-- Combined SQL script for initial deployment
-- This combines the initial schema and seed data

-- Create item_groups table
CREATE TABLE IF NOT EXISTS item_groups (
  _id INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  _id INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  item_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  item_group_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (item_group_id) REFERENCES item_groups(id)
);

-- Create stores table
CREATE TABLE IF NOT EXISTS "stores" (
  "_id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "id" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL UNIQUE,
  "code" TEXT NOT NULL UNIQUE,
  "address" TEXT,
  "created_at" INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create stock_entries table
CREATE TABLE IF NOT EXISTS "stock_entries" (
  "_id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "id" TEXT NOT NULL UNIQUE,
  "item_id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'purchase',
  "quantity" REAL NOT NULL,
  "unit" TEXT NOT NULL,
  "rate" REAL NOT NULL,
  "supplier" TEXT,
  "invoice_number" TEXT,
  "entry_date" INTEGER NOT NULL DEFAULT (unixepoch()),
  "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY ("item_id") REFERENCES "items" ("id")
);

-- Insert default store
INSERT INTO "stores" ("id", "name", "code") 
VALUES ('1', 'Main Store', 'MAIN');

-- Insert records into item_groups table
INSERT INTO item_groups (id, name, code, created_at)
VALUES 
  (lower(hex(randomblob(16))), 'BOY''S POLO SHIRT', 'BPS', unixepoch()),
  (lower(hex(randomblob(16))), 'BOY''S SHORT PANT', 'BSP', unixepoch());

-- Insert sample items using the item groups
INSERT INTO items (id, item_code, name, item_group_id, created_at)
SELECT 
  lower(hex(randomblob(16))), -- Generate UUID
  'BPS-001', -- Item code
  'Boy''s Blue Polo Shirt', -- Name
  id, -- Item group ID
  unixepoch() -- Current timestamp
FROM item_groups
WHERE code = 'BPS'
LIMIT 1

UNION ALL

SELECT 
  lower(hex(randomblob(16))), -- Generate UUID
  'BPS-002', -- Item code
  'Boy''s Red Polo Shirt', -- Name
  id, -- Item group ID
  unixepoch() -- Current timestamp
FROM item_groups
WHERE code = 'BPS'
LIMIT 1

UNION ALL

SELECT 
  lower(hex(randomblob(16))), -- Generate UUID
  'BSP-001', -- Item code
  'Boy''s Blue Short Pant', -- Name
  id, -- Item group ID
  unixepoch() -- Current timestamp
FROM item_groups
WHERE code = 'BSP'
LIMIT 1;

-- Insert sample stock entries
INSERT INTO stock_entries (id, item_id, store_id, type, quantity, unit, rate, supplier, invoice_number, entry_date)
SELECT
  lower(hex(randomblob(16))), -- Generate UUID for stock entry
  id, -- Item ID
  '1', -- Store ID (Main Store)
  'purchase', -- Entry type
  100, -- Quantity
  'pcs', -- Unit
  23.50, -- Rate
  'Supplier XYZ', -- Supplier
  'INV-001', -- Invoice number
  unixepoch() -- Entry date
FROM items
WHERE item_code = 'BPS-001'

UNION ALL

SELECT
  lower(hex(randomblob(16))), -- Generate UUID for stock entry
  id, -- Item ID
  '1', -- Store ID (Main Store)
  'purchase', -- Entry type
  75, -- Quantity
  'pcs', -- Unit
  25.00, -- Rate
  'Supplier XYZ', -- Supplier
  'INV-002', -- Invoice number
  unixepoch() -- Entry date
FROM items
WHERE item_code = 'BPS-002'

UNION ALL

SELECT
  lower(hex(randomblob(16))), -- Generate UUID for stock entry
  id, -- Item ID
  '1', -- Store ID (Main Store)
  'purchase', -- Entry type
  50, -- Quantity
  'pcs', -- Unit
  35.00, -- Rate
  'Supplier ABC', -- Supplier
  'INV-003', -- Invoice number
  unixepoch() -- Entry date
FROM items
WHERE item_code = 'BSP-001';
