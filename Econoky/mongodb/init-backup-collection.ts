/**
 * Initialize Backup Collection Script
 * 
 * This script populates the MongoDB 'users_backup' collection
 * with seed data for the NoSQL injection vulnerability lab.
 * 
 * Called from instrumentation.ts on server startup.
 * 
 * WARNING: This is for EDUCATIONAL/PENTESTING LAB purposes only.
 * DO NOT use in production environments.
 */

import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { backupUsersData } from './seed-backup-data';

/**
 * Initialize the users_backup collection with seed data
 * 
 * This function:
 * 1. Connects to MongoDB
 * 2. Drops existing users_backup collection if exists
 * 3. Inserts the seed data
 * 
 * The data includes users with different roles (basic, premium, admin)
 * and sensitive information that can be extracted via NoSQL injection.
 */
export async function initBackupCollection(): Promise<void> {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Failed to get database connection');
      return;
    }
    
    const collection = db.collection('users_backup');
    
    // Clear existing data
    await collection.deleteMany({});
    
    // Insert seed data
    await collection.insertMany(backupUsersData);
    
    console.log('✅ Backup collection initialized with', backupUsersData.length, 'users');
  } catch (error) {
    console.error('❌ Failed to initialize backup collection:', error);
  }
}

export default initBackupCollection;
