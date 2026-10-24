import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Dumbbell,
  MessageSquare,
  Bell,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui";
import { disconnectSocket } from "@/api/chatApi";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/challenges", label: "Challenges", icon: Dumbbell },
  { to: "/search", label: "Discover", icon: Users },
  { to: "/chat", label: "Messages", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 h-screen sticky top-0 border-r border-neutral-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-neutral-200">
        <div className="flex items-center px-4 h-16 border-b border-neutral-200">
          <div className="flex items-end ">
            {/* <img
              src="/ganecta-logo.png"
              alt="Ganecta"
              className="h-10 w-auto object-contain"
            /> */}
            <span className="text-4xl font-bold text-neutral-900 tracking-tight">
              G
            </span>
            <span className="text-2xl font-bold text-neutral-900 tracking-tight">
              anecta
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-neutral-200 p-3 space-y-1">
          <NavLink
            to={`/profile/${user._id}`}
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
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign Out
          </button>
        </div>
      )}

      {!user && (
        <div className="border-t border-neutral-200 p-3">
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors duration-200"
          >
            <UserIcon className="h-5 w-5" />
            Sign In
          </NavLink>
        </div>
      )}
    </aside>
  );
}
