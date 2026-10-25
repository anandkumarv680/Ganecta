import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Clock,
  Dumbbell,
  Pencil,
  Trash2,
  UserPlus,
  CheckCircle2,
  X,
} from 'lucide-react';
import type {
  Challenge,
  LeaderboardEntry,
  UserChallenge,
  Difficulty,
} from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  Badge,
  Button,
  Avatar,
  EmptyState,
  ConfirmDialog,
} from '@/components/ui';
import ChallengeForm from '@/components/challenges/ChallengeForm';
import Leaderboard from '@/components/challenges/Leaderboard';
import ProgressTracker from '@/components/challenges/ProgressTracker';
import {
  getChallengeById,
  joinChallenge,
  deleteChallenge as deleteChallengeApi,
} from '@/api/challengeApi';
import { getLeaderboard } from '@/api/challengeApi';
import { extractErrorMessage } from '@/api/errors';
import { formatFullDate } from '@/utils/date';

const difficultyColor: Record<Difficulty, 'success' | 'warning' | 'error'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'error',
};

export default function ChallengeDetailPage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [joined, setJoined] = useState(false);
  const [userChallenge, setUserChallenge] = useState<UserChallenge | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>(
    [],
  );
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const fetchChallenge = useCallback(async () => {
    if (!challengeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getChallengeById(challengeId);
      setChallenge(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  const fetchLeaderboard = useCallback(async () => {
    if (!challengeId) return;
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      const data = await getLeaderboard(challengeId);
      setLeaderboardEntries(data.leaderboard);
    } catch (err) {
      setLeaderboardError(extractErrorMessage(err));
    } finally {
      setLeaderboardLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    fetchChallenge();
    fetchLeaderboard();
  }, [fetchChallenge, fetchLeaderboard]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const authorId =
    typeof challenge?.author === 'string'
      ? challenge.author
      : (challenge?.author as { _id?: string })?._id ?? '';
  const authorName =
    typeof challenge?.author === 'string'
      ? 'Unknown Developer'
      : challenge?.author?.name ?? 'Unknown Developer';
  const authorUsername =
    typeof challenge?.author === 'string'
      ? 'unknown'
      : challenge?.author?.username ?? 'unknown';
  const isOwner = !!user && !!authorId && user._id === authorId;

  const handleJoin = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!challengeId) return;
    setJoinLoading(true);
    try {
      const result = await joinChallenge(challengeId);
      setJoined(true);
      setUserChallenge(result.userChallenge);
      setToast('Challenge joined! Start tracking your daily progress.');
      fetchLeaderboard();
    } catch (err) {
      setToast(extractErrorMessage(err));
    } finally {
      setJoinLoading(false);
    }
  };

  const handleEditSuccess = (updated: Challenge) => {
    setChallenge(updated);
    setShowEditForm(false);
    setToast('Challenge updated');
  };

  const handleDelete = async () => {
    if (!challengeId) return;
    setDeleting(true);
    try {
      await deleteChallengeApi(challengeId);
      navigate('/challenges');
    } catch (err) {
      setToast(extractErrorMessage(err));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleProgressUpdate = (data: {
    completedDays: number;
    requiredDays: number;
    isCompleted: boolean;
    points: number;
    userChallenge: UserChallenge;
  }) => {
    setUserChallenge(data.userChallenge);
    setToast(
      data.isCompleted
        ? 'Challenge completed! Congratulations!'
        : `Day ${data.completedDays} of ${data.requiredDays} marked complete`,
    );
    fetchLeaderboard();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg skeleton" />
            <div className="h-5 w-16 skeleton rounded-full" />
          </div>
          <div className="h-6 w-56 skeleton rounded mb-3" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded mt-2" />
          <div className="flex gap-3 mt-4">
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-4 w-24 skeleton rounded" />
          </div>
        </Card>
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <Card className="p-8">
          <EmptyState
            icon={<AlertCircle className="h-7 w-7" />}
            title="Challenge not found"
            description={error}
            action={
              <Button onClick={fetchChallenge} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {showEditForm && isOwner ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700">
              Edit Challenge
            </h2>
            <button
              onClick={() => setShowEditForm(false)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
          <ChallengeForm
            challenge={challenge}
            onSubmitSuccess={handleEditSuccess}
            onCancel={() => setShowEditForm(false)}
          />
        </div>
      ) : (
        <Card className="p-6 animate-slide-up">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Dumbbell className="h-5 w-5" />
              </div>
              <Badge color={difficultyColor[challenge.difficulty]}>
                {challenge.difficulty}
              </Badge>
            </div>
            {isOwner && token && (
              <div className="flex gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-error-600 hover:bg-error-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-neutral-900">
            {challenge.title}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
            {challenge.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {challenge.duration} days
            </span>
            <span className="flex items-center gap-1.5">
              <Avatar name={authorName} size="xs" className="!h-5 !w-5 !text-[10px]" />
              @{authorUsername}
            </span>
            <span>{formatFullDate(challenge.createdAt)}</span>
          </div>

          <div className="mt-5 pt-5 border-t border-neutral-100">
            {joined || userChallenge ? (
              <div className="flex items-center gap-2 text-sm font-medium text-success-600">
                <CheckCircle2 className="h-5 w-5" />
                You've joined this challenge
              </div>
            ) : isOwner ? (
              <p className="text-sm text-neutral-400">
                This is your challenge. Share it with others to join!
              </p>
            ) : token ? (
              <Button onClick={handleJoin} loading={joinLoading}>
                <UserPlus className="h-4 w-4" />
                Join Challenge
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')}>
                Sign in to Join
              </Button>
            )}
          </div>
        </Card>
      )}

      {(joined || userChallenge) && !showEditForm && (
        <div className="mt-6">
          <ProgressTracker
            challengeId={challenge._id}
            completedDays={
              userChallenge?.dailyProgress?.filter((p) => p.completed).length ??
              0
            }
            requiredDays={challenge.duration}
            isCompleted={userChallenge?.isCompleted ?? false}
            points={userChallenge?.points ?? 0}
            onProgressUpdate={handleProgressUpdate}
            onError={(msg) => setToast(msg)}
          />
        </div>
      )}

      {!showEditForm && (
        <div className="mt-6">
          <Leaderboard
            challengeTitle={challenge.title}
            entries={leaderboardEntries}
            loading={leaderboardLoading}
            error={leaderboardError}
            onRetry={fetchLeaderboard}
            currentUserId={user?._id}
          />
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete challenge?"
        description="This challenge and all participant progress will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleting}
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
