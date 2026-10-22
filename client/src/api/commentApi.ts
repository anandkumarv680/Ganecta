import type { AxiosError } from 'axios';
import api from './axios';
import type { Comment, CreateCommentBody, CommentsResponse } from '@/types';

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const { data } = await api.get<CommentsResponse>(
      `/api/posts/comments/${postId}`,
    );
    return data.comments;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    if (axiosError?.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function createComment(postId: string, body: CreateCommentBody) {
  const { data } = await api.post<{ message: string; comment: Comment }>(
    `/api/posts/comments/${postId}`,
    body,
  );
  return data;
}

export async function deleteComment(commentId: string) {
  const { data } = await api.delete<{ message: string }>(
    `/api/posts/comments/${commentId}`,
  );
  return data;
}
