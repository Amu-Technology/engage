'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { UserForm } from '@/components/UserForm';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  store_id: number | null;
  created_at: Date | null;
  stores: {
    name: string;
  } | null;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleRegister = () => {
    setSelectedUser(undefined);
    setIsFormOpen(true);
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
                onClick={handleRegister}
                className="bg-green-500 hover:bg-green-600"
              >
                新規登録
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
                    店舗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
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
                      {user.stores?.name || '未設定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('ja-JP')
                        : '未設定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
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

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchUsers}
        user={selectedUser}
      />
    </main>
  );
}
