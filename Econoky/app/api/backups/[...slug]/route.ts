/**
 * VULNERABILITY: 403 Bypass via API Catch-All Route
 * 
 * This API route handles requests like:
 *   - /api/backups/anything  (any subpath)
 *   - /api/backups/.         (path traversal)
 *   - /api/backups/credentials
 * 
 * Since the middleware only blocks exact "/api/backups" path,
 * these variations slip through and expose sensitive data.
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

import { NextRequest, NextResponse } from 'next/server';

// Credentials data that will be exposed after bypass
const credentialsData = [
  {
    id: 1,
    email: "anaprietoper@protonmail.com",
    password: "SecurePass2024!",
    role: "admin",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    email: "carlos.mendez@gmail.com",
    password: "CarlosM_2023#",
    role: "user",
    created_at: "2024-02-20T14:45:00Z"
  },
  {
    id: 3,
    email: "maria.rodriguez@outlook.com",
    password: "MaRod!Finance99",
    role: "moderator",
    created_at: "2024-03-10T09:15:00Z"
  },
  {
    id: 4,
    email: "jorge.fernandez@yahoo.es",
    password: "JFernandez@2024",
    role: "user",
    created_at: "2024-04-05T16:20:00Z"
  },
  {
    id: 5,
    email: "lucia.martinez@hotmail.com",
    password: "LuciaM#Econoky1",
    role: "user",
    created_at: "2024-05-12T11:00:00Z"
  }
];

interface RouteParams {
  params: Promise<{
    slug: string[];
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  const subpath = resolvedParams.slug?.join('/') || '';
  
  // VULNERABILITY: All subpaths expose the credentials
  // The bypass was successful - return sensitive data
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
      users: credentialsData
    }
  });
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Backup-Status': 'available',
      'X-Backup-Count': '5',
      'X-Bypass-Method': 'path-traversal'
    }
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'X-Backup-Info': 'Credentials backup endpoint - bypass active'
    }
  });
}
