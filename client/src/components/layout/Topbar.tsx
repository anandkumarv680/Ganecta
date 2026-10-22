import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Network, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui';
import { getNotifications } from '@/api/notificationApi';
import { disconnectSocket } from '@/api/chatApi';
import type { Notification } from '@/types';

export default function Topbar() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await getNotifications();
      const unread = data.notifications.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      // silently ignore — don't disrupt the topbar
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
    if (!token) return;
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, token]);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-full">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-neutral-700" />
        </button>

        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-md relative hidden sm:block"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search developers..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-100 border border-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
          />
        </form>

        <div className="flex-1 sm:flex-none" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-neutral-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center px-1 rounded-full bg-error-500 text-white text-[10px] font-bold leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {user ? (
            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <Avatar
                  src={user.profilePicture || undefined}
                  name={user.name}
                  size="sm"
                />
                <span className="hidden lg:block text-sm font-medium text-neutral-700 max-w-[120px] truncate">
                  {user.name}
                </span>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-neutral-200 shadow-card-hover py-1.5 z-40 animate-slide-up">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate(`/profile/${user._id}`);
                    }}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-neutral-500" />
                    View Profile
                  </button>
                  <div className="my-1 border-t border-neutral-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="h-9 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <Network className="h-4 w-4" />
                </div>
                <span className="font-bold text-neutral-900">Ganecta</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100"
              >
                <X className="h-5 w-5 text-neutral-600" />
              </button>
            </div>
            <div className="px-4 py-4">
              <form onSubmit={handleSearch} className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search developers..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-100 text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
