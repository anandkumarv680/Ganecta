import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui';
import type { SearchUserResult } from '@/types';

interface UserListItemProps {
  user: SearchUserResult;
  onClose?: () => void;
}

export default function UserListItem({ user, onClose }: UserListItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClose) onClose();
    navigate(`/profile/${user._id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
    >
      <Avatar
        src={user.profilePicture || undefined}
        name={user.name}
        size="md"
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 truncate">
          {user.name}
        </p>
        <p className="text-sm text-neutral-500 truncate">
          @{user.username}
        </p>
      </div>
    </button>
  );
}
