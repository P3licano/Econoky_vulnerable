import { NextRequest, NextResponse } from 'next/server'
import { seedUsers } from '@/lib/db/seed'

/**
 * POST /api/admin/seed
 * Seeds the database with initial users.
 * In production, this should be protected with admin authentication.
 */
export async function POST(request: NextRequest) {
  try {
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
