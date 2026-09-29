
export const APP_NAME = "Dashboard Admin";
export const APP_TAGLINE = "Panel de ventas e inventario";
export const APP_VERSION = "2";
export const AUTHOR = "Lisandro Palavecino";

export const LOCALE = "es-AR";
export const CURRENCY = "ARS";
export const LOW_STOCK_THRESHOLD = 10;

export const ROLES = Object.freeze({ ADMIN: "admin", MANAGER: "manager" });
export const ROLE_LABELS = Object.freeze({ admin: "Administrador", manager: "Gestor" });

export const ROUTES = Object.freeze({
  login: "/login",
  register: "/register",
  dashboard: "/",
  products: "/products",
  orders: "/orders",
  customers: "/customers",
  settings: "/settings",
});

export const DEMO_ACCOUNT = Object.freeze({
  name: "Admin",
  lastName: "Demo",
  email: "admin@demo.com",
  password: "Admin1234",
});
