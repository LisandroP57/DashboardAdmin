
import { readJSON, writeJSON } from "./storage";
import { generateSeed } from "./seed";

export const SCHEMA_VERSION = 1;

export const latency = { ms: 180 };
export const delay = (ms = latency.ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function uid(prefix) {
  const random = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID().split("-")[0]
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

export function seedDatabase(now = new Date()) {
  const seed = generateSeed(now);
  writeJSON("products", seed.products);
  writeJSON("customers", seed.customers);
  writeJSON("orders", seed.orders);
  writeJSON("meta", { schema: SCHEMA_VERSION, seededAt: now.toISOString() });
}

export const resetDemoData = () => seedDatabase();

function ensureDatabase() {
  if (readJSON("meta")?.schema !== SCHEMA_VERSION) seedDatabase();
}

export function table(name) {
  return {
    all() {
      ensureDatabase();
      const rows = readJSON(name);
      if (Array.isArray(rows)) return rows;
      seedDatabase();
      return readJSON(name, []);
    },
    save(rows) {
      writeJSON(name, rows);
    },
  };
}
