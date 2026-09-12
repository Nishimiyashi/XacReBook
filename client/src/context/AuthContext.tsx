import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError } from '../lib/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isModalOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
  signIn: (name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    api
      .get<{ user: User }>('/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && !user && !hasPrompted) {
      setModalOpen(true);
      setHasPrompted(true);
    }
  }, [loading, user, hasPrompted]);

  const signIn = useCallback(async (name: string, phone: string) => {
    const res = await api.post<{ user: User }>('/auth/signin', { name, phone });
    setUser(res.user);
    setModalOpen(false);
  }, []);

  const signOut = useCallback(async () => {
    await api.post('/auth/signout');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isModalOpen,
      openSignIn: () => setModalOpen(true),
      closeSignIn: () => setModalOpen(false),
      signIn,
      signOut,
    }),
    [user, loading, isModalOpen, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
