import { AppError } from "./errors";
import { delay, table, uid } from "./db";
import { validateProduct } from "../utils/validators";

const toNumber = (value) => (value === "" || value === null || value === undefined ? NaN : Number(value));

const sanitize = (input) => ({
  name: String(input.name ?? "").trim(),
  sku: String(input.sku ?? "").trim().toUpperCase(),
  description: String(input.description ?? "").trim(),
  category: input.category,
  price: toNumber(input.price),
  stock: toNumber(input.stock),
  status: input.status === "inactive" ? "inactive" : "active",
});

function assertValid(data) {
  const errors = validateProduct(data);
  if (Object.keys(errors).length > 0) {
    throw new AppError("VALIDATION", "Los datos del producto no son válidos.", errors);
  }
}

function nextSku(products) {
  const max = products.reduce((highest, product) => {
    const match = /^SKU-(\d+)$/.exec(product.sku);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 1000);
  return `SKU-${max + 1}`;
}

export async function listProducts() {
  await delay();
  return [...table("products").all()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createProduct(input) {
  await delay();
  const data = sanitize(input);
  assertValid(data);

  const products = table("products").all();
  const sku = data.sku || nextSku(products);
  if (products.some((product) => product.sku === sku)) {
    throw new AppError("SKU_TAKEN", "Ya existe un producto con ese SKU.");
  }

  const product = { id: uid("prod"), ...data, sku, createdAt: new Date().toISOString() };
  table("products").save([product, ...products]);
  return product;
}

export async function updateProduct(id, input) {
  await delay();
  const data = sanitize(input);
  assertValid(data);

  const products = table("products").all();
  const current = products.find((product) => product.id === id);
  if (!current) throw new AppError("NOT_FOUND", "El producto ya no existe.");

  const sku = data.sku || current.sku;
  if (products.some((product) => product.sku === sku && product.id !== id)) {
    throw new AppError("SKU_TAKEN", "Ya existe un producto con ese SKU.");
  }

  const updated = { ...current, ...data, sku };
  table("products").save(products.map((product) => (product.id === id ? updated : product)));
  return updated;
}

export async function deleteProduct(id) {
  await delay();
  const products = table("products").all();
  if (!products.some((product) => product.id === id)) {
    throw new AppError("NOT_FOUND", "El producto ya no existe.");
  }
  table("products").save(products.filter((product) => product.id !== id));
}
