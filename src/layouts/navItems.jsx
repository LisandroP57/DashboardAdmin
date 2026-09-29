import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import { ROUTES } from "../config/app";

export const NAV_ITEMS = [
  { label: "Resumen", to: ROUTES.dashboard, icon: <DashboardIcon />, end: true },
  { label: "Productos", to: ROUTES.products, icon: <Inventory2Icon /> },
  { label: "Pedidos", to: ROUTES.orders, icon: <ReceiptLongIcon /> },
  { label: "Clientes", to: ROUTES.customers, icon: <GroupIcon /> },
  { label: "Configuración", to: ROUTES.settings, icon: <SettingsIcon /> },
];
