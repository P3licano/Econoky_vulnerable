import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * VULNERABILITY 1: File Upload Bypass
 * 
 * This endpoint demonstrates multiple file upload bypass techniques:
 * 1. Double Extension Bypass: shell.php.jpg bypasses extension check
 * 2. Content-Type Spoofing: Changing Content-Type header to image/jpeg
 * 3. Magic Bytes: Adding GIF89a at the start of a PHP file
 * 
 * The validation only checks extension OR Content-Type, making it vulnerable
 * to bypass techniques.
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

// VULNERABILIDAD 1: Validación débil de extensión
// Solo verifica si el nombre del archivo contiene una extensión de imagen
// Vulnerable a doble extensión (shell.php.jpg), Content-Type spoofing, y magic bytes
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']

function hasImageExtension(filename: string): boolean {
  // VULNERABLE: Solo verifica si alguna extensión de imagen está presente en el nombre
  // NO verifica que sea la última extensión
  const lowerFilename = filename.toLowerCase()
  return ALLOWED_IMAGE_EXTENSIONS.some(ext => lowerFilename.includes(ext))
}

function isImageContentType(contentType: string | null): boolean {
  // VULNERABLE: Confía ciegamente en el Content-Type header proporcionado
  if (!contentType) return false
  return contentType.startsWith('image/')
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
 * VULNERABILITY: Weak validation allows multiple bypass techniques
 */
export async function POST(request: NextRequest) {
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
      const fileContentType = file.type
      
      // VULNERABILIDAD 1: Validación débil
      // Solo verifica extensión O Content-Type, no ambos
      // Permite bypass con doble extensión, content-type spoofing, o magic bytes
      const hasValidExtension = hasImageExtension(filename)
      const hasValidContentType = isImageContentType(fileContentType)
      
      // Si el archivo es .php sin ninguna extensión de imagen, rechazar
      // PERO si tiene doble extensión (shell.php.jpg) o content-type image/*, permitir
      if (filename.toLowerCase().endsWith('.php') && !hasValidExtension && !hasValidContentType) {
        return new NextResponse(
          JSON.stringify({ error: 'Solo se permiten archivos de imagen' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // Si no tiene ninguna validación de imagen, rechazar
      if (!hasValidExtension && !hasValidContentType) {
        return new NextResponse(
          JSON.stringify({ error: 'Solo se permiten archivos de imagen' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // Guardar archivo en el directorio de uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      
      // Crear directorio si no existe
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
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
          <p><strong>Vulnerability:</strong> 403 Bypass via HTTP Method Change</p>
        </div>
        
        <p>You have successfully bypassed the 403 restriction by changing the HTTP method from GET to POST.</p>
        
        <form method="POST" enctype="multipart/form-data">
          <h3>Upload File</h3>
          <input type="file" name="file" />
          <button type="submit">Upload</button>
        </form>
        
        <div class="info-note">
          <strong>📝 Los tipos de imagen soportados están aquí:</strong> <a href="https://www.iana.org/assignments/media-types/media-types.xhtml#image" target="_blank">https://www.iana.org/assignments/media-types/media-types.xhtml#image</a>
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
