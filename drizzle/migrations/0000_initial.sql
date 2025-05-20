-- Migration file for creating initial tables

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
