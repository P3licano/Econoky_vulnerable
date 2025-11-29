import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * VULNERABILIDAD: 403 Bypass via X-Forwarded-For
 * 
 * Este endpoint permite acceso a archivos individuales en /uploads después de
 * bypasear la restricción de IP usando el header X-Forwarded-For.
 * 
 * Flujo de explotación:
 * 1. Sin header: GET /uploads/shell.php.jpg → 403 Forbidden
 * 2. Con header: GET /uploads/shell.php.jpg + X-Forwarded-For: 127.0.0.1 → 200 OK
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  // VULNERABILIDAD: Decodificar URL para permitir path traversal
  // El atacante puede usar ../../../ para navegar fuera del directorio
  const filename = decodeURIComponent(params.filename)
  
  // VULNERABILIDAD: Confiar en X-Forwarded-For sin validación
  // El atacante puede falsificar este header para bypasear restricciones de IP
  const xForwardedFor = request.headers.get('x-forwarded-for')
  
  // Verificación "segura" de IP - solo localhost puede acceder
  // VULNERABLE: El atacante puede simplemente agregar X-Forwarded-For: 127.0.0.1
  if (xForwardedFor !== '127.0.0.1') {
    return new NextResponse(
      JSON.stringify({
        error: '403 Forbidden',
        message: 'Access Denied',
        filename: filename,
        hint: 'This file is restricted to internal access only'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Protected-Resource': 'uploads-file',
          'X-Block-Reason': 'ip-restriction'
        }
      }
    )
  }
  
  // VULNERABILIDAD: Path Traversal - no sanitiza ../ en el filename
  // Permite navegar fuera del directorio uploads
  const filePath = path.join(UPLOADS_DIR, filename)
  
  if (!existsSync(filePath)) {
    return NextResponse.json({
      error: 'Archivo no encontrado',
      filename: filename,
      path: `/uploads/${filename}`
    }, { status: 404 })
  }
  
  try {
    const content = await readFile(filePath)
    const ext = path.extname(filename).toLowerCase()
    
    // Determinar Content-Type basado en extensión
    const contentTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.json': 'application/json',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.php': 'text/plain', // PHP mostrado como texto (simula entorno vulnerable)
      '.xml': 'application/xml'
    }
    
    const contentType = contentTypes[ext] || 'application/octet-stream'
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filename)}"`,
        'X-Vulnerability': '403-bypass-file-access',
        'X-Access-Granted': 'true'
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Error al leer el archivo',
      message: (error as Error).message
    }, { status: 500 })
  }
}
