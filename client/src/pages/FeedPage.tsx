import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import type { Post } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  Button,
  EmptyState,
} from '@/components/ui';
import PostCard from '@/components/posts/PostCard';
import CreatePostForm from '@/components/posts/CreatePostForm';
import { getAllPosts } from '@/api/postApi';
import { extractErrorMessage } from '@/api/errors';

function PostCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 skeleton rounded" />
            <div className="h-3 w-16 skeleton rounded" />
            <div className="h-3 w-12 skeleton rounded" />
          </div>
          <div className="h-4 w-full skeleton rounded mt-3" />
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-9 w-20 skeleton rounded mt-4" />
        </div>
      </div>
    </Card>
  );
}

export default function FeedPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPosts();
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setPosts(sorted);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handlePostCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setToast('Post published successfully');
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p)),
    );
    setToast('Post updated');
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setToast('Post deleted');
  };

  const handleLikeError = (message: string) => {
    setToast(message);
  };

  const handleCommentError = (message: string) => {
    setToast(message);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Community Feed</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            See what developers are sharing
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPosts}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {token && <CreatePostForm onPostCreated={handlePostCreated} />}

      {!token && (
        <Card className="p-5 mb-6 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shrink-0">
            <MessageSquarePlus className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900">
              Want to join the conversation?
            </p>
            <p className="text-sm text-neutral-500">
              Sign in to create posts, like, and interact with the community.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </Card>
      )}

      {loading && (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}

      {!loading && error && (
        <Card className="p-8">
          <EmptyState
            icon={<AlertCircle className="h-7 w-7" />}
            title="Couldn't load the feed"
            description={error}
            action={
              <Button onClick={fetchPosts} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            }
          />
        </Card>
      )}

      {!loading && !error && posts.length === 0 && (
        <Card className="p-8">
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title="No posts yet"
            description="Be the first to share something with the community. Posts from all developers will appear here."
            action={
              token ? undefined : (
                <Button onClick={() => navigate('/register')}>
                  Create an account
                </Button>
              )
            }
          />
        </Card>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
              onLikeError={handleLikeError}
              onCommentError={handleCommentError}
              linkToDetail
            />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-900 text-white text-sm shadow-card-hover">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
