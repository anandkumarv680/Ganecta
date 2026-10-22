export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: number;
  author: string | { name: string; username: string };
  createdAt: string;
}

export interface CreateChallengeBody {
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: number;
}

export interface DailyProgressEntry {
  date: string;
  completed: boolean;
}

export interface UserChallenge {
  _id: string;
  user: string;
  challenge: string;
  joinedAt: string;
  dailyProgress: DailyProgressEntry[];
  isCompleted: boolean;
  completedAt: string | null;
  points: number;
}

export interface ProgressResponse {
  message: string;
  completedDays: number;
  requiredDays: number;
  isCompleted: boolean;
  userChallenge: UserChallenge;
}

export interface LeaderboardEntry {
  rank: number;
  user: { name: string; username: string; profilePicture: string };
  points: number;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface LeaderboardResponse {
  challenge: string;
  leaderboard: LeaderboardEntry[];
}
