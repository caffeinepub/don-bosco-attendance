import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type SimpleAuthUser = {
  name: string;
  role: string; // "admin" or "teacher"
};

export type SimpleAuthContext = {
  user: SimpleAuthUser | null;
  isAuthenticated: boolean;
  login: (user: SimpleAuthUser) => void;
  logout: () => void;
};

const SESSION_KEY = "donbosco_session";

function loadSession(): SimpleAuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as SimpleAuthUser;
  } catch {
    // ignore
  }
  return null;
}

const SimpleAuthReactContext = createContext<SimpleAuthContext | undefined>(
  undefined,
);

export function useSimpleAuth(): SimpleAuthContext {
  const ctx = useContext(SimpleAuthReactContext);
  if (!ctx) throw new Error("SimpleAuthProvider not found");
  return ctx;
}

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleAuthUser | null>(loadSession);

  const login = useCallback((newUser: SimpleAuthUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo<SimpleAuthContext>(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user, login, logout],
  );

  return createElement(SimpleAuthReactContext.Provider, { value, children });
}
