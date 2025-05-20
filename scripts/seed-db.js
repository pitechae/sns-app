#!/usr/bin/env node
import { unstable_dev } from 'wrangler';
import { seedItemGroups } from '../src/lib/server/db/seed.js';

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // Start a local dev server
    const worker = await unstable_dev('src/index.js', {
      experimental: { disableExperimentalWarning: true }
    });
    
    // Get the D1 database from the worker
    const db = worker.env.DB;
    
    // Run the seed function
    await seedItemGroups(db);
    
    console.log('Database seeding completed successfully');
    
    // Close the worker
    await worker.stop();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
