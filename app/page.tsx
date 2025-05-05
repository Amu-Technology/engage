'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { UserForm } from '@/components/UserForm';
import { OrganizationForm } from '@/components/OrganizationForm';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  org_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  googleId: string | null;
  organization: {
    name: string;
  } | null;
}

interface Organization {
  id: number;
  name: string;
  users: User[];
  created_at: Date;
  updated_at: Date;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isOrgFormOpen, setIsOrgFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [selectedOrg, setSelectedOrg] = useState<Organization | undefined>();

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/all');
      if (!response.ok) {
        throw new Error('ユーザー一覧の取得に失敗しました');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (!response.ok) {
        throw new Error('組織一覧の取得に失敗しました');
      }
      const data = await response.json();
      setOrganizations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
  }, []);

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  const handleUserRegister = () => {
    setSelectedUser(undefined);
    setIsUserFormOpen(true);
  };

  const handleOrgEdit = (org: Organization) => {
    setSelectedOrg(org);
    setIsOrgFormOpen(true);
  };

  const handleOrgRegister = () => {
    setSelectedOrg(undefined);
    setIsOrgFormOpen(true);
  };

  return (
    <main className="container mx-auto p-4">
      <div className="mb-8">
        {session ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg">ようこそ、{session.user?.name}さん！</p>
              <p className="text-sm text-gray-600">{session.user?.email}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleUserRegister}
                className="bg-green-500 hover:bg-green-600"
              >
                新規ユーザー登録
              </Button>
              <Button
                onClick={handleOrgRegister}
                className="bg-blue-500 hover:bg-blue-600"
              >
                新規組織登録
              </Button>
              <Button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600"
              >
                サインアウト
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => signIn('google')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Googleでサインイン
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ユーザー一覧 */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-bold p-4 bg-gray-100">ユーザー一覧</h2>
        {isLoading ? (
          <div className="p-4 text-center">読み込み中...</div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    役割
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所属
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.name || '未設定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role || '未設定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {user.organization?.name || '未設定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                          onClick={() => handleUserEdit(user)}
                      >
                        編集
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        {/* 組織一覧 */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-xl font-bold p-4 bg-gray-100">組織一覧</h2>
          {isLoading ? (
            <div className="p-4 text-center">読み込み中...</div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      組織名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メンバー数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <tr key={org.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{org.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {org.users.length}人
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrgEdit(org)}
                        >
                          編集
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <UserForm
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onSuccess={() => {
          fetchUsers();
          fetchOrganizations();
        }}
        user={selectedUser}
      />

      <OrganizationForm
        isOpen={isOrgFormOpen}
        onClose={() => setIsOrgFormOpen(false)}
        onSuccess={() => {
          fetchUsers();
          fetchOrganizations();
        }}
        organization={selectedOrg}
      />
    </main>
  );
}
