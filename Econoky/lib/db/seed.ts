/**
 * Database Seed Script
 * 
 * Seeds the database with initial verified users for the pentesting lab.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' lib/db/seed.ts
 * Or import and call seedUsers() from your app initialization.
 * 
 * WARNING: This is for EDUCATIONAL/PENTESTING LAB purposes only.
 * These are intentionally simple test credentials for learning purposes.
 * DO NOT use in production environments.
 */

import Profile from '@/lib/models/Profile'
import connectDB from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

interface SeedUser {
  email: string
  password: string
  full_name: string
  role: 'admin' | 'user'
  is_verified: boolean
}

/**
 * PENTESTING LAB: Test user credentials
 * These passwords are intentionally simple for educational purposes.
 * In production, use environment variables and strong passwords.
 */
const seedUsersData: SeedUser[] = [
  {
    email: 'anaprietoper@protonmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123secure',
    full_name: 'Ana Prieto',
    role: 'admin',
    is_verified: true,
  },
  {
    email: 'julian230902@protonmail.com',
    password: process.env.USER_PASSWORD || 'lovely',
    full_name: 'Julian Garcia',
    role: 'user',
    is_verified: true,
  },
]

export async function seedUsers(): Promise<void> {
  await connectDB()

  for (const userData of seedUsersData) {
    const existingUser = await Profile.findOne({ email: userData.email.toLowerCase() })
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    if (existingUser) {
      // Update existing user to ensure correct role, verified status, and password
      await Profile.updateOne(
        { email: userData.email.toLowerCase() },
        {
          $set: {
            role: userData.role,
            is_verified: userData.is_verified,
            full_name: userData.full_name,
            password: hashedPassword,
          },
        }
      )
      console.log(`Updated existing user: ${userData.email}`)
    } else {
      // Create new user with hashed password
      await Profile.create({
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        full_name: userData.full_name,
        role: userData.role,
        is_verified: userData.is_verified,
        balance: 0.0,
        subscription_status: 'free',
        stats: {
          posts_count: 0,
          followers_count: 0,
          following_count: 0,
        },
      })
      console.log(`Created user: ${userData.email}`)
    }
  }

  console.log('Seed completed successfully!')
}

// Export for API usage
export default seedUsers
