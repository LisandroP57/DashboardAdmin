export const CATEGORIES = [
  { id: "electronics", label: "Electrónica" },
  { id: "home", label: "Hogar" },
  { id: "fashion", label: "Indumentaria" },
  { id: "sports", label: "Deportes" },
  { id: "toys", label: "Juguetes" },
  { id: "beauty", label: "Belleza" },
];

export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

export const ORDER_STATUSES = [
  { id: "pending", label: "Pendiente", color: "warning" },
  { id: "paid", label: "Pagado", color: "info" },
  { id: "shipped", label: "Enviado", color: "primary" },
  { id: "delivered", label: "Entregado", color: "success" },
  { id: "cancelled", label: "Cancelado", color: "error" },
];

export const ORDER_STATUS_MAP = Object.fromEntries(ORDER_STATUSES.map((s) => [s.id, s]));


export const REVENUE_STATUSES = ["paid", "shipped", "delivered"];

export const FINAL_STATUSES = ["delivered", "cancelled"];
