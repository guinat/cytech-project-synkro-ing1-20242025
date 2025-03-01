import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/users';

const Debug: React.FC = () => {
    const { user, logout } = useAuth();
    const [userDetails, setUserDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                const details = await usersApi.getUserById(user.id);
                setUserDetails(details);
            } catch (err: any) {
                setError(err.message || 'Failed to load user details');
                console.error('Error fetching user details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <h1 className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-3xl font-bold font-chakra text-gray-900">Debug</h1>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0 mb-6">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-4">Welcome, {user?.first_name || user?.username}!</h2>
                            <p className="text-gray-600">
                                Basic user information:
                            </p>
                            <ul className="mt-2 list-disc pl-5">
                                <li>Username: {user?.username}</li>
                                <li>Email: {user?.email}</li>
                                <li>Full name: {user?.first_name} {user?.last_name}</li>
                                <li>User ID: {user?.id}</li>
                                <li>Role ID: {user?.role}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="px-4 py-6 sm:px-0">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-4">Complete User Data</h2>

                            {loading && <p className="text-blue-600">Loading details...</p>}
                            {error && <p className="text-red-600">{error}</p>}

                            {!loading && userDetails && (
                                <>
                                    <p className="text-gray-600 mb-2">
                                        All fields from database:
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-gray-600">Field</th>
                                                    <th className="px-4 py-2 text-left text-gray-600">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(userDetails).map(([key, value]) => (
                                                    <tr key={key} className="border-t">
                                                        <td className="px-4 py-2 font-medium">{key}</td>
                                                        <td className="px-4 py-2">
                                                            {typeof value === 'object'
                                                                ? JSON.stringify(value)
                                                                : String(value)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <h3 className="text-lg font-semibold mt-6 mb-2">Raw JSON:</h3>
                                    <pre className="bg-gray-800 text-amber-400 p-4 rounded-lg overflow-auto text-sm">
                                        {JSON.stringify(userDetails, null, 2)}
                                    </pre>
                                </>
                            )}

                            {!loading && user && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Auth Context User Data:</h3>
                                    <pre className="bg-gray-800 text-sky-400 p-4 rounded-lg overflow-auto text-sm">
                                        {JSON.stringify(user, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Local Storage Auth Tokens:</h3>
                                <pre className="bg-gray-800 text-rose-400 p-4 rounded-lg overflow-auto text-sm">
                                    {`{
  "accessToken": "${localStorage.getItem('accessToken')?.substring(0, 20)}...",
  "refreshToken": "${localStorage.getItem('refreshToken')?.substring(0, 20)}..."
}`}
                                </pre>
                                <p className="text-sm text-gray-500 mt-1">
                                    (Tokens truncated for security)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Debug;