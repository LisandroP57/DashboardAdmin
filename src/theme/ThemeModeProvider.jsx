import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "./theme";
import { ThemeModeContext } from "./themeModeContext";
import { readJSON, writeJSON } from "../services/storage";

const STORAGE_KEY = "theme-mode";

function getInitialMode() {
  const saved = readJSON(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleMode = useCallback(() => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    writeJSON(STORAGE_KEY, next);
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

ThemeModeProvider.propTypes = { children: PropTypes.node.isRequired };
