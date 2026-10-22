export type NotificationType = 'follow' | 'like' | 'comment' | 'challenge';

export interface Notification {
  _id: string;
  sender: string | { name: string; username: string; profilePicture: string };
  receiver: string;
  type: NotificationType;
  referenceId: string | null;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  count: number;
  notifications: Notification[];
}
