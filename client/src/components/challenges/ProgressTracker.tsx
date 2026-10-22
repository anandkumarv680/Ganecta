import { useState } from 'react';
import { CheckCircle2, Clock, Star } from 'lucide-react';
import type { UserChallenge } from '@/types';
import { Card, Button } from '@/components/ui';
import { extractErrorMessage } from '@/api/errors';
import { updateDailyProgress } from '@/api/challengeApi';

interface ProgressTrackerProps {
  challengeId: string;
  completedDays: number;
  requiredDays: number;
  isCompleted: boolean;
  points: number;
  onProgressUpdate: (data: {
    completedDays: number;
    requiredDays: number;
    isCompleted: boolean;
    points: number;
    userChallenge: UserChallenge;
  }) => void;
  onError: (message: string) => void;
}

export default function ProgressTracker({
  challengeId,
  completedDays,
  requiredDays,
  isCompleted,
  points,
  onProgressUpdate,
  onError,
}: ProgressTrackerProps) {
  const [marking, setMarking] = useState(false);
  const progressPercent = Math.min(
    100,
    Math.round((completedDays / requiredDays) * 100),
  );

  const handleMarkToday = async () => {
    setMarking(true);
    try {
      const result = await updateDailyProgress(challengeId);
      onProgressUpdate({
        completedDays: result.completedDays,
        requiredDays: result.requiredDays,
        isCompleted: result.isCompleted,
        points: result.userChallenge.points,
        userChallenge: result.userChallenge,
      });
    } catch (err) {
      onError(extractErrorMessage(err));
    } finally {
      setMarking(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Star className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-900">
          Your Progress
        </h3>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl font-bold text-neutral-900">
          {completedDays}
        </span>
        <span className="text-sm text-neutral-400">/ {requiredDays} days</span>
        {isCompleted && (
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-success-600">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </span>
        )}
      </div>

      <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-warning-500" />
          <span className="text-sm font-medium text-neutral-900">{points}</span>
          <span className="text-xs text-neutral-400">points</span>
        </div>

        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-success-600 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Challenge complete!
          </span>
        ) : (
          <Button
            size="sm"
            onClick={handleMarkToday}
            loading={marking}
          >
            <Clock className="h-4 w-4" />
            Mark Today Done
          </Button>
        )}
      </div>
    </Card>
  );
}
