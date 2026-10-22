import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import type { Post, Comment } from '@/types';
import { Card, Button, EmptyState } from '@/components/ui';
import PostCard from '@/components/posts/PostCard';
import CommentForm from '@/components/comments/CommentForm';
import CommentList from '@/components/comments/CommentList';
import { getPostById } from '@/api/postApi';
import { getComments } from '@/api/commentApi';
import { extractErrorMessage } from '@/api/errors';

function PostCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 skeleton rounded" />
          <div className="h-4 w-full skeleton rounded mt-3" />
          <div className="h-4 w-3/4 skeleton rounded" />
        </div>
      </div>
    </Card>
  );
}

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) return;
    setPostLoading(true);
    setPostError(null);
    try {
      const data = await getPostById(postId);
      setPost(data);
    } catch (err) {
      setPostError(extractErrorMessage(err));
    } finally {
      setPostLoading(false);
    }
  }, [postId]);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (err) {
      setCommentsError(extractErrorMessage(err));
    } finally {
      setCommentsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handlePostUpdated = (updated: Post) => {
    setPost(updated);
    setToast('Post updated');
  };

  const handlePostDeleted = () => {
    navigate('/');
  };

  const handleLikeError = (message: string) => {
    setToast(message);
  };

  const handleCommentCreated = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
    setToast('Comment added');
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setToast('Comment deleted');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {postLoading && <PostCardSkeleton />}

      {!postLoading && postError && (
        <Card className="p-8">
          <EmptyState
            icon={<AlertCircle className="h-7 w-7" />}
            title="Couldn't load post"
            description={postError}
            action={
              <Button onClick={fetchPost} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            }
          />
        </Card>
      )}

      {!postLoading && !postError && post && (
        <>
          <PostCard
            post={post}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
            onLikeError={handleLikeError}
          />

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-neutral-700" />
              <h2 className="text-sm font-semibold text-neutral-900">
                Comments
                {comments.length > 0 && (
                  <span className="text-neutral-400 ml-1.5">
                    ({comments.length})
                  </span>
                )}
              </h2>
            </div>

            <CommentForm
              postId={post._id}
              onCommentCreated={handleCommentCreated}
            />

            <Card className="mt-4 p-4">
              <CommentList
                comments={comments}
                loading={commentsLoading}
                error={commentsError}
                onRetry={fetchComments}
                onCommentDeleted={handleCommentDeleted}
                onError={(msg) => setToast(msg)}
              />
            </Card>
          </div>
        </>
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
