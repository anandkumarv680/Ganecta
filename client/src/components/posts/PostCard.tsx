import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, MoreHorizontal, Pencil, Trash2, AlertCircle } from 'lucide-react';
import type { Post } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, Avatar, Button, Textarea, ConfirmDialog } from '@/components/ui';
import { formatDate } from '@/utils/date';
import { getAuthorInfo } from '@/utils/author';
import { extractErrorMessage } from '@/api/errors';
import { updatePost, deletePost, toggleLike } from '@/api/postApi';
import CommentSection from '@/components/comments/CommentSection';

interface PostCardProps {
  post: Post;
  onPostDeleted: (postId: string) => void;
  onPostUpdated: (post: Post) => void;
  onLikeError: (message: string) => void;
  onCommentError?: (message: string) => void;
  linkToDetail?: boolean;
}

export default function PostCard({
  post,
  onPostDeleted,
  onPostUpdated,
  onLikeError,
  onCommentError,
  linkToDetail = false,
}: PostCardProps) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const author = getAuthorInfo(post.author);
  const isOwner = !!user && author.id === user._id;
  const likedByCurrentUser = !!user && post.likes.includes(user._id);
  const likesCount = post.likes.length;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [localLiked, setLocalLiked] = useState(likedByCurrentUser);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);
  const [showComments, setShowComments] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalLiked(likedByCurrentUser);
    setLocalLikesCount(likesCount);
  }, [likedByCurrentUser, likesCount]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    const prevLiked = localLiked;
    const prevCount = localLikesCount;
    setLocalLiked(!prevLiked);
    setLocalLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLikeLoading(true);
    try {
      const result = await toggleLike(post._id);
      setLocalLiked(result.liked);
      setLocalLikesCount(result.likesCount);
    } catch (err) {
      setLocalLiked(prevLiked);
      setLocalLikesCount(prevCount);
      onLikeError(extractErrorMessage(err));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = editContent.trim();
    if (!trimmed) {
      setEditError('Post content cannot be empty');
      return;
    }
    setSavingEdit(true);
    setEditError(null);
    try {
      const updated = await updatePost(post._id, { content: trimmed });
      onPostUpdated(updated);
      setIsEditing(false);
      setMenuOpen(false);
    } catch (err) {
      setEditError(extractErrorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
    setEditError(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(post._id);
      onPostDeleted(post._id);
    } catch (err) {
      setEditError(extractErrorMessage(err));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAuthorClick = () => {
    if (author.id) navigate(`/profile/${author.id}`);
  };

  return (
    <>
      <Card className="p-5 animate-slide-up">
        <div className="flex items-start gap-3">
          <button
            onClick={handleAuthorClick}
            disabled={!author.id}
            className="shrink-0 disabled:cursor-default"
          >
            <Avatar
              src={author.profilePicture || undefined}
              name={author.name}
              size="md"
            />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAuthorClick}
                disabled={!author.id}
                className="font-semibold text-sm text-neutral-900 hover:underline disabled:cursor-default disabled:no-underline"
              >
                {author.name}
              </button>
              <span className="text-sm text-neutral-400">
                @{author.username}
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-sm text-neutral-400">
                {formatDate(post.createdAt)}
              </span>
            </div>

            {!isEditing && (
              <p
                onClick={linkToDetail ? () => navigate(`/posts/${post._id}`) : undefined}
                className={`mt-2 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap break-words ${
                  linkToDetail ? 'cursor-pointer hover:text-neutral-900 transition-colors' : ''
                }`}
              >
                {post.content}
              </p>
            )}
          </div>

          {isOwner && !isEditing && (
            <div ref={menuRef} className="relative shrink-0">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                aria-label="Post options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl border border-neutral-200 shadow-card-hover py-1 z-20 animate-slide-up">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-neutral-500" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                if (editError) setEditError(null);
              }}
              autoFocus
              className="min-h-[100px]"
              placeholder="Edit your post..."
            />
            {editError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-error-50 border border-error-200">
                <AlertCircle className="h-4 w-4 text-error-500 shrink-0 mt-0.5" />
                <p className="text-sm text-error-700">{editError}</p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={savingEdit}>
                Save
              </Button>
            </div>
          </form>
        )}

        {!isEditing && (
          <div className="mt-4 flex items-center gap-1">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                localLiked
                  ? 'text-error-600 hover:bg-error-50'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              <Heart
                className={`h-4.5 w-4.5 ${localLiked ? 'fill-current' : ''}`}
              />
              {localLikesCount > 0 ? localLikesCount : 'Like'}
            </button>
            <button
              onClick={() => setShowComments((prev) => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showComments
                  ? 'text-accent-600 hover:bg-accent-50'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5" />
              Comment
            </button>
          </div>
        )}

        {showComments && !isEditing && (
          <CommentSection postId={post._id} onCommentError={onCommentError} />
        )}
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete post?"
        description="This action cannot be undone. Your post will be permanently removed from the feed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleting}
      />
    </>
  );
}
