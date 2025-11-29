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

// Credentials data that will be exposed after bypass
const credentialsData = [
  {
    id: 1,
    email: "anaprietoper@protonmail.com",
    password: "SecurePass2024!",
    role: "admin",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    email: "carlos.mendez@gmail.com",
    password: "CarlosM_2023#",
    role: "user",
    created_at: "2024-02-20T14:45:00Z"
  },
  {
    id: 3,
    email: "maria.rodriguez@outlook.com",
    password: "MaRod!Finance99",
    role: "moderator",
    created_at: "2024-03-10T09:15:00Z"
  },
  {
    id: 4,
    email: "jorge.fernandez@yahoo.es",
    password: "JFernandez@2024",
    role: "user",
    created_at: "2024-04-05T16:20:00Z"
  },
  {
    id: 5,
    email: "lucia.martinez@hotmail.com",
    password: "LuciaM#Econoky1",
    role: "user",
    created_at: "2024-05-12T11:00:00Z"
  }
];

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
            Last backup: 2024-11-29 | Total users: {credentialsData.length}
          </p>
          
          {/* VULNERABILITY: Plaintext credentials displayed */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {credentialsData.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-red-600">{user.password}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* JSON export for easy copying */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-green-400 mb-2">// Raw JSON Export (credentials.json):</p>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(credentialsData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
