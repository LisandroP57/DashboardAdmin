import { delay, table } from "./db";
import { REVENUE_STATUSES } from "../config/catalog";

export async function listCustomers() {
  await delay();
  const orders = table("orders").all();

  return table("customers")
    .all()
    .map((customer) => {
      const own = orders.filter((order) => order.customerId === customer.id);
      return {
        ...customer,
        ordersCount: own.length,
        totalSpent: own
          .filter((order) => REVENUE_STATUSES.includes(order.status))
          .reduce((sum, order) => sum + order.total, 0),
      };
    });
}
