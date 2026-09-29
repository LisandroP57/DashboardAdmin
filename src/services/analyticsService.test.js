import {
  computeKpis,
  lowStockProducts,
  percentChange,
  revenueByCategory,
  revenueByMonth,
  topProducts,
} from "./analyticsService";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date(2026, 5, 15, 12, 0, 0); // 15/06/2026 12:00 (hora local)
const ago = (days) => new Date(now.getTime() - days * DAY).toISOString();

const item = (productId, category, qty, unitPrice) => ({ productId, name: productId, category, qty, unitPrice });

const orders = [
  { id: "o1", status: "delivered", total: 1000, createdAt: ago(5), items: [item("a", "home", 2, 500)] },
  { id: "o2", status: "paid", total: 500, createdAt: ago(10), items: [item("b", "toys", 1, 500)] },
  { id: "o3", status: "cancelled", total: 900, createdAt: ago(3), items: [item("a", "home", 1, 900)] },
  { id: "o4", status: "pending", total: 300, createdAt: ago(2), items: [item("b", "toys", 1, 300)] },
  { id: "o5", status: "delivered", total: 800, createdAt: ago(40), items: [item("a", "home", 1, 800)] },
];
const customers = [
  { id: "c1", createdAt: ago(5) },
  { id: "c2", createdAt: ago(45) },
  { id: "c3", createdAt: ago(200) },
];
const products = [
  { id: "a", status: "active", stock: 3 },
  { id: "b", status: "active", stock: 50 },
  { id: "c", status: "active", stock: 0 },
  { id: "d", status: "inactive", stock: 1 },
];

describe("percentChange", () => {
  it("calcula la variación y devuelve null sin período previo", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(5, 0)).toBeNull();
  });
});

describe("computeKpis", () => {
  const kpis = computeKpis({ orders, customers, products }, now);

  it("suma solo ventas confirmadas (pagadas, enviadas o entregadas) como ingresos", () => {
    expect(kpis.revenue.value).toBe(1500);
    expect(kpis.revenue.change).toBeCloseTo(87.5); // vs 800 del período previo
  });

  it("cuenta pedidos sin incluir los cancelados", () => {
    expect(kpis.orders.value).toBe(3);
    expect(kpis.orders.change).toBe(200);
  });

  it("calcula el ticket promedio sobre ventas confirmadas", () => {
    expect(kpis.averageTicket.value).toBe(750);
    expect(kpis.averageTicket.change).toBeCloseTo(-6.25);
  });

  it("cuenta clientes nuevos y productos activos con stock bajo", () => {
    expect(kpis.newCustomers.value).toBe(1);
    expect(kpis.lowStock).toBe(2); // el inactivo no cuenta
  });
});

describe("revenueByMonth", () => {
  it("devuelve 12 meses terminando en el actual", () => {
    const months = revenueByMonth(orders, now);
    expect(months).toHaveLength(12);
    const june = months[11];
    expect(june.revenue).toBe(1500);
    expect(june.orders).toBe(3); // o1, o2, o4 (o3 está cancelado)
    expect(months[10].revenue).toBe(800); // o5 cae en mayo
  });
});

describe("revenueByCategory y topProducts", () => {
  it("agrupa ingresos por categoría ordenados de mayor a menor", () => {
    const result = revenueByCategory(orders);
    expect(result[0]).toMatchObject({ category: "home", label: "Hogar", revenue: 1800 });
    expect(result[1]).toMatchObject({ category: "toys", revenue: 500 });
  });

  it("ordena los productos por unidades vendidas y respeta el límite", () => {
    const result = topProducts(orders, 1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ productId: "a", units: 3 });
  });
});

describe("lowStockProducts", () => {
  it("lista activos con stock bajo, del más crítico al menos", () => {
    expect(lowStockProducts(products, 10).map((p) => p.id)).toEqual(["c", "a"]);
  });
});
