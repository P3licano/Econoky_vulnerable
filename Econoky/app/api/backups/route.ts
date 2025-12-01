/**
 * VULNERABILITY: 403 Forbidden Bypass
 * 
 * This endpoint implements a common security misconfiguration where:
 * 1. Direct access to /api/backups returns 403 Forbidden
 * 2. The restriction can be bypassed using various techniques:
 *    - Adding trailing slash: /api/backups/
 *    - Using X-Original-URL header
 *    - Using X-Rewrite-URL header
 *    - Path normalization: /api/backups/.
 * 
 * This simulates a real-world vulnerability where access controls
 * are implemented incorrectly at the application layer.
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { testCredentials } from '@/lib/pentesting/credentials';

/**
 * VULNERABILITY: Weak Access Control Check
 * 
 * This function demonstrates a flawed security check that can be bypassed.
 * The check only looks at the exact URL path without considering:
 * - Trailing slashes
 * - Path normalization
 * - HTTP headers that might indicate URL rewriting
 */
function checkAccessRestriction(request: NextRequest): boolean {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // VULNERABILITY: Header-based bypass
  // Some reverse proxies/WAFs use these headers for URL rewriting
  // An attacker can manually set these headers to bypass restrictions
  const xOriginalUrl = request.headers.get('X-Original-URL');
  const xRewriteUrl = request.headers.get('X-Rewrite-URL');
  
  // If bypass headers are present, allow access (vulnerable behavior)
  if (xOriginalUrl || xRewriteUrl) {
    return false; // Not restricted - bypass successful
  }
  
  // VULNERABILITY: Exact path matching without normalization
  // This only blocks /api/backups exactly, but not /api/backups/ or /api/backups/.
  if (pathname === '/api/backups') {
    return true; // Restricted
  }
  
  // Any other variation is allowed (bypass successful)
  return false;
}

export async function GET(request: NextRequest) {
  // Check if access should be restricted
  const isRestricted = checkAccessRestriction(request);
  
  if (isRestricted) {
    // VULNERABILITY: Information leakage in error response
    // The error message hints that the resource exists
    return NextResponse.json(
      { 
        error: 'Forbidden',
        message: 'Access to backup files is restricted',
        status: 403
      },
      { status: 403 }
    );
  }
  
  // Access granted - return sensitive credentials
  // VULNERABILITY: Credentials exposure after bypass
  // Note: Roles are hidden to increase difficulty
  return NextResponse.json({
    success: true,
    message: 'Backup data retrieved successfully',
    data: {
      backup_date: '2024-11-29',
      backup_type: 'user_credentials',
      users: testCredentials.map(user => ({ email: user.email }))
    }
  });
}

// VULNERABILITY: Method-based bypass
// HEAD and OPTIONS methods might not have the same restrictions
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Backup-Status': 'available',
      'X-Backup-Count': '5'
    }
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'X-Backup-Info': 'Credentials backup endpoint'
    }
  });
}
