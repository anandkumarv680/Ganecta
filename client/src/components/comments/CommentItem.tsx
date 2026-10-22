import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import type { Comment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Avatar, ConfirmDialog } from '@/components/ui';
import { formatDate } from '@/utils/date';
import { getCommentUserInfo } from '@/utils/author';
import { extractErrorMessage } from '@/api/errors';
import { deleteComment } from '@/api/commentApi';

interface CommentItemProps {
  comment: Comment;
  onDeleted: (commentId: string) => void;
  onError: (message: string) => void;
}

export default function CommentItem({
  comment,
  onDeleted,
  onError,
}: CommentItemProps) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const info = getCommentUserInfo(
    comment.user,
    typeof comment.user === 'string' ? comment.user : undefined,
  );
  const isOwner = !!user && info.id === user._id;

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteComment(comment._id);
      onDeleted(comment._id);
    } catch (err) {
      onError(extractErrorMessage(err));
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleAuthorClick = () => {
    if (info.id) navigate(`/profile/${info.id}`);
  };

  return (
    <>
      <div className="flex items-start gap-3 py-3 animate-slide-up">
        <button
          onClick={handleAuthorClick}
          disabled={!info.id}
          className="shrink-0 disabled:cursor-default"
        >
          <Avatar name={info.name} size="sm" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAuthorClick}
              disabled={!info.id}
              className="text-sm font-medium text-neutral-900 hover:underline disabled:cursor-default disabled:no-underline"
            >
              {info.name}
            </button>
            <span className="text-xs text-neutral-400">
              @{info.username}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>

        {isOwner && token && (
          <button
            onClick={() => setShowConfirm(true)}
            className="p-1.5 rounded-lg text-neutral-300 hover:bg-error-50 hover:text-error-500 transition-colors shrink-0"
            aria-label="Delete comment"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete comment?"
        description="This comment will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
}
