import { NextRequest, NextResponse } from 'next/server'

/**
 * VULNERABILITY: 403 Bypass via HTTP Method Change
 * 
 * This endpoint demonstrates a common misconfiguration where access control
 * is only applied to certain HTTP methods, allowing attackers to bypass
 * 403 restrictions by simply changing the request method.
 * 
 * Vulnerability flow:
 * 1. GET /admin/upload → 403 Forbidden (blocked)
 * 2. POST /admin/upload → 200 OK (bypass successful)
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 * This simulates a real-world misconfiguration in access control.
 */

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
 * POST handler - Returns 200 OK (Bypass vulnerability)
 * This is the vulnerable bypass - the same endpoint allows POST access
 */
export async function POST(request: NextRequest) {
  // VULNERABILITY: POST method bypasses the 403 restriction
  // In a real application, this would be a serious security flaw
  
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
        .vulnerability-note {
          background-color: #ff6b6b;
          color: #000;
          padding: 10px;
          border-radius: 5px;
          margin-top: 20px;
          font-size: 12px;
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
        
        <div class="vulnerability-note">
          <strong>⚠️ Educational Note:</strong> This demonstrates a real-world vulnerability where access controls are only applied to specific HTTP methods. Always validate access for ALL HTTP methods in production systems.
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
