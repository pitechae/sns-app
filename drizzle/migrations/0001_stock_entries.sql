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
