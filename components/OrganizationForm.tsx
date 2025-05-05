'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  org_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}

interface Organization {
  id: number;
  name: string;
  users: User[];
  created_at: Date;
  updated_at: Date;
}

interface OrganizationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organization?: Organization;
}

export function OrganizationForm({
  isOpen,
  onClose,
  onSuccess,
  organization,
}: OrganizationFormProps) {
  const [name, setName] = useState(organization?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = '/api/organizations';
      const method = organization ? 'PUT' : 'POST';
      const body = organization
        ? JSON.stringify({ id: organization.id, name })
        : JSON.stringify({ name });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        throw new Error('組織の保存に失敗しました');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {organization ? '組織の編集' : '新規組織の登録'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">組織名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 