import { useNavigate } from 'react-router-dom';
import { Clock, Dumbbell, ChevronRight } from 'lucide-react';
import type { Challenge, Difficulty } from '@/types';
import { Card, Badge, Avatar } from '@/components/ui';
import { formatDate } from '@/utils/date';

interface ChallengeCardProps {
  challenge: Challenge;
}

const difficultyColor: Record<Difficulty, 'success' | 'warning' | 'error'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'error',
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const navigate = useNavigate();

  const authorName =
    typeof challenge.author === 'string'
      ? 'Unknown Developer'
      : challenge.author.name;
  const authorUsername =
    typeof challenge.author === 'string'
      ? 'unknown'
      : challenge.author.username;

  return (
    <Card
      hover
      onClick={() => navigate(`/challenges/${challenge._id}`)}
      className="p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 shrink-0">
              <Dumbbell className="h-4 w-4" />
            </div>
            <Badge color={difficultyColor[challenge.difficulty]}>
              {challenge.difficulty}
            </Badge>
          </div>
          <h3 className="text-base font-semibold text-neutral-900 truncate">
            {challenge.title}
          </h3>
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2 leading-relaxed">
            {challenge.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {challenge.duration} days
            </span>
            <span className="flex items-center gap-1.5">
              <Avatar name={authorName} size="xs" className="!h-5 !w-5 !text-[10px]" />
              @{authorUsername}
            </span>
            <span>{formatDate(challenge.createdAt)}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-neutral-300 shrink-0" />
      </div>
    </Card>
  );
}
