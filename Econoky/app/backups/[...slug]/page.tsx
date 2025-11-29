/**
 * VULNERABILITY: 403 Bypass via Catch-All Route
 * 
 * This route handles requests like:
 *   - /backups/anything  (any subpath)
 *   - /backups/.         (path traversal)
 *   - /backups/./        (path traversal with trailing slash)
 * 
 * Since the middleware only blocks exact "/backups" path,
 * these variations slip through and expose sensitive data.
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 */

import { testCredentials } from '@/lib/pentesting/credentials';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function BackupsSubPage({ params }: PageProps) {
  const resolvedParams = await params;
  const subpath = resolvedParams.slug?.join('/') || '';
  
  // VULNERABILITY: All subpaths expose the credentials
  // This simulates a misconfigured server where the restriction
  // only applies to the exact path
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* VULNERABILITY: Banner indicating bypass success */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">
            <strong>⚠️ Security Bypass Detected:</strong> Access granted via path variation
            <br />
            <span className="text-sm">Accessed path: /backups/{subpath}</span>
          </p>
        </div>
        
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testCredentials.map((user, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* JSON export for easy copying */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-green-400 mb-2">// Raw JSON Export (credentials.json):</p>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(testCredentials, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
