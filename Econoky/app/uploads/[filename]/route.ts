import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * VULNERABILIDAD: Directory Listing Protegido vs Archivos Desprotegidos
 * 
 * El listado del directorio requiere bypass con X-Forwarded-For
 * Pero los archivos individuales son accesibles directamente
 * Esto simula una mala configuración de permisos común en servidores
 * 
 * Flujo de explotación:
 * 1. Sin header: GET /uploads → 403 Forbidden (directorio protegido)
 * 2. Con header: GET /uploads + X-Forwarded-For: 127.0.0.1 → 200 OK (muestra listado)
 * 3. Sin header: GET /uploads/shell.php.jpg → 200 OK (archivo accesible directamente)
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
  
  // VULNERABILIDAD: Acceso directo permitido sin protección
  // El directorio /uploads requiere X-Forwarded-For pero los archivos individuales no
  // Esto simula una configuración incorrecta de permisos realista
  
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
    
    // Sanitize filename for Content-Disposition header to prevent header injection
    const safeFilename = path.basename(filename).replace(/[\r\n"]/g, '_')
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFilename}"`,
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
