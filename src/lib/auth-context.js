"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, getStoredUser, clearAuthToken } from "./auth-client";

const AuthContext = createContext(null);

// AuthProvider wraps the whole app and provides session state
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // On mount, try to restore session from localStorage
    const storedUser = getStoredUser();
    const token      = getAuthToken();

    if (storedUser && token) {
      // Verify token is still valid against the server
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${apiUrl}/api/auth/get-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `better-auth.session_token=${token}`
        },
        credentials: "include"
      })
        .then(r => r.json())
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
          } else {
            // Token expired or invalid — clear it
            clearAuthToken();
            setUser(null);
          }
        })
        .catch(() => {
          // Network error — trust localStorage for now
          setUser(storedUser);
        })
        .finally(() => setIsPending(false));
    } else {
      setIsPending(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isPending }}>
      {children}
    </AuthContext.Provider>
  );
}

// useSession — drop-in replacement for better-auth's useSession
export function useSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Fallback — no provider (shouldn't happen)
    return { data: null, isPending: false };
  }
  return {
    data: ctx.user ? { user: ctx.user } : null,
    isPending: ctx.isPending,
    setUser: ctx.setUser
  };
}
