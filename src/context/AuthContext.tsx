"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } from "firebase/auth";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER";
  avatar?: string;
}

export function getDashboardRoute(role?: string): string {
  const normalizedRole = role?.toUpperCase();
  if (normalizedRole === "CAMPUS_MANAGER") {
    return "/dashboard/manager";
  }
  if (normalizedRole === "ORGANIZER") {
    return "/dashboard/organizer";
  }
  return "/dashboard/student";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  register: (name: string, email: string, password: string, role: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getDashboardRoute: (role?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isRegisteringRef = React.useRef(false);

  const fetchCurrentUser = async (firebaseUser: any) => {
    if (isRegisteringRef.current) {
      return null;
    }

    if (!firebaseUser) {
      // Check if session cookie is already valid on server
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.user) {
            setUser(meData.user);
            if (typeof document !== "undefined") {
              document.cookie = `campus_user_role=${meData.user.role}; path=/; max-age=604800; SameSite=Lax`;
            }
            setLoading(false);
            return meData.user;
          }
        }
      } catch {
        // ignore
      }
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const idToken = await firebaseUser.getIdToken();
      // Use idToken to set session cookie on the backend
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (typeof document !== "undefined" && data.user?.role) {
          document.cookie = `campus_user_role=${data.user.role}; path=/; max-age=604800; SameSite=Lax`;
        }
        return data.user;
      } else {
        // Fallback to /api/auth/me
        try {
          const meRes = await fetch("/api/auth/me", { cache: "no-store" });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData?.user) {
              setUser(meData.user);
              if (typeof document !== "undefined" && meData.user?.role) {
                document.cookie = `campus_user_role=${meData.user.role}; path=/; max-age=604800; SameSite=Lax`;
              }
              return meData.user;
            }
          }
        } catch {
          // ignore
        }
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      fetchCurrentUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const token = await userCredential.user.getIdTokenResult(true);
      const role = token.claims.role as string;
      
      const cleanEmail = email.toLowerCase().trim();
      const isAllowedDomain = cleanEmail.endsWith("@kalvium.community") || cleanEmail.endsWith("@kalvium.com");
      if (role !== "CAMPUS_MANAGER" && !isAllowedDomain) {
        await signOut(auth);
        return { success: false, error: "Access restricted to @kalvium.community or @kalvium.com emails." };
      }

      const fetchedUser = await fetchCurrentUser(userCredential.user);
      const effectiveRole = role || fetchedUser?.role || "STUDENT";
      if (typeof document !== "undefined") {
        document.cookie = `campus_user_role=${effectiveRole}; path=/; max-age=604800; SameSite=Lax`;
      }

      return { success: true, role: effectiveRole };
    } catch (e: any) {
      return { success: false, error: e.message || "Login failed" };
    }
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const isAllowedDomain = cleanEmail.endsWith("@kalvium.community") || cleanEmail.endsWith("@kalvium.com");
      if (!isAllowedDomain) {
        return { success: false, error: "Only @kalvium.community and @kalvium.com emails are allowed for registration." };
      }

      isRegisteringRef.current = true;

      // 1. Create user in Firebase Auth (or recover if user was already created during an interrupted attempt)
      let firebaseUser: any;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
      } catch (authErr: any) {
        if (authErr.code === "auth/email-already-in-use") {
          try {
            const signInCred = await signInWithEmailAndPassword(auth, email, password);
            firebaseUser = signInCred.user;
          } catch {
            isRegisteringRef.current = false;
            return { success: false, error: "This email is already registered. Please sign in instead." };
          }
        } else {
          isRegisteringRef.current = false;
          const msg = authErr.code === "auth/weak-password"
            ? "Password should be at least 6 characters."
            : authErr.message || "Registration failed.";
          return { success: false, error: msg };
        }
      }
      
      // 2. Update profile
      try {
        await updateProfile(firebaseUser, { displayName: name });
      } catch {
        // ignore
      }
      
      const idToken = await firebaseUser.getIdToken(true);

      // 3. Call our backend to set custom claims, create user document, and set session cookie
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ name, email, role, uid: firebaseUser.uid }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        isRegisteringRef.current = false;
        await signOut(auth);
        return { success: false, error: data.error || "Registration failed" };
      }
      
      // Force token refresh to get new claims locally
      await firebaseUser.getIdToken(true);
      isRegisteringRef.current = false;
      const fetchedUser = await fetchCurrentUser(firebaseUser);
      const effectiveRole = role || fetchedUser?.role || "STUDENT";
      if (typeof document !== "undefined") {
        document.cookie = `campus_user_role=${effectiveRole}; path=/; max-age=604800; SameSite=Lax`;
      }
      
      return { success: true, role: effectiveRole };
    } catch (e: any) {
      isRegisteringRef.current = false;
      return { success: false, error: e.message || "Network error" };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const isAllowedDomain = cleanEmail.endsWith("@kalvium.community") || cleanEmail.endsWith("@kalvium.com");
      if (!isAllowedDomain) {
        return {
          success: false,
          error: "Access restricted to valid campus emails ending in @kalvium.community or @kalvium.com",
        };
      }

      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        // Prevent email enumeration while maintaining graceful feedback
        return { success: true };
      }
      if (e.code === "auth/invalid-email") {
        return { success: false, error: "Please provide a valid email address." };
      }
      return { success: false, error: e.message || "Failed to send password reset email." };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });
      if (typeof document !== "undefined") {
        document.cookie = "campus_user_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      setUser(null);
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        resetPassword,
        logout,
        refreshUser: () => fetchCurrentUser(auth.currentUser),
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
