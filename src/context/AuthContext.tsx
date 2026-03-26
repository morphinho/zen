import { createContext, useContext, ReactNode } from "react";
// DEV MODE — imports originais comentados
// import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
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

// DEV MODE — usuário fake sempre logado
const DEV_USER = {
  id: "dev-user-123",
  email: "dev@test.com",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
} as unknown as User;

const DEV_SESSION = {
  access_token: "dev-token",
  refresh_token: "dev-refresh",
  expires_in: 999999,
  token_type: "bearer",
  user: DEV_USER,
} as unknown as Session;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // DEV MODE — sem useState/useEffect, valores fixos
  const session = DEV_SESSION;
  const user = DEV_USER;
  const loading = false;

  // DEV MODE — funções de auth são no-ops
  const signInWithEmail = async (_email: string) => {
    console.log("DEV MODE: signInWithEmail is a no-op");
  };

  const signOut = async () => {
    console.log("DEV MODE: signOut is a no-op");
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
