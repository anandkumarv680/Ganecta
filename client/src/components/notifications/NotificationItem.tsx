import { useNavigate } from 'react-router-dom';
import {
  Heart,
  UserPlus,
  MessageSquare,
  Dumbbell,
  Trash2,
  Check,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/types';
import { Avatar } from '@/components/ui';
import { formatDate } from '@/utils/date';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  markingRead: boolean;
  deleting: boolean;
}

const typeIcon: Record<NotificationType, typeof Heart> = {
  follow: UserPlus,
  like: Heart,
  comment: MessageSquare,
  challenge: Dumbbell,
};

const typeColor: Record<NotificationType, string> = {
  follow: 'bg-primary-50 text-primary-600',
  like: 'bg-error-50 text-error-500',
  comment: 'bg-accent-50 text-accent-600',
  challenge: 'bg-warning-50 text-warning-600',
};

function getSenderInfo(notification: Notification) {
  if (typeof notification.sender === 'string') {
    return { id: notification.sender, name: 'Someone', username: '', profilePicture: '' };
  }
  return {
    id: (notification.sender as { _id?: string })._id ?? '',
    name: notification.sender.name || 'Someone',
    username: notification.sender.username || '',
    profilePicture: notification.sender.profilePicture ?? '',
  };
}

function getNotificationLink(notification: Notification): string | null {
  if (!notification.referenceId) return null;
  switch (notification.type) {
    case 'follow':
      return `/profile/${notification.referenceId}`;
    case 'like':
    case 'comment':
      return `/posts/${notification.referenceId}`;
    case 'challenge':
      return `/challenges/${notification.referenceId}`;
    default:
      return null;
  }
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  markingRead,
  deleting,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const sender = getSenderInfo(notification);
  const Icon = typeIcon[notification.type] ?? MessageSquare;
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (link) {
      if (!notification.read) onMarkRead(notification._id);
      navigate(link);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
        !notification.read ? 'bg-primary-50/40' : 'bg-white'
      } hover:bg-neutral-50`}
    >
      <div className="relative shrink-0">
        <Avatar
          src={sender.profilePicture || undefined}
          name={sender.name}
          size="md"
        />
        <div
          className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white ${typeColor[notification.type]}`}
        >
          <Icon className="h-3 w-3" />
        </div>
      </div>

      <button
        onClick={handleClick}
        disabled={!link}
        className="min-w-0 flex-1 text-left disabled:cursor-default"
      >
        <p
          className={`text-sm leading-relaxed ${
            !notification.read
              ? 'text-neutral-900 font-medium'
              : 'text-neutral-600'
          }`}
        >
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-neutral-400">
            {formatDate(notification.createdAt)}
          </span>
          {!notification.read && (
            <span className="inline-block h-2 w-2 rounded-full bg-primary-500" />
          )}
        </div>
      </button>

      <div className="flex items-center gap-1 shrink-0">
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification._id)}
            disabled={markingRead}
            className="p-2 rounded-lg text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors disabled:opacity-50"
            aria-label="Mark as read"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          disabled={deleting}
          className="p-2 rounded-lg text-neutral-300 hover:bg-error-50 hover:text-error-500 transition-colors disabled:opacity-50"
          aria-label="Delete notification"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
