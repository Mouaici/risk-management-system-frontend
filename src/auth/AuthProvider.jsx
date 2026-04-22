import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  configureApiClient,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
} from "../api/client.js";
import { AuthContext } from "./AuthContext.js";

const getDisplayName = (user) => {
  if (!user) {
    return "";
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.email || "User";
};

export const AuthProvider = ({ children }) => {
  const accessTokenRef = useRef(null);
  const [accessToken, setAccessToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const me = await getCurrentUser();
    setCurrentUser(me);
    return me;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const refreshed = await refreshSession();

      accessTokenRef.current = refreshed.accessToken;
      setAccessToken(refreshed.accessToken);
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  const login = useCallback(
    async ({ email, password }) => {
      const response = await loginRequest({ email, password });

      accessTokenRef.current = response.accessToken;
      setAccessToken(response.accessToken);
      await loadCurrentUser();
    },
    [loadCurrentUser],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest({ auth: Boolean(accessTokenRef.current) });
    } catch {
      // Keep UI responsive even if backend logout fails.
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => accessTokenRef.current,
      refreshAccessToken: refresh,
      onAuthFailure: clearAuth,
    });
  }, [clearAuth, refresh]);

  useEffect(() => {
    const bootstrap = async () => {
      const hasSession = await refresh();
      if (hasSession) {
        try {
          await loadCurrentUser();
        } catch {
          clearAuth();
        }
      }

      setIsBootstrapping(false);
    };

    bootstrap();
  }, [clearAuth, loadCurrentUser, refresh]);

  const value = useMemo(
    () => ({
      accessToken,
      currentUser,
      displayName: getDisplayName(currentUser),
      isAuthenticated: Boolean(accessToken),
      isBootstrapping,
      login,
      logout,
      refresh,
    }),
    [accessToken, currentUser, isBootstrapping, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
