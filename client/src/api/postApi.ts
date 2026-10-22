import api from './axios';
import type { Post, CreatePostBody, LikeResponse } from '@/types';

export async function getAllPosts() {
  const { data } = await api.get<Post[]>('/api/posts');
  return data;
}

export async function getPostById(postId: string) {
  const { data } = await api.get<Post>(`/api/posts/${postId}`);
  return data;
}

export async function createPost(body: CreatePostBody) {
  const { data } = await api.post<Post>('/api/posts', body);
  return data;
}

export async function updatePost(postId: string, body: CreatePostBody) {
  const { data } = await api.put<Post>(`/api/posts/${postId}`, body);
  return data;
}

export async function deletePost(postId: string) {
  const { data } = await api.delete<{ Message: string }>(
    `/api/posts/${postId}`,
  );
  return data;
}

export async function toggleLike(postId: string) {
  const { data } = await api.post<LikeResponse>(
    `/api/posts/${postId}/like`,
  );
  return data;
}
