import { Trophy, AlertCircle, RefreshCw, Crown, CheckCircle2 } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { Card, Avatar, Button, EmptyState, Spinner } from '@/components/ui';
import { formatDate } from '@/utils/date';

interface LeaderboardProps {
  challengeTitle: string;
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  currentUserId?: string;
}

function getRankStyle(rank: number): string {
  if (rank === 1) return 'bg-warning-100 text-warning-700';
  if (rank === 2) return 'bg-neutral-200 text-neutral-700';
  if (rank === 3) return 'bg-accent-100 text-accent-700';
  return 'bg-neutral-100 text-neutral-500';
}

export default function Leaderboard({
  challengeTitle,
  entries,
  loading,
  error,
  onRetry,
  currentUserId,
}: LeaderboardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
          <Trophy className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Leaderboard
          </h3>
          <p className="text-xs text-neutral-400">{challengeTitle}</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Couldn't load leaderboard"
          description={error}
          action={
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          }
        />
      )}

      {!loading && !error && entries.length === 0 && (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="No participants yet"
          description="Be the first to join this challenge and appear on the leaderboard."
        />
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="space-y-1">
          {entries.map((entry) => {
            const isCurrentUser =
              currentUserId && entry.user.username === currentUserId;
            return (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isCurrentUser ? 'bg-primary-50' : 'hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shrink-0 ${getRankStyle(entry.rank)}`}
                >
                  {entry.rank <= 3 ? (
                    <Crown className="h-4 w-4" />
                  ) : (
                    entry.rank
                  )}
                </div>
                <Avatar
                  src={entry.user.profilePicture || undefined}
                  name={entry.user.name}
                  size="sm"
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {entry.user.name}
                    {isCurrentUser && (
                      <span className="text-primary-600 ml-1.5">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    @{entry.user.username}
                    {entry.isCompleted && entry.completedAt && (
                      <span className="ml-2 text-success-600">
                        Completed {formatDate(entry.completedAt)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {entry.isCompleted && (
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                  )}
                  <span className="text-sm font-semibold text-neutral-900">
                    {entry.points}
                  </span>
                  <span className="text-xs text-neutral-400">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
