import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'

/**
 * VULNERABILITY: 403 Bypass via Specific User Check
 * 
 * This endpoint implements a privileged bypass mechanism that only allows
 * a specific user (anaprietoper@protonmail.com) to bypass the 403 restriction.
 * 
 * Bypass conditions:
 * 1. User must be authenticated
 * 2. User email must be exactly "anaprietoper@protonmail.com"
 * 3. Can use X-Bypass-User header to indicate bypass attempt
 * 
 * Security notes:
 * - Only the specific email has bypass privileges
 * - Other admin accounts (like anaprietoper@econoky) cannot bypass
 * - Regular users cannot bypass
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

const PRIVILEGED_USER_EMAIL = 'anaprietoper@protonmail.com'

/**
 * GET handler - Returns 403 Forbidden by default
 * Allows bypass only for the specific privileged user
 */
export async function GET(request: NextRequest) {
  try {
    // Check for authenticated user
    const user = await getCurrentUser()
    
    // Check if bypass is requested via header
    const bypassHeader = request.headers.get('X-Bypass-User')
    
    // VULNERABILITY: Special bypass for specific user
    // Only anaprietoper@protonmail.com can bypass the 403
    if (user && user.email === PRIVILEGED_USER_EMAIL && bypassHeader === 'true') {
      // Bypass successful - show privileged content
      const profile = await getProfile(user.id)
      
      const successHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Uploads - Access Granted</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #1a1a2e;
      color: #eee;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      background-color: #16213e;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
    }
    h1 {
      color: #00ff88;
      margin-bottom: 10px;
    }
    .success-badge {
      background-color: #00ff88;
      color: #000;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      display: inline-block;
      margin-bottom: 20px;
    }
    .info-box {
      background-color: #0f3460;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      border-left: 4px solid #00ff88;
    }
    .info-box p {
      margin: 5px 0;
    }
    .user-info {
      background-color: #0f3460;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
      border-left: 4px solid #00aaff;
    }
    .privileged-note {
      background-color: #4a1a1a;
      color: #ffcccc;
      padding: 10px;
      border-radius: 5px;
      margin-top: 20px;
      border-left: 4px solid #ff4444;
    }
  </style>
</head>
<body>
  <div class="container">
    <span class="success-badge">ACCESS GRANTED</span>
    <h1>🔓 Admin Uploads Panel</h1>
    
    <div class="info-box">
      <p><strong>Status:</strong> Bypass Successful</p>
      <p><strong>Method Used:</strong> Privileged User Bypass</p>
      <p><strong>Vulnerability:</strong> 403 Bypass via User-Specific Permission</p>
    </div>
    
    <p>¡Acceso privilegiado concedido! Solo tu cuenta tiene permisos especiales para acceder a este panel.</p>
    
    <div class="user-info">
      <p><strong>Usuario:</strong> ${user.email}</p>
      <p><strong>Nombre:</strong> ${profile?.full_name || 'N/A'}</p>
      <p><strong>Rol:</strong> ${profile?.role || 'user'}</p>
      <p><strong>Estado:</strong> Verificado</p>
    </div>
    
    <div class="privileged-note">
      <strong>⚠️ Nota de Seguridad:</strong> Este acceso es exclusivo para la cuenta anaprietoper@protonmail.com. Ninguna otra cuenta, incluyendo otros administradores, puede utilizar este bypass.
    </div>
  </div>
</body>
</html>
      `.trim()
      
      return new NextResponse(successHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Vulnerability': '403-bypass-privileged-user',
          'X-Access-Status': 'granted',
          'X-Privileged-User': user.email
        }
      })
    }
    
    // Default: Return 403 Forbidden
    return new NextResponse(
      JSON.stringify({
        error: '403 Forbidden - Access Denied',
        message: 'You do not have permission to access this resource',
        path: '/admin/uploads',
        method: 'GET',
        hint: 'Only specific privileged users can access this endpoint'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Protected-Resource': 'admin-uploads-panel',
          'X-Block-Reason': 'access-restriction'
        }
      }
    )
  } catch (error) {
    console.error('[ERROR] /admin/uploads GET:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}

/**
 * POST handler - Also protected with same bypass mechanism
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const bypassHeader = request.headers.get('X-Bypass-User')
    
    // Check for privileged user bypass
    if (user && user.email === PRIVILEGED_USER_EMAIL && bypassHeader === 'true') {
      return new NextResponse(
        JSON.stringify({
          success: true,
          message: 'POST access granted for privileged user',
          user: user.email
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'X-Access-Status': 'granted'
          } 
        }
      )
    }
    
    // Default: Return 403 Forbidden
    return new NextResponse(
      JSON.stringify({
        error: '403 Forbidden - Access Denied',
        message: 'You do not have permission to access this resource',
        path: '/admin/uploads',
        method: 'POST'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Protected-Resource': 'admin-uploads-panel',
          'X-Block-Reason': 'access-restriction'
        }
      }
    )
  } catch (error) {
    console.error('[ERROR] /admin/uploads POST:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}
