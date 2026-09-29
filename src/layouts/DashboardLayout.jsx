import { Suspense, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import { Logo } from "../components/Logo";
import { LoadingState } from "../components/StateViews";
import { ThemeToggle } from "../components/ThemeToggle";
import { APP_NAME, APP_VERSION, AUTHOR, ROLE_LABELS, ROUTES } from "../config/app";
import { useAuth } from "../hooks/useAuth";
import { getInitials } from "../utils/formatters";
import { NAV_ITEMS } from "./navItems";

const DRAWER_WIDTH = 264;

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const currentItem = NAV_ITEMS.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));

  const handleLogout = () => {
    setMenuAnchor(null);
    navigate(ROUTES.login, { replace: true });
    logout();
  };

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ px: 2.5 }}>
        <Logo />
      </Toolbar>
      <Divider />
      <List component="nav" aria-label="Navegación principal" sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.active": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "& .MuiListItemIcon-root": { color: "inherit" },
                "&:hover": { bgcolor: "primary.dark" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} {AUTHOR} · v{APP_VERSION}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            aria-label="Abrir menú de navegación"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="p" noWrap sx={{ flexGrow: 1 }}>
            {currentItem?.label ?? APP_NAME}
          </Typography>
          <ThemeToggle />
          <IconButton
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            aria-label="Abrir menú de usuario"
            aria-haspopup="menu"
            sx={{ ml: 0.5 }}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
              {getInitials(user?.name, user?.lastName)}
            </Avatar>
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
              <Typography variant="subtitle2" noWrap>
                {user?.name} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap component="p">
                {user?.email}
              </Typography>
              <Chip size="small" label={ROLE_LABELS[user?.role] ?? user?.role} sx={{ mt: 0.5 }} />
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                navigate(ROUTES.settings);
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Configuración
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 }, bgcolor: "background.default" }}
      >
        <Toolbar />
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
