import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  RefreshCw,
  Settings,
  UserPlus,
  UserCheck,
  FileText,
  Code2,
} from 'lucide-react';
import type { Post, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, Avatar, Button, Badge, EmptyState, Spinner } from '@/components/ui';
import PostCard from '@/components/posts/PostCard';
import UserListModal from '@/components/users/UserListModal';
import { getUserById, getUserPosts, followUser } from '@/api/userApi';
import { extractErrorMessage } from '@/api/errors';
import { formatFullDate } from '@/utils/date';

function ProfileHeaderSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <div className="h-24 w-24 rounded-full skeleton" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-6 w-40 skeleton rounded" />
          <div className="h-4 w-28 skeleton rounded" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="flex gap-4 mt-3">
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-4 w-20 skeleton rounded" />
          </div>
        </div>
      </div>
    </Card>
  );
}

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

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, token, refreshUser } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isOwnProfile = !!currentUser && currentUser._id === userId;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserById(userId);
      setProfile(data);
      setFollowersCount(data.followers?.length ?? 0);
      setFollowingCount(data.following?.length ?? 0);
      if (currentUser) {
        setIsFollowing(
          data.followers?.some((id) => id.toString() === currentUser._id) ?? false,
        );
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser]);

  const fetchPosts = useCallback(async () => {
    if (!userId) return;
    setPostsLoading(true);
    setPostsError(null);
    try {
      const data = await getUserPosts(userId);
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setPosts(sorted);
    } catch (err) {
      setPostsError(extractErrorMessage(err));
    } finally {
      setPostsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleFollowToggle = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!userId) return;
    const prevFollowing = isFollowing;
    const prevCount = followersCount;
    setIsFollowing(!prevFollowing);
    setFollowersCount(prevFollowing ? prevCount - 1 : prevCount + 1);
    setFollowLoading(true);
    try {
      await followUser(userId);
      setToast(prevFollowing ? 'Unfollowed' : 'Now following');
      await fetchProfile();
      await refreshUser();
    } catch (err) {
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
      setToast(extractErrorMessage(err));
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setToast('Post deleted');
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p)),
    );
    setToast('Post updated');
  };

  const handleLikeError = (message: string) => {
    setToast(message);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <ProfileHeaderSkeleton />
        <div className="mt-6 space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <EmptyState
            icon={<AlertCircle className="h-7 w-7" />}
            title="Profile not found"
            description={error}
            action={
              <Button onClick={fetchProfile} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar
            src={profile.profilePicture || undefined}
            name={profile.name}
            size="xl"
            className="shrink-0"
          />

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-neutral-900 truncate">
                  {profile.name}
                </h1>
                <p className="text-sm text-neutral-500">@{profile.username}</p>
              </div>
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile/edit')}
                >
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={isFollowing ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleFollowToggle}
                  loading={followLoading}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>

            {profile.bio && (
              <p className="mt-3 text-sm text-neutral-700 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <Badge key={skill} color="primary">
                    <Code2 className="h-3 w-3" />
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-5 text-sm">
              <button
                onClick={() => setShowFollowers(true)}
                className="hover:underline"
              >
                <span className="font-semibold text-neutral-900">
                  {followersCount}
                </span>{' '}
                <span className="text-neutral-500">Followers</span>
              </button>
              <button
                onClick={() => setShowFollowing(true)}
                className="hover:underline"
              >
                <span className="font-semibold text-neutral-900">
                  {followingCount}
                </span>{' '}
                <span className="text-neutral-500">Following</span>
              </button>
              <span className="text-neutral-400">
                Joined {formatFullDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3 px-1">
          Posts
        </h2>

        {postsLoading && (
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        )}

        {!postsLoading && postsError && (
          <Card className="p-8">
            <EmptyState
              icon={<AlertCircle className="h-7 w-7" />}
              title="Couldn't load posts"
              description={postsError}
              action={
                <Button onClick={fetchPosts} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              }
            />
          </Card>
        )}

        {!postsLoading && !postsError && posts.length === 0 && (
          <Card className="p-8">
            <EmptyState
              icon={<FileText className="h-7 w-7" />}
              title="No posts yet"
              description={
                isOwnProfile
                  ? "You haven't shared any posts yet. Head to the feed to create your first post."
                  : `${profile.name} hasn't shared any posts yet.`
              }
              action={
                isOwnProfile ? (
                  <Button onClick={() => navigate('/')}>Go to Feed</Button>
                ) : undefined
              }
            />
          </Card>
        )}

        {!postsLoading && !postsError && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
                onLikeError={handleLikeError}
                linkToDetail
              />
            ))}
          </div>
        )}
      </div>

      <UserListModal
        open={showFollowers}
        title="Followers"
        userId={userId!}
        type="followers"
        onClose={() => setShowFollowers(false)}
      />
      <UserListModal
        open={showFollowing}
        title="Following"
        userId={userId!}
        type="following"
        onClose={() => setShowFollowing(false)}
      />

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
