import { AppError } from "./errors";
import { delay, table } from "./db";
import { FINAL_STATUSES, ORDER_STATUS_MAP } from "../config/catalog";

// Agrega el nombre del cliente y la cantidad de unidades a cada pedido.
export function joinOrders(orders, customers) {
  const byId = new Map(customers.map((customer) => [customer.id, customer]));
  return orders.map((order) => {
    const customer = byId.get(order.customerId);
    return {
      ...order,
      customerName: customer ? `${customer.name} ${customer.lastName}` : "Cliente eliminado",
      unitsCount: order.items.reduce((sum, item) => sum + item.qty, 0),
    };
  });
}

export async function listOrders() {
  await delay();
  return joinOrders(table("orders").all(), table("customers").all()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function updateOrderStatus(id, status) {
  await delay();
  if (!ORDER_STATUS_MAP[status]) throw new AppError("VALIDATION", "El estado indicado no es válido.");

  const orders = table("orders").all();
  const current = orders.find((order) => order.id === id);
  if (!current) throw new AppError("NOT_FOUND", "El pedido ya no existe.");
  if (FINAL_STATUSES.includes(current.status)) {
    throw new AppError("ORDER_LOCKED", "Un pedido entregado o cancelado no se puede modificar.");
  }

  const updated = { ...current, status };
  table("orders").save(orders.map((order) => (order.id === id ? updated : order)));
  return updated;
}
