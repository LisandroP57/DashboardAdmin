import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./authContext";
import * as authService from "../services/authService";
import { STORAGE_NAMESPACE } from "../services/storage";

export function AuthProvider({ children }) {
  // La sesión se lee de forma síncrona: no hay parpadeo de "cargando" ni redirecciones falsas al recargar.
  const [user, setUser] = useState(() => authService.getCurrentUser());

  // Si se cierra sesión en otra pestaña, esta se entera.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || event.key.startsWith(`${STORAGE_NAMESPACE}:session`)) {
        setUser(authService.getCurrentUser());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedUser = await authService.login(credentials);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(async (data) => {
    const newUser = await authService.register(data);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
