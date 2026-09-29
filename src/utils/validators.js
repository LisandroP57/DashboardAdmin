import { CATEGORY_LABELS } from "../config/catalog";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const REQUIRED = "Campo obligatorio";

export const validateEmail = (email) => {
  if (!email || !String(email).trim()) return REQUIRED;
  if (!EMAIL_REGEX.test(String(email).trim())) return "Ingresá un email válido";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return REQUIRED;
  if (password.length < 8) return "Debe tener al menos 8 caracteres";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Debe incluir letras y números";
  return null;
};

const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => Boolean(message)));

export const validateLogin = ({ email, password }) =>
  compact({
    email: validateEmail(email),
    password: password ? null : REQUIRED,
  });

export const validateRegister = ({ name, lastName, email, password, confirmPassword, terms }) =>
  compact({
    name: name?.trim() ? null : REQUIRED,
    lastName: lastName?.trim() ? null : REQUIRED,
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: !confirmPassword
      ? REQUIRED
      : password !== confirmPassword
        ? "Las contraseñas no coinciden"
        : null,
    terms: terms ? null : "Debés aceptar los términos y condiciones",
  });

const isBlank = (value) => value === "" || value === null || value === undefined;

export const validateProduct = ({ name, sku, category, price, stock, description }) => {
  const errors = {
    name: !name?.trim() ? REQUIRED : name.trim().length > 80 ? "Máximo 80 caracteres" : null,
    sku: sku && !/^[A-Za-z0-9-]{3,20}$/.test(String(sku).trim()) ? "3 a 20 caracteres: letras, números o guiones" : null,
    category: CATEGORY_LABELS[category] ? null : "Elegí una categoría",
    description: description && description.length > 300 ? "Máximo 300 caracteres" : null,
  };

  if (isBlank(price)) errors.price = REQUIRED;
  else if (!Number.isFinite(Number(price)) || Number(price) < 0) errors.price = "Ingresá un precio válido";

  if (isBlank(stock)) errors.stock = REQUIRED;
  else if (!Number.isInteger(Number(stock)) || Number(stock) < 0) errors.stock = "Ingresá un entero mayor o igual a 0";

  return compact(errors);
};
