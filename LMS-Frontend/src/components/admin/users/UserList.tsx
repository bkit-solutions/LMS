import React, { useEffect, useState } from 'react';
import { authApi, type User } from '../../../services/authApi';

const UserLists: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await authApi.getAllUsers();
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const superAdmins = users.filter(u => u.type === 'SUPERADMIN');
  const admins = users.filter(u => u.type === 'ADMIN');
  const regularUsers = users.filter(u => u.type === 'USER');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-text">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-accent/10 border border-accent/20 p-4 rounded-md">
          <p className="text-accent">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border-b-2 border-primary p-4 sm:p-6 rounded-t-lg shadow-sm mb-6">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text">User Management</h1>
              <p className="text-xs sm:text-sm text-text-secondary">View and manage all system users</p>
            </div>
          </div>
        </div>

        {/* Super Admins */}
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-border">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h2 className="text-base sm:text-lg font-semibold text-text">
                Super Administrators <span className="text-text-secondary font-normal">({superAdmins.length})</span>
              </h2>
            </div>
          </div>
          {superAdmins.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-text-secondary text-sm">
              No super administrators found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {superAdmins.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-text">{user.name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-text-secondary hidden sm:table-cell">{user.email}</td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className="px-2 py-1 inline-flex text-xs font-medium rounded bg-primary text-white">
                          {user.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admins */}
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-border">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-base sm:text-lg font-semibold text-text">
                Administrators <span className="text-text-secondary font-normal">({admins.length})</span>
              </h2>
            </div>
          </div>
          {admins.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-text-secondary text-sm">
              No administrators found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {admins.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-text">{user.name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-text-secondary hidden sm:table-cell">{user.email}</td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className="px-2 py-1 inline-flex text-xs font-medium rounded bg-secondary text-white">
                          {user.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Regular Users */}
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-border">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-base sm:text-lg font-semibold text-text">
                Users <span className="text-text-secondary font-normal">({regularUsers.length})</span>
              </h2>
            </div>
          </div>
          {regularUsers.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-text-secondary text-sm">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {regularUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-text">{user.name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-text-secondary hidden sm:table-cell">{user.email}</td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className="px-2 py-1 inline-flex text-xs font-medium rounded bg-accent text-white">
                          {user.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLists;
