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
import { testCredentials } from '@/lib/pentesting/credentials';

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
      users: testCredentials
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
