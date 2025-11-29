/**
 * Next.js Instrumentation
 * 
 * This file runs once when the server starts.
 * Used to seed the database with initial users for the pentesting lab.
 */

export async function register() {
  // Only run seeding on the server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { seedUsers } = await import('./lib/db/seed')
    try {
      await seedUsers()
      console.log('Database seed completed on startup')
    } catch (error) {
      console.error('Failed to seed database on startup:', error)
    }
  }
}
