import { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, Users } from 'lucide-react';
import type { SearchUserResult } from '@/types';
import { EmptyState, Spinner } from '@/components/ui';
import UserListItem from '@/components/users/UserListItem';
import { getFollowers, getFollowing } from '@/api/userApi';
import { extractErrorMessage } from '@/api/errors';

interface UserListModalProps {
  open: boolean;
  title: string;
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

export default function UserListModal({
  open,
  title,
  userId,
  type,
  onClose,
}: UserListModalProps) {
  const [users, setUsers] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchFn = type === 'followers' ? getFollowers : getFollowing;
      const data = await fetchFn(userId);
      setUsers(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-card-hover max-w-sm w-full max-h-[70vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {!loading && error && (
            <div className="p-4">
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error-50 border border-error-200">
                <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-error-700">{error}</p>
                  <button
                    onClick={fetchList}
                    className="text-sm font-medium text-error-600 hover:text-error-700 mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No users yet"
              description={`No ${type} to show.`}
            />
          )}

          {!loading && !error && users.length > 0 && (
            <div className="space-y-1">
              {users.map((u) => (
                <UserListItem key={u._id} user={u} onClose={onClose} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
