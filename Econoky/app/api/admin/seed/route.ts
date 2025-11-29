import { NextRequest, NextResponse } from 'next/server'
import { seedUsers } from '@/lib/db/seed'

/**
 * POST /api/admin/seed
 * Seeds the database with initial users.
 * 
 * SECURITY: Protected with a seed secret key.
 * In development, if no SEED_SECRET is set, seeding is allowed.
 * In production, SEED_SECRET must be provided in the request header.
 * 
 * PENTESTING LAB: This endpoint is for educational purposes.
 */
export async function POST(request: NextRequest) {
  try {
    // Check for seed authorization
    const seedSecret = process.env.SEED_SECRET
    const providedSecret = request.headers.get('X-Seed-Secret')
    
    // In production, require the seed secret
    if (process.env.NODE_ENV === 'production' && seedSecret) {
      if (!providedSecret || providedSecret !== seedSecret) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing seed secret' },
          { status: 401 }
        )
      }
    }
    
    await seedUsers()
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with verified users',
    })
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: error.message || 'Error seeding database' },
      { status: 500 }
    )
  }
}
