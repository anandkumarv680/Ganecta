import { useState, type FormEvent } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import type { Post } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, Avatar, Textarea, Button } from '@/components/ui';
import { createPost } from '@/api/postApi';
import { extractErrorMessage } from '@/api/errors';

interface CreatePostFormProps {
  onPostCreated: (post: Post) => void;
}

const MAX_CONTENT_LENGTH = 1000;

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const canSubmit = content.trim().length > 0 && !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Post content cannot be empty');
      return;
    }
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      setError(`Post must be ${MAX_CONTENT_LENGTH} characters or fewer`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const post = await createPost({ content: trimmed });
      onPostCreated(post);
      setContent('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-start gap-3">
        <Avatar
          src={user.profilePicture || undefined}
          name={user.name}
          size="md"
          className="shrink-0"
        />
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Share something with the community..."
            className="min-h-[80px] border-0 focus:ring-0 focus:border-transparent bg-transparent px-0 resize-none"
            maxLength={MAX_CONTENT_LENGTH}
          />
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-error-50 border border-error-200">
              <AlertCircle className="h-4 w-4 text-error-500 shrink-0 mt-0.5" />
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
            <Button
              type="submit"
              size="sm"
              loading={loading}
              disabled={!canSubmit}
            >
              <Send className="h-4 w-4" />
              Post
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
