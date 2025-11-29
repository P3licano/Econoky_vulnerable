import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * VULNERABILIDAD 3: 403 Bypass con X-Forwarded-For
 * 
 * Este endpoint simula una restricción de IP que solo permite acceso desde localhost.
 * Sin embargo, confía ciegamente en el header X-Forwarded-For sin validación,
 * permitiendo a un atacante bypasear la restricción.
 * 
 * Flujo de explotación:
 * 1. Sin header: GET /api/uploads/shell.php.jpg → 403 Forbidden
 * 2. Con header: GET /api/uploads/shell.php.jpg + X-Forwarded-For: 127.0.0.1 → 200 OK
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function GET(
  request: NextRequest,
  { params }: { params: { file: string } }
) {
  const filename = params.file
  
  // VULNERABILIDAD 3: Verificación de IP bypasseable
  // Confía ciegamente en el header X-Forwarded-For sin validación
  // Un atacante puede simplemente agregar este header para bypasear
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const clientIp = xForwardedFor?.split(',')[0]?.trim() || 
                   request.headers.get('x-real-ip') ||
                   '0.0.0.0'
  
  // Verificación "segura" de IP - solo localhost puede acceder
  // VULNERABLE: El atacante puede falsificar X-Forwarded-For
  const allowedIps = ['127.0.0.1', '::1', 'localhost']
  
  if (!allowedIps.includes(clientIp)) {
    return new NextResponse(
      JSON.stringify({
        error: '403 Forbidden',
        message: 'Access restricted to localhost only',
        yourIp: clientIp,
        hint: 'This resource can only be accessed from 127.0.0.1',
        vulnerability: 'IP restriction can be bypassed using X-Forwarded-For header'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Protected-Resource': 'uploads',
          'X-Block-Reason': 'ip-restriction',
          'X-Client-IP': clientIp
        }
      }
    )
  }
  
  // Si pasa la validación de IP, servir el archivo
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
    
    // Determinar Content-Type
    const contentTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.json': 'application/json',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.php': 'text/plain', // Mostrar PHP como texto (simula ejecución)
      '.xml': 'application/xml'
    }
    
    // NOTA: En un escenario real, archivos PHP serían ejecutados por el servidor
    // Aquí simplemente mostramos el contenido como texto para demostrar el concepto
    const contentType = contentTypes[ext] || 'application/octet-stream'
    
    // Si es un archivo PHP, simular "ejecución" mostrando el código
    // En un servidor vulnerable real, PHP sería interpretado
    const fileContent = content.toString()
    
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'X-Vulnerability': '403-bypass-x-forwarded-for',
        'X-Access-Granted': 'true',
        'X-Client-IP': clientIp
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Error al leer el archivo',
      message: (error as Error).message
    }, { status: 500 })
  }
}
