"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        // In a real app, you would validate the token with your backend
        const token = localStorage.getItem("token");
        if (token) {
          // Mock user data - in a real app, this would come from your API
          setUser({
            id: "1",
            email: "user@example.com",
            name: "Demo User",
            role: "user",
          });
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await axios.post("/api/auth/login", { email, password });
      
      // Mock successful login
      const token = "mock-jwt-token";
      localStorage.setItem("token", token);
      
      // Mock user data
      setUser({
        id: "1",
        email,
        name: email.split("@")[0],
        role: email.includes("admin") ? "admin" : "user",
      });
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await axios.post("/api/auth/register", { name, email, password });
      
      // Mock successful registration
      const token = "mock-jwt-token";
      localStorage.setItem("token", token);
      
      // Mock user data
      setUser({
        id: "1",
        email,
        name,
        role: "user",
      });
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // In a real app, you might want to invalidate the token on the server
      // await axios.post("/api/auth/logout");
      
      localStorage.removeItem("token");
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      // In a real app, this would be an API call
      // await axios.post("/api/auth/forgot-password", { email });
      
      // Mock successful request
      console.log("Password reset email sent to:", email);
    } catch (error) {
      console.error("Forgot password request failed:", error);
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      // In a real app, this would be an API call
      // await axios.post("/api/auth/reset-password", { token, password });
      
      // Mock successful reset
      console.log("Password reset successful");
      router.push("/auth/login");
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};