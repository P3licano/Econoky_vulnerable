/**
 * VULNERABILITY: 403 Bypass via API Catch-All Route + NoSQL Injection
 * 
 * This API route handles requests like:
 *   - /api/backups/anything  (any subpath)
 *   - /api/backups/.         (path traversal)
 *   - /api/backups/credentials
 * 
 * Since the middleware only blocks exact "/api/backups" path,
 * these variations slip through and expose sensitive data.
 * 
 * VULNERABILITY #2: NoSQL Injection
 * The endpoint accepts JSON objects in query parameters and POST body
 * that are passed directly to MongoDB without sanitization.
 * 
 * Exploitation examples:
 * - GET: ?userType={"$ne": null} - bypasses userType filter
 * - GET: ?status={"$ne": "basic"} - shows premium/admin users
 * - POST: {"userType": {"$ne": null}} - same via POST body
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { testCredentials } from '@/lib/pentesting/credentials';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    slug: string[];
  }>;
}

/**
 * VULNERABLE: Parse query parameter as JSON if it contains special characters
 * This allows NoSQL operators like $ne, $gt, $regex to be injected
 */
function parseVulnerableParam(value: string | null, defaultValue: string): string | object {
  if (!value) return defaultValue;
  
  // VULNERABILITY: Attempt to parse JSON from query string
  // This allows injection of MongoDB operators
  if (typeof value === 'string' && (value.includes('{') || value.includes('$'))) {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return value;
    }
  }
  return value;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  const subpath = resolvedParams.slug?.join('/') || '';
  const searchParams = request.nextUrl.searchParams;
  
  // Get query parameters
  const userTypeParam = searchParams.get('userType');
  const statusParam = searchParams.get('status');
  
  // VULNERABILITY: Parse JSON from query params - allows NoSQL injection
  // Attackers can inject operators like {"$ne": null} to bypass filters
  const userType = parseVulnerableParam(userTypeParam, 'basic');
  const accountStatus = parseVulnerableParam(statusParam, 'active');
  
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      // Fallback to original behavior if DB not available
      return NextResponse.json({
        success: true,
        message: 'Backup data retrieved successfully',
        bypass_info: {
          method: 'path_traversal',
          accessed_path: `/api/backups/${subpath}`,
          warning: '403 bypass successful - access control misconfiguration detected'
        },
        data: {
          backup_date: '2024-11-29',
          backup_type: 'user_credentials',
          users: testCredentials.map(user => ({ email: user.email }))
        }
      });
    }
    
    const collection = db.collection('users_backup');
    
    // VULNERABILITY: Query object built directly from user input
    // No sanitization - MongoDB operators pass through directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    // VULNERABILITY: User-controlled values go directly into query
    if (userType) {
      query.userType = userType;
    }
    
    if (accountStatus) {
      query.accountStatus = accountStatus;
    }
    
    // Execute the vulnerable query
    const users = await collection.find(query).toArray();
    
    return NextResponse.json({
      success: true,
      message: 'Backup data retrieved successfully',
      bypass_info: {
        method: 'path_traversal_and_nosql_injection',
        accessed_path: `/api/backups/${subpath}`,
        query_used: query,
        warning: '403 bypass successful - NoSQL injection vulnerability active'
      },
      data: {
        backup_date: '2024-11-29',
        backup_type: 'users_backup',
        total_records: users.length,
        // VULNERABILITY: Returns all sensitive data including credit cards, addresses, flags
        users: users
      }
    });
  } catch (error) {
    console.error('Backup query error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to query backup data',
      details: String(error)
    }, { status: 500 });
  }
}

/**
 * VULNERABILITY: POST endpoint with direct body to query mapping
 * Even more dangerous as JSON is accepted natively
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  const subpath = resolvedParams.slug?.join('/') || '';
  
  try {
    // VULNERABILITY: Accept body directly without any sanitization
    // This is extremely dangerous - attackers can inject any MongoDB operator
    const body = await request.json();
    
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 });
    }
    
    const collection = db.collection('users_backup');
    
    // VULNERABILITY: Query built directly from POST body
    // No validation or sanitization whatsoever
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    // VULNERABILITY: Direct assignment from user input
    if (body.userType !== undefined) {
      query.userType = body.userType;
    } else {
      query.userType = 'basic';
    }
    
    if (body.accountStatus !== undefined) {
      query.accountStatus = body.accountStatus;
    }
    
    // VULNERABILITY: Additional fields can be injected via POST
    // Attacker can add any field to narrow down or widen search
    if (body.email !== undefined) {
      query.email = body.email;
    }
    
    if (body.name !== undefined) {
      query.name = body.name;
    }
    
    // Execute the vulnerable query
    const users = await collection.find(query).toArray();
    
    return NextResponse.json({
      success: true,
      message: 'Backup data retrieved via POST',
      bypass_info: {
        method: 'nosql_injection_via_post',
        accessed_path: `/api/backups/${subpath}`,
        query_used: query,
        warning: 'NoSQL injection successful - sensitive data exposed'
      },
      data: {
        backup_date: '2024-11-29',
        backup_type: 'users_backup',
        total_records: users.length,
        // VULNERABILITY: Returns all sensitive data
        users: users
      }
    });
  } catch (error) {
    console.error('Backup POST query error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process backup request',
      details: String(error)
    }, { status: 500 });
  }
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Backup-Status': 'available',
      'X-Backup-Count': '7',
      'X-Bypass-Method': 'path-traversal-and-nosql',
      'X-Injection-Hint': 'Try ?userType={"$ne":null}'
    }
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, HEAD, OPTIONS',
      'X-Backup-Info': 'Credentials backup endpoint - bypass active',
      'X-Vulnerability': 'NoSQL Injection enabled'
    }
  });
}
