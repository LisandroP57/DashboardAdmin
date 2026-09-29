import { CURRENCY, LOCALE } from "../config/app";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat(LOCALE);
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "short", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
export const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

export const formatDate = (iso) => (iso ? dateFormatter.format(new Date(iso)) : "—");
export const formatDateTime = (iso) => (iso ? dateTimeFormatter.format(new Date(iso)) : "—");

export const formatPercent = (value) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded.toLocaleString(LOCALE)}%`;
};

export const getInitials = (name = "", lastName = "") =>
  `${name.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "?";
