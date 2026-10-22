import type { User } from './user';

export interface Comment {
  _id: string;
  content: string;
  user: string | Pick<User, 'name' | 'username'>;
  post: string;
  createdAt: string;
  updatedAt: string;
}

export type CommentUserInfo = {
  id: string;
  name: string;
  username: string;
};

export interface CreateCommentBody {
  content: string;
}

export interface CommentsResponse {
  message: string;
  comments: Comment[];
}
