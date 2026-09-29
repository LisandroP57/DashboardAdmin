import { delay, table } from "./db";
import { joinOrders } from "./ordersService";
import { CATEGORY_LABELS, REVENUE_STATUSES } from "../config/catalog";
import { LOCALE, LOW_STOCK_THRESHOLD } from "../config/app";

const DAY = 24 * 60 * 60 * 1000;

const isConfirmed = (order) => REVENUE_STATUSES.includes(order.status);
const sumTotals = (orders) => orders.reduce((sum, order) => sum + order.total, 0);
const inRange = (iso, from, to) => {
  const time = new Date(iso).getTime();
  return time >= from && time < to;
};

// Variación porcentual; null cuando no hay período previo con el que comparar.
export const percentChange = (current, previous) => (previous === 0 ? null : ((current - previous) / previous) * 100);

export function computeKpis({ orders, customers, products }, now = new Date(), days = 30) {
  const end = now.getTime() + 1;
  const start = end - days * DAY;
  const previousStart = start - days * DAY;

  const currentOrders = orders.filter((o) => inRange(o.createdAt, start, end) && o.status !== "cancelled");
  const previousOrders = orders.filter((o) => inRange(o.createdAt, previousStart, start) && o.status !== "cancelled");
  const currentConfirmed = currentOrders.filter(isConfirmed);
  const previousConfirmed = previousOrders.filter(isConfirmed);

  const revenue = sumTotals(currentConfirmed);
  const previousRevenue = sumTotals(previousConfirmed);
  const averageTicket = currentConfirmed.length ? revenue / currentConfirmed.length : 0;
  const previousAverageTicket = previousConfirmed.length ? previousRevenue / previousConfirmed.length : 0;

  const newCustomers = customers.filter((c) => inRange(c.createdAt, start, end)).length;
  const previousNewCustomers = customers.filter((c) => inRange(c.createdAt, previousStart, start)).length;

  return {
    revenue: { value: revenue, change: percentChange(revenue, previousRevenue) },
    orders: { value: currentOrders.length, change: percentChange(currentOrders.length, previousOrders.length) },
    averageTicket: { value: averageTicket, change: percentChange(averageTicket, previousAverageTicket) },
    newCustomers: { value: newCustomers, change: percentChange(newCustomers, previousNewCustomers) },
    lowStock: products.filter((p) => p.status === "active" && p.stock <= LOW_STOCK_THRESHOLD).length,
  };
}

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export function revenueByMonth(orders, now = new Date(), months = 12) {
  const labelFormatter = new Intl.DateTimeFormat(LOCALE, { month: "short", year: "2-digit" });
  const buckets = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({ key: monthKey(date), label: labelFormatter.format(date).replace(".", ""), revenue: 0, orders: 0 });
  }
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  orders.forEach((order) => {
    const bucket = byKey.get(monthKey(new Date(order.createdAt)));
    if (!bucket || order.status === "cancelled") return;
    bucket.orders += 1;
    if (isConfirmed(order)) bucket.revenue += order.total;
  });
  return buckets;
}

export function revenueByCategory(orders) {
  const totals = {};
  orders.filter(isConfirmed).forEach((order) =>
    order.items.forEach((item) => {
      totals[item.category] = (totals[item.category] ?? 0) + item.qty * item.unitPrice;
    }),
  );
  return Object.entries(totals)
    .map(([category, revenue]) => ({ category, label: CATEGORY_LABELS[category] ?? category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function topProducts(orders, limit = 5) {
  const totals = new Map();
  orders.filter(isConfirmed).forEach((order) =>
    order.items.forEach((item) => {
      const entry = totals.get(item.productId) ?? { productId: item.productId, name: item.name, units: 0, revenue: 0 };
      entry.units += item.qty;
      entry.revenue += item.qty * item.unitPrice;
      totals.set(item.productId, entry);
    }),
  );
  return [...totals.values()].sort((a, b) => b.units - a.units).slice(0, limit);
}

export const lowStockProducts = (products, threshold = LOW_STOCK_THRESHOLD) =>
  products
    .filter((product) => product.status === "active" && product.stock <= threshold)
    .sort((a, b) => a.stock - b.stock);

export async function getDashboardData(now = new Date()) {
  await delay();
  const products = table("products").all();
  const customers = table("customers").all();
  const orders = table("orders").all();

  return {
    kpis: computeKpis({ orders, customers, products }, now),
    monthly: revenueByMonth(orders, now),
    byCategory: revenueByCategory(orders),
    topProducts: topProducts(orders),
    lowStock: lowStockProducts(products),
    recentOrders: joinOrders(orders, customers)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6),
  };
}
