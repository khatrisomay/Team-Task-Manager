import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("ttm_token"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        localStorage.removeItem("ttm_token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (payload) => {
    const loginPayload = {
      email: payload.email,
      password: payload.password
    };

    const { data } = await api.post("/auth/login", loginPayload);
    localStorage.setItem("ttm_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (payload) => {
    const signupPayload = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role
    };

    const { data } = await api.post("/auth/register", signupPayload);
    localStorage.setItem("ttm_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("ttm_token");
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === "Admin",
      login,
      signup,
      logout
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
