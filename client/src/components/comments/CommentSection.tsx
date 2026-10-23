import { useState, useCallback, useEffect } from 'react';
import type { Comment } from '@/types';
import { Card } from '@/components/ui';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { getComments } from '@/api/commentApi';
import { extractErrorMessage } from '@/api/errors';

interface CommentSectionProps {
  postId: string;
  onCommentError?: (message: string) => void;
}

export default function CommentSection({
  postId,
  onCommentError,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentCreated = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const handleError = (message: string) => {
    if (onCommentError) {
      onCommentError(message);
    } else {
      setError(message);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <CommentForm postId={postId} onCommentCreated={handleCommentCreated} />
      <Card className="p-4">
        <CommentList
          comments={comments}
          loading={loading}
          error={error}
          onRetry={fetchComments}
          onCommentDeleted={handleCommentDeleted}
          onError={handleError}
        />
      </Card>
    </div>
  );
}
