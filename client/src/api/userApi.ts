import api from './axios';
import type {
  User,
  UpdateProfileBody,
  UpdateProfileResponse,
  SearchUserResult,
  Post,
} from '@/types';

export async function searchUsers(q: string) {
  const { data } = await api.get<SearchUserResult[]>(
    `/api/users/search?q=${encodeURIComponent(q)}`,
  );
  return data;
}

export async function getUserById(userId: string) {
  const { data } = await api.get<User>(`/api/users/${userId}`);
  return data;
}

export async function updateProfile(body: UpdateProfileBody) {
  const { data } = await api.put<UpdateProfileResponse>(
    '/api/users/profile',
    body,
  );
  return data;
}

export async function getUserPosts(userId: string) {
  const { data } = await api.get<{ message: string; posts: Post[] } | Post[]>(
    `/api/users/${userId}/posts`,
  );
  if (Array.isArray(data)) return data;
  return data.posts;
}

export async function followUser(followId: string) {
  const { data } = await api.put<{ message: string }>(
    `/api/users/follow/${followId}`,
  );
  return data;
}

export async function getFollowers(userId: string) {
  const { data } = await api.get<SearchUserResult[]>(
    `/api/users/${userId}/followers`,
  );
  return data;
}

export async function getFollowing(userId: string) {
  const { data } = await api.get<SearchUserResult[]>(
    `/api/users/${userId}/following`,
  );
  return data;
}
