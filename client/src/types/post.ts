import type { User } from './user';

export interface Post {
  _id: string;
  content: string;
  author: string | Pick<User, 'name' | 'username' | 'profilePicture'>;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostBody {
  content: string;
}

export interface LikeResponse {
  Message: 'liked' | 'unliked';
  liked: boolean;
  likesCount: number;
}
