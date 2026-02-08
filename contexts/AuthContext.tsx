"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        if (e.newValue) {
          validateToken(e.newValue);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/validate-token", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log("Token validated successfully:", userData);
      } else {
        console.log("Token validation failed, removing token");
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Token validation error:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log("Network error during validation, keeping token");
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin"
      });

      console.log("Login response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login failed with status:", response.status, "Response:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `Request failed with status ${response.status}` };
        }
        
        throw new Error(errorData.error || "Login failed");
      }

      const { user, token } = await response.json();
      localStorage.setItem("token", token);
      setUser(user);
      console.log("Login successful for user:", user);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Network error: Unable to connect to server");
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      console.log("Attempting signup for:", email);
      
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password, name }),
        credentials: "same-origin"
      });

      console.log("Signup response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Signup failed with status:", response.status, "Response:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `Request failed with status ${response.status}` };
        }
        
        throw new Error(errorData.error || "Signup failed");
      }

      const { user, token } = await response.json();
      localStorage.setItem("token", token);
      setUser(user);
      console.log("Signup successful for user:", user);
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Network error: Unable to connect to server");
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
