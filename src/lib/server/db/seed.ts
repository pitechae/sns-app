import { drizzle } from 'drizzle-orm/d1';
import { itemGroups } from './schema';
import type { D1Database } from '@cloudflare/workers-types';

export async function seedItemGroups(db: D1Database) {
  const d1db = drizzle(db);
  
  // Insert records into item_groups table
  await d1db.insert(itemGroups).values([
    {
      name: "BOY'S POLO SHIRT",
      code: "BPS",
      // id and created_at will use default values
    },
    {
      name: "BOY'S SHORT PANT",
      code: "BSP",
      // id and created_at will use default values
    }
  ]).run();
  
  console.log('Item groups seeded successfully');
}
