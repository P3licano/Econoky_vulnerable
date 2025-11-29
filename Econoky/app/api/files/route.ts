import { NextRequest, NextResponse } from 'next/server'
import { readFile, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * VULNERABILIDAD 2: Path Traversal
 * 
 * Este endpoint es vulnerable a path traversal porque:
 * 1. No sanitiza el parámetro 'path' de la query string
 * 2. Permite uso de '../' para navegar fuera del directorio base
 * 3. Permite acceder a archivos arbitrarios del sistema
 * 
 * Ejemplos de explotación:
 * - GET /api/files?path=../../../etc/passwd
 * - GET /api/files?path=../../../uploads/shell.php.jpg
 * - GET /api/files?path=../../public/uploads/malicious.php
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

// Directorio base "seguro" para servir archivos
const BASE_DIR = path.join(process.cwd(), 'public', 'assets')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filePath = searchParams.get('path')
  
  if (!filePath) {
    // Si no se proporciona path, listar archivos del directorio base
    try {
      const files = await readdir(BASE_DIR, { recursive: false })
      return NextResponse.json({
        message: 'Directorio de archivos',
        files: files,
        hint: 'Usa el parámetro path para acceder a archivos específicos',
        example: '/api/files?path=archivo.txt'
      })
    } catch (error) {
      return NextResponse.json({
        error: 'Error al listar archivos',
        hint: 'El directorio base puede no existir'
      }, { status: 500 })
    }
  }
  
  // VULNERABILIDAD: Path Traversal
  // No sanitiza el path, permite navegar fuera del directorio base con ../
  // Un path seguro sería: path.join(BASE_DIR, path.basename(filePath))
  const fullPath = path.join(BASE_DIR, filePath)
  
  // Verificar si el archivo existe
  if (!existsSync(fullPath)) {
    return NextResponse.json({
      error: 'Archivo no encontrado',
      requestedPath: filePath,
      resolvedPath: fullPath,
      hint: 'Intenta con diferentes rutas...'
    }, { status: 404 })
  }
  
  try {
    const fileStat = await stat(fullPath)
    
    if (fileStat.isDirectory()) {
      // Listar contenido del directorio
      const files = await readdir(fullPath)
      return NextResponse.json({
        type: 'directory',
        path: filePath,
        files: files
      })
    }
    
    // Leer y devolver el contenido del archivo
    const content = await readFile(fullPath)
    const filename = path.basename(fullPath)
    const ext = path.extname(fullPath).toLowerCase()
    
    // Determinar Content-Type basado en extensión
    const contentTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.json': 'application/json',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.php': 'text/plain', // Mostrar PHP como texto para ver el contenido
      '.xml': 'application/xml'
    }
    
    const contentType = contentTypes[ext] || 'application/octet-stream'
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'X-Vulnerability': 'path-traversal',
        'X-Resolved-Path': fullPath
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Error al leer el archivo',
      message: (error as Error).message
    }, { status: 500 })
  }
}
