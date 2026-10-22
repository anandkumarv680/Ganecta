import api from './axios';
import type {
  Challenge,
  CreateChallengeBody,
  UserChallenge,
  ProgressResponse,
  LeaderboardResponse,
} from '@/types';

export async function getAllChallenges() {
  const { data } = await api.get<Challenge[]>('/api/challenges');
  return data;
}

export async function getChallengeById(challengeId: string) {
  const { data } = await api.get<Challenge>(`/api/challenges/${challengeId}`);
  return data;
}

export async function createChallenge(body: CreateChallengeBody) {
  const { data } = await api.post<{ message: string; challenge: Challenge }>(
    '/api/challenges',
    body,
  );
  return data;
}

export async function updateChallenge(
  challengeId: string,
  body: Partial<CreateChallengeBody>,
) {
  const { data } = await api.put<{ message: string; challenge: Challenge }>(
    `/api/challenges/${challengeId}`,
    body,
  );
  return data;
}

export async function deleteChallenge(challengeId: string) {
  const { data } = await api.delete<{ message: string }>(
    `/api/challenges/${challengeId}`,
  );
  return data;
}

export async function joinChallenge(challengeId: string) {
  const { data } = await api.post<{ message: string; userChallenge: UserChallenge }>(
    `/api/challenges/${challengeId}/join`,
  );
  return data;
}

export async function updateDailyProgress(challengeId: string) {
  const { data } = await api.patch<ProgressResponse>(
    `/api/challenges/${challengeId}/progress`,
  );
  return data;
}

export async function getLeaderboard(challengeId: string) {
  const { data } = await api.get<LeaderboardResponse>(
    `/api/challenges/${challengeId}/leaderboard`,
  );
  return data;
}
