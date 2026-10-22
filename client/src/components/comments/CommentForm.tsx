import { useState, type FormEvent } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import type { Comment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, Avatar, Textarea, Button } from '@/components/ui';
import { createComment } from '@/api/commentApi';
import { extractErrorMessage } from '@/api/errors';

interface CommentFormProps {
  postId: string;
  onCommentCreated: (comment: Comment) => void;
}

const MAX_COMMENT_LENGTH = 500;

export default function CommentForm({
  postId,
  onCommentCreated,
}: CommentFormProps) {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token || !user) return null;

  const canSubmit = content.trim().length > 0 && !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Comment cannot be empty');
      return;
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setError(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await createComment(postId, { content: trimmed });
      onCommentCreated(result.comment);
      setContent('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar
          src={user.profilePicture || undefined}
          name={user.name}
          size="sm"
          className="shrink-0"
        />
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Write a comment..."
            className="min-h-[60px] border-0 focus:ring-0 focus:border-transparent bg-transparent px-0 resize-none"
            maxLength={MAX_COMMENT_LENGTH}
          />
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-error-50 border border-error-200">
              <AlertCircle className="h-4 w-4 text-error-500 shrink-0 mt-0.5" />
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {content.length}/{MAX_COMMENT_LENGTH}
            </span>
            <Button
              type="submit"
              size="sm"
              loading={loading}
              disabled={!canSubmit}
            >
              <Send className="h-4 w-4" />
              Comment
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
