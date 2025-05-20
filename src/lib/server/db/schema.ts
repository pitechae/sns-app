import { sqliteTable, text, integer, uniqueIndex, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Item Groups table
export const itemGroups = sqliteTable('item_groups', {
	_id: integer('_id').primaryKey({ autoIncrement: true }),
	id: text('id').notNull().unique().$defaultFn(() => crypto.randomUUID()),
	name: text('name', { length: 100 }).notNull().unique(),
	code: text('code', { length: 100 }).notNull().unique(),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Items table
export const items = sqliteTable('items', {
	_id: integer('_id').primaryKey({ autoIncrement: true }),
	id: text('id').notNull().unique().$defaultFn(() => crypto.randomUUID()),
	item_code: text('item_code', { length: 50 }).notNull().unique(),
	name: text('name', { length: 100 }).notNull(),
	item_group_id: text('item_group_id').references(() => itemGroups.id),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Stores table
export const stores = sqliteTable('stores', {
	_id: integer('_id').primaryKey({ autoIncrement: true }),
	id: text('id').notNull().unique().$defaultFn(() => crypto.randomUUID()),
	name: text('name', { length: 100 }).notNull().unique(),
	code: text('code', { length: 50 }).notNull().unique(),
	address: text('address', { length: 255 }),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Stock Entries table
export const stockEntries = sqliteTable('stock_entries', {
	_id: integer('_id').primaryKey({ autoIncrement: true }),
	id: text('id').notNull().unique().$defaultFn(() => crypto.randomUUID()),
	item_id: text('item_id').notNull().references(() => items.id),
	store_id: text('store_id').notNull(), // Default to 1 in the application logic
	type: text('type', { length: 20 }).notNull().default('purchase'), // Type: purchase, transfer, etc.
	quantity: real('quantity').notNull(),
	unit: text('unit', { length: 20 }).notNull(),
	rate: real('rate').notNull(),
	supplier: text('supplier', { length: 100 }),
	invoice_number: text('invoice_number', { length: 50 }),
	entry_date: integer('entry_date', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});
