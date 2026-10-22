import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { getToken, setToken, removeToken } from '@/utils/token';
import { login as loginApi, type LoginBody } from '@/api/authApi';
import { getUserById } from '@/api/userApi';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (body: LoginBody) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeTokenId(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.id ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const existingToken = getToken();
    if (!existingToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    const userId = decodeTokenId(existingToken);
    if (!userId) {
      removeToken();
      setTokenState(null);
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const fetchedUser = await getUserById(userId);
      setUser(fetchedUser);
    } catch {
      removeToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (body: LoginBody) => {
    const response = await loginApi(body);
    setToken(response.token);
    setTokenState(response.token);
    const userId = decodeTokenId(response.token);
    if (userId) {
      const fetchedUser = await getUserById(userId);
      setUser(fetchedUser);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
