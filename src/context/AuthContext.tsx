import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { loadData } from "@/services/store";
import { fetchProfile } from "@/services/supabaseStore";
import type { Profile, Role } from "@/types";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_KEY = "sistema-prestamos-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const profile = await fetchProfile(data.session.user.id);
            if (mounted) {
              setUser(profile);
              localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
            }
            return;
          }
        }

        const saved = localStorage.getItem(AUTH_KEY);
        if (saved && mounted) setUser(JSON.parse(saved) as Profile);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restoreSession();

    const subscription = supabase?.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
        return;
      }
      const profile = await fetchProfile(session.user.id);
      setUser(profile);
      localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: sessionData } = await supabase.auth.getUser();
        if (!sessionData.user) throw new Error("No se pudo validar el usuario en Supabase.");
        const profile = await fetchProfile(sessionData.user.id);
        if (!profile.active) throw new Error("Usuario inactivo.");
        setUser(profile);
        localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
        return;
      }

      const profile = loadData().profiles.find((item) => item.email.toLowerCase() === email.toLowerCase());
      const isDemoPassword = password === "admin123" || password === "cobrador123" || password.length >= 6;
      if (!profile || !profile.active || !isDemoPassword) {
        throw new Error("Credenciales invalidas o usuario inactivo.");
      }

      setUser(profile);
      localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      hasRole: (roles) => Boolean(user && roles.includes(user.role))
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function authModeLabel() {
  return isSupabaseConfigured ? "Supabase" : "Demo local";
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
