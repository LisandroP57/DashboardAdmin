import { deleteProduct, createProduct, listProducts, updateProduct } from "./productsService";
import { listOrders, updateOrderStatus } from "./ordersService";
import { listCustomers } from "./customersService";
import { getDashboardData } from "./analyticsService";
import { resetDemoData } from "./db";
import { LOW_STOCK_THRESHOLD } from "../config/app";
import { generateSeed } from "./seed";

const validProduct = {
  name: "Termo Acero 1L",
  sku: "",
  category: "home",
  price: "19900",
  stock: "25",
  description: "Mantiene la temperatura 12 horas",
  status: "active",
};

describe("datos de demostración", () => {
  it("son deterministas y consistentes", () => {
    const now = new Date(2026, 5, 15);
    const a = generateSeed(now);
    const b = generateSeed(now);
    expect(a).toEqual(b);

    a.orders.forEach((order) => {
      const expected = order.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
      expect(order.total).toBe(expected);
      expect(new Date(order.createdAt).getTime()).toBeLessThanOrEqual(now.getTime());
    });
    expect(new Set(a.products.map((p) => p.sku)).size).toBe(a.products.length);
    expect(a.products.some((p) => p.stock <= LOW_STOCK_THRESHOLD)).toBe(true);
  });
});

describe("productsService", () => {
  it("siembra el catálogo la primera vez", async () => {
    const products = await listProducts();
    expect(products.length).toBeGreaterThan(10);
  });

  it("crea un producto con SKU automático y lo lista primero", async () => {
    const before = await listProducts();
    const created = await createProduct(validProduct);

    expect(created.price).toBe(19900);
    expect(created.stock).toBe(25);
    expect(created.sku).toMatch(/^SKU-\d+$/);

    const after = await listProducts();
    expect(after).toHaveLength(before.length + 1);
    expect(after[0].id).toBe(created.id);
  });

  it("valida los datos y rechaza SKU repetidos", async () => {
    await expect(createProduct({ ...validProduct, name: "", price: "" })).rejects.toMatchObject({
      code: "VALIDATION",
    });

    const [existing] = await listProducts();
    await expect(createProduct({ ...validProduct, sku: existing.sku })).rejects.toMatchObject({
      code: "SKU_TAKEN",
    });
  });

  it("edita un producto sin cambiar su id", async () => {
    const [product] = await listProducts();
    const updated = await updateProduct(product.id, { ...product, name: "Nombre nuevo", price: 100 });

    expect(updated).toMatchObject({ id: product.id, name: "Nombre nuevo", price: 100 });
    const stored = (await listProducts()).find((p) => p.id === product.id);
    expect(stored.name).toBe("Nombre nuevo");
  });

  it("elimina un producto y avisa si ya no existe", async () => {
    const [product] = await listProducts();
    await deleteProduct(product.id);
    expect((await listProducts()).some((p) => p.id === product.id)).toBe(false);
    await expect(deleteProduct(product.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("ordersService", () => {
  it("lista pedidos con el nombre del cliente, del más nuevo al más viejo", async () => {
    const orders = await listOrders();
    expect(orders[0].customerName).not.toBe("Cliente eliminado");
    expect(orders[0].unitsCount).toBeGreaterThan(0);
    for (let i = 1; i < orders.length; i += 1) {
      expect(orders[i - 1].createdAt >= orders[i].createdAt).toBe(true);
    }
  });

  it("cambia el estado de un pedido abierto", async () => {
    const orders = await listOrders();
    const open = orders.find((o) => o.status === "pending");
    const updated = await updateOrderStatus(open.id, "paid");
    expect(updated.status).toBe("paid");
  });

  it("no permite modificar pedidos entregados o cancelados ni estados inválidos", async () => {
    const orders = await listOrders();
    const final = orders.find((o) => o.status === "delivered");
    await expect(updateOrderStatus(final.id, "pending")).rejects.toMatchObject({ code: "ORDER_LOCKED" });

    const open = orders.find((o) => o.status === "pending");
    await expect(updateOrderStatus(open.id, "inventado")).rejects.toMatchObject({ code: "VALIDATION" });
  });
});

describe("customersService y analytics", () => {
  it("calcula pedidos y total comprado por cliente", async () => {
    const customers = await listCustomers();
    expect(customers.length).toBe(40);
    const withOrders = customers.filter((c) => c.ordersCount > 0);
    expect(withOrders.length).toBeGreaterThan(0);
    expect(withOrders.every((c) => c.totalSpent >= 0)).toBe(true);
  });

  it("arma los datos del dashboard", async () => {
    const data = await getDashboardData();
    expect(data.monthly).toHaveLength(12);
    expect(data.recentOrders).toHaveLength(6);
    expect(data.kpis.lowStock).toBeGreaterThan(0);
    expect(data.byCategory.length).toBeGreaterThan(0);
  });

  it("restablecer datos vuelve al estado inicial", async () => {
    const [product] = await listProducts();
    await deleteProduct(product.id);
    resetDemoData();
    expect((await listProducts()).some((p) => p.id === product.id)).toBe(true);
  });
});
