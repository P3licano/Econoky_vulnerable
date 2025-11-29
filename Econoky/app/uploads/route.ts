import { NextRequest, NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import path from 'path'

/**
 * VULNERABILIDAD: 403 Bypass via X-Forwarded-For
 * 
 * Este endpoint implementa una restricción de acceso basada en IP que solo permite
 * acceso desde localhost. Sin embargo, confía ciegamente en el header X-Forwarded-For
 * sin validación adecuada, permitiendo a un atacante bypasear la restricción.
 * 
 * VULNERABILIDAD: Directory Listing
 * Expone todos los archivos del directorio uploads, permitiendo al atacante
 * localizar su reverse shell entre los archivos señuelo.
 * 
 * Flujo de explotación:
 * 1. Sin header: GET /uploads → 403 Forbidden
 * 2. Con header: GET /uploads + X-Forwarded-For: 127.0.0.1 → 200 OK (muestra directorio)
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function GET(request: NextRequest) {
  // VULNERABILIDAD: Confiar en X-Forwarded-For sin validación
  // El atacante puede falsificar este header para bypasear restricciones de IP
  const xForwardedFor = request.headers.get('x-forwarded-for')
  
  // Verificación "segura" de IP - solo localhost puede acceder
  // VULNERABLE: El atacante puede simplemente agregar X-Forwarded-For: 127.0.0.1
  if (xForwardedFor !== '127.0.0.1') {
    return new NextResponse(
      JSON.stringify({
        error: '403 Forbidden',
        message: 'Access Denied - This directory is restricted',
        hint: 'Only internal access allowed'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Protected-Resource': 'uploads-directory',
          'X-Block-Reason': 'ip-restriction'
        }
      }
    )
  }
  
  // Si el bypass fue exitoso, mostrar listado de archivos
  try {
    const files = await readdir(UPLOADS_DIR)
    // Filtrar archivos ocultos como .gitkeep
    const visibleFiles = files.filter(f => !f.startsWith('.'))
    
    // Generar HTML con listado de directorio estilo Apache/nginx
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Index of /uploads</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #e0e0e0; }
    h1 { color: #4CAF50; border-bottom: 1px solid #333; padding-bottom: 10px; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px 0; border-bottom: 1px solid #333; }
    a { color: #64B5F6; text-decoration: none; }
    a:hover { text-decoration: underline; color: #90CAF9; }
    .file-icon { margin-right: 10px; }
    .parent { color: #888; }
  </style>
</head>
<body>
  <h1>📁 Index of /uploads</h1>
  <ul>
    <li class="parent"><span class="file-icon">📂</span><a href="/">..</a></li>
    ${visibleFiles.map(file => `<li><span class="file-icon">📄</span><a href="/uploads/${file}">${file}</a></li>`).join('\n    ')}
  </ul>
  <hr>
  <p style="color: #666; font-size: 12px;">Directory listing enabled - ${visibleFiles.length} files</p>
</body>
</html>
    `.trim()
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'X-Vulnerability': '403-bypass-directory-listing',
        'X-Access-Granted': 'true'
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Error al listar directorio',
      message: (error as Error).message
    }, { status: 500 })
  }
}
