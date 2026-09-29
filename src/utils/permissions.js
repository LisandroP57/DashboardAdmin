import { ROLES } from "../config/app";

// En una app real estas reglas también se validan en el backend.
const PERMISSIONS = {
  "product:create": [ROLES.ADMIN, ROLES.MANAGER],
  "product:update": [ROLES.ADMIN, ROLES.MANAGER],
  "product:delete": [ROLES.ADMIN],
  "order:update": [ROLES.ADMIN, ROLES.MANAGER],
  "data:reset": [ROLES.ADMIN],
};

export const can = (user, action) => Boolean(user && PERMISSIONS[action]?.includes(user.role));
