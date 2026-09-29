import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useThemeMode } from "../hooks/useThemeMode";

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const label = mode === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro";

  return (
    <Tooltip title={label}>

    </Tooltip>
  );
}
