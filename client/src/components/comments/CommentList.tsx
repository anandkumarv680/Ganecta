import { MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import type { Comment } from '@/types';
import { Card, EmptyState, Button, Spinner } from '@/components/ui';
import CommentItem from '@/components/comments/CommentItem';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCommentDeleted: (commentId: string) => void;
  onError: (message: string) => void;
}

export default function CommentList({
  comments,
  loading,
  error,
  onRetry,
  onCommentDeleted,
  onError,
}: CommentListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Couldn't load comments"
          description={error}
          action={
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          }
        />
      </Card>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
          <MessageSquare className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-neutral-900">No comments yet</p>
        <p className="text-sm text-neutral-500 mt-1">
          Be the first to share your thoughts.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          onDeleted={onCommentDeleted}
          onError={onError}
        />
      ))}
    </div>
  );
}
