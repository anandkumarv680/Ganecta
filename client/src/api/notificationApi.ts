import api from './axios';
import type { NotificationsResponse, Notification } from '@/types';

export async function getNotifications() {
  const { data } = await api.get<NotificationsResponse>('/api/notifications');
  return data;
}

export async function markAsRead(notificationId: string) {
  const { data } = await api.patch<{ message: string; notification: Notification }>(
    `/api/notifications/${notificationId}/read`,
  );
  return data;
}

export async function deleteNotification(notificationId: string) {
  const { data } = await api.delete<{ message: string }>(
    `/api/notifications/${notificationId}`,
  );
  return data;
}
