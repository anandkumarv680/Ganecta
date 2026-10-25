import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Home,
  Users,
  Dumbbell,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui';
import { getNotifications } from '@/api/notificationApi';
import { disconnectSocket } from '@/api/chatApi';
import type { Notification } from '@/types';

const mobileNavItems = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/challenges', label: 'Challenges', icon: Dumbbell },
  { to: '/search', label: 'Discover', icon: Users },
  { to: '/chat', label: 'Messages', icon: MessageSquare },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
      setMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
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
      </header>

      {/* Mobile drawer — rendered outside the header to escape the
          backdrop-blur containing block that breaks position:fixed */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm animate-fade-in"
            onClick={closeMobileMenu}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-[85%] max-w-xs bg-white shadow-2xl flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-200 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900">Ganecta</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-neutral-600" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-4 shrink-0">
              <form onSubmit={handleSearch} className="relative">
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

            {/* Navigation links */}
            <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* User section */}
            {user && (
              <div className="border-t border-neutral-200 p-3 space-y-1 shrink-0">
                <NavLink
                  to={`/profile/${user._id}`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors duration-200"
                >
                  <Avatar
                    src={user.profilePicture || undefined}
                    name={user.name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      @{user.username}
                    </p>
                  </div>
                </NavLink>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
