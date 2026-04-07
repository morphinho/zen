import { createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const GUEST_USER = {
  id: "guest-user",
  email: "guest@zeenlife.life",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
} as unknown as User;

const GUEST_SESSION = {
  access_token: "guest-token",
  refresh_token: "guest-refresh",
  expires_in: 999999,
  token_type: "bearer",
  user: GUEST_USER,
} as unknown as Session;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const session = GUEST_SESSION;
  const user = GUEST_USER;
  const loading = false;

  const signInWithEmail = async (_email: string) => {};
  const signOut = async () => {};

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
