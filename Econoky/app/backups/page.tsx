/**
 * VULNERABILITY: 403 Forbidden Bypass - Page Route
 * 
 * This page implements a security misconfiguration where:
 * 1. Direct access to /backups is blocked and redirects to a 403 page
 * 2. The restriction can be bypassed using techniques like:
 *    - Trailing slash: /backups/
 *    - Direct API access: /api/backups/
 *    - Header manipulation
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

import { headers } from 'next/headers';
import { testCredentials } from '@/lib/pentesting/credentials';

export default async function BackupsPage() {
  const headersList = await headers();
  
  // VULNERABILITY: Header-based bypass detection
  // Check for bypass headers that attackers commonly use
  const xOriginalUrl = headersList.get('X-Original-URL');
  const xRewriteUrl = headersList.get('X-Rewrite-URL');
  const xForwardedPath = headersList.get('X-Forwarded-Path');
  
  // If bypass headers are present, show the sensitive data
  const bypassDetected = xOriginalUrl || xRewriteUrl || xForwardedPath;
  
  if (!bypassDetected) {
    // For demonstration, we'll show a 403 forbidden page
    // In a real bypass scenario, Next.js routing with trailing slash would work
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">403</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Forbidden</h1>
          <p className="text-gray-600 mb-4">
            Access to backup files is restricted. This area is for authorized personnel only.
          </p>
          {/* VULNERABILITY: Information leakage - hints about the resource */}
          <p className="text-sm text-gray-400">
            Error code: BACKUP_ACCESS_DENIED
          </p>
        </div>
      </div>
    );
  }
  
  // VULNERABILITY: Credentials exposed after bypass
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🔐 Backup System - User Credentials
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Last backup: 2024-11-29 | Total users: {testCredentials.length}
          </p>
          
          {/* VULNERABILITY: User data displayed */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testCredentials.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* JSON export for easy copying */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-green-400 mb-2">// Raw JSON Export:</p>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(testCredentials, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
