import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'

/**
 * VULNERABILITY 1: File Upload Bypass
 * 
 * This endpoint demonstrates a file upload bypass technique:
 * Double Extension: Using double extension to bypass file type restrictions
 *    Format: shell.php.jp2
 * 
 * The validation only checks for double extension pattern (*.php.jp2).
 * Only anaprietoper@protonmail.com can use this bypass.
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

/**
 * Validates if filename has the double extension pattern (*.php.jp2)
 * Only for the specific user anaprietoper@protonmail.com
 */
function hasDoubleExtension(filename: string): boolean {
  return filename.endsWith('.php.jp2')
}

/**
 * GET handler - Returns 403 Forbidden
 * This is the "protected" endpoint that appears to be blocked
 */
export async function GET(request: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      error: '403 Forbidden - Access Denied',
      message: 'You do not have permission to access this resource',
      path: '/admin/upload',
      method: 'GET'
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'X-Protected-Resource': 'admin-upload-panel',
        'X-Block-Reason': 'access-restriction'
      }
    }
  )
}

/**
 * POST handler - File Upload with vulnerable validation
 * VULNERABILITY: Weak validation allows double extension bypass (*.php.jp2)
 */
export async function POST(request: NextRequest) {
  // Authentication check - verify user is authenticated
  const user = await getCurrentUser()
  if (!user) {
    console.warn('[SECURITY] Unauthorized access attempt to /admin/upload - No user session')
    return new NextResponse(
      JSON.stringify({ error: 'No autenticado. Debe iniciar sesión.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
  
  // Authorization check - verify user is admin
  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') {
    console.warn(`[SECURITY] Unauthorized access attempt to /admin/upload - User: ${user.email} (ID: ${user.id}) - Role: ${profile?.role || 'unknown'}`)
    return new NextResponse(
      JSON.stringify({ error: 'Acceso denegado. Solo administradores pueden acceder a este recurso.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }
  
  // Check if user is allowed to use the double extension bypass
  const isAuthorizedForBypass = user.email === 'anaprietoper@protonmail.com'
  
  const contentType = request.headers.get('content-type') || ''
  
  // Check if it's a file upload request
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      
      if (!file) {
        return new NextResponse(
          JSON.stringify({ error: 'No se ha seleccionado ningún archivo' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      const filename = file.name
      
      // Get file buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // VULNERABILIDAD: Validación de doble extensión
      // Solo acepta archivos con formato *.php.jp2 para el usuario autorizado
      if (!hasDoubleExtension(filename)) {
        return new NextResponse(
          JSON.stringify({ error: 'Solo se permiten archivos con el formato *.php.jp2' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      if (!isAuthorizedForBypass) {
        return new NextResponse(
          JSON.stringify({ error: 'No tiene permisos para subir archivos con este método de bypass' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // Guardar archivo en el directorio de uploads
      const uploadsDir = path.join(process.cwd(), 'uploads')
      
      // Crear directorio si no existe
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
      
      // VULNERABLE: Guarda el archivo con su nombre original sin sanitizar
      const filePath = path.join(uploadsDir, filename)
      await writeFile(filePath, buffer)
      
      return new NextResponse(
        JSON.stringify({
          success: true,
          message: 'Archivo subido exitosamente',
          filename: filename,
          path: `/uploads/${filename}`,
          size: file.size
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Error al procesar el archivo' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  // Si no es upload, mostrar el formulario
  const htmlResponse = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin File Upload - Bypass Successful</title>
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
          max-width: 500px;
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
        form {
          margin-top: 20px;
        }
        input[type="file"] {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 2px dashed #4a5568;
          border-radius: 5px;
          background-color: #1a1a2e;
          color: #eee;
        }
        button {
          background-color: #00ff88;
          color: #000;
          padding: 12px 30px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          width: 100%;
        }
        button:hover {
          background-color: #00cc6a;
        }
        .info-note {
          background-color: #0f3460;
          color: #eee;
          padding: 10px;
          border-radius: 5px;
          margin-top: 20px;
          font-size: 12px;
          border-left: 4px solid #00aaff;
        }
        .info-note a {
          color: #00aaff;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="success-badge">ACCESS GRANTED</span>
        <h1>🔓 Admin File Upload</h1>
        
        <div class="info-box">
          <p><strong>Status:</strong> Bypass Successful</p>
          <p><strong>Method Used:</strong> POST</p>
          <p><strong>Vulnerability:</strong> File Upload via Double Extension (*.php.jp2)</p>
        </div>
        
        <p>You have successfully accessed the admin file upload panel. Use double extension files (*.php.jp2) to bypass file type restrictions.</p>
        
        <form method="POST" enctype="multipart/form-data">
          <h3>Upload File</h3>
          <input type="file" name="file" />
          <button type="submit">Upload</button>
        </form>
        
        <div class="info-note">
          <strong>📝 Solo archivos con doble extensión son aceptados:</strong> Los archivos deben tener el formato exacto: *.php.jp2 (ejemplo: shell.php.jp2). Solo disponible para anaprietoper@protonmail.com
        </div>
      </div>
    </body>
    </html>
  `
  
  return new NextResponse(htmlResponse, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Vulnerability': '403-bypass-method-change',
      'X-Access-Status': 'granted'
    }
  })
}
