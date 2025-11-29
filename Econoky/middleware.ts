import { type NextRequest, NextResponse } from 'next/server'

/**
 * VULNERABILITY: 403 Bypass Implementation
 * 
 * This middleware demonstrates common access control misconfigurations
 * that allow attackers to bypass 403 Forbidden restrictions.
 * 
 * Bypass techniques that work:
 * 1. Trailing slash: /backups/ instead of /backups
 * 2. Path traversal: /backups/. or /backups/./
 * 3. URL encoding: /backups%2f
 * 4. Headers: X-Original-URL, X-Rewrite-URL
 * 5. Case manipulation (on case-insensitive systems)
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */
export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // VULNERABILITY: Header-based bypass
  // Some WAFs and reverse proxies use these headers for URL rewriting
  // An attacker can set these headers to bypass path-based restrictions
  const xOriginalUrl = request.headers.get('X-Original-URL');
  const xRewriteUrl = request.headers.get('X-Rewrite-URL');
  
  // If bypass headers point to a different URL, skip the restriction
  if (xOriginalUrl || xRewriteUrl) {
    // Allow the request through - bypass successful
    return NextResponse.next();
  }
  
  // VULNERABILITY: Exact string matching without normalization
  // This ONLY blocks the exact path "/backups" or "/api/backups"
  // It does NOT block:
  //   - /backups/   (trailing slash)
  //   - /backups/.  (path traversal)
  //   - /BACKUPS    (case variation - depends on server)
  //   - /backups%2f (URL encoded)
  
  const blockedPaths = ['/backups', '/api/backups'];
  
  if (blockedPaths.includes(pathname)) {
    // Return 403 Forbidden for exact matches only
    return new NextResponse(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Access to this resource is restricted',
        status: 403,
        // VULNERABILITY: Information leakage in error response
        hint: 'Contact administrator for access'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          // VULNERABILITY: Excessive headers that leak information
          'X-Protected-Resource': 'backup-system',
          'X-Block-Reason': 'path-restriction'
        }
      }
    );
  }
  
  // The middleware now just passes requests through
  // Authentication is handled in each page/API route
  return NextResponse.next()
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
