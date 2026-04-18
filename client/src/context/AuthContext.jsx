import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { api, endpoints } from "../lib/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get(endpoints.status);
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async ({ email, password }) => {
      const data = await api.post(endpoints.loginAPI, { email, password });
      await refresh();
      toast.success("Welcome back!");
      return data;
    },
    [refresh]
  );

  const signup = useCallback(
    async ({ username, email, password }) => {
      const data = await api.post(endpoints.signupAPI, {
        username,
        email,
        password,
      });
      await refresh();
      toast.success("Account created!");
      return data;
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      await api.post(endpoints.logoutAPI);
    } catch {
      // ignore — we still clear local user
    }
    setUser(null);
    toast.success("Logged out");
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refresh }),
    [user, loading, login, signup, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
