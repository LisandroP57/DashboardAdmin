import { createTheme } from "@mui/material/styles";

export function createAppTheme(mode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? "#818cf8" : "#4f46e5" },
      secondary: { main: "#0ea5e9" },
      success: { main: "#16a34a" },
      warning: { main: "#f59e0b" },
      error: { main: "#dc2626" },
      background: isDark ? { default: "#0b1020", paper: "#121a2e" } : { default: "#f4f6fb", paper: "#ffffff" },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { borderRadius: 16 } } },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    },
  });
}
