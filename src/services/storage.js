// Acceso seguro a localStorage / sessionStorage. Si el navegador los bloquea
// (modo privado, cookies deshabilitadas) se usa un almacenamiento en memoria.
const NAMESPACE = "commerce-admin";
const memory = { local: new Map(), session: new Map() };

const fullKey = (key) => `${NAMESPACE}:${key}`;

const getArea = (kind) => {
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
};

const getRaw = (key, kind) => {
  try {
    const value = getArea(kind)?.getItem(fullKey(key));
    if (value !== null && value !== undefined) return value;
  } catch {
    /* se ignora y se usa la memoria */
  }
  return memory[kind].get(fullKey(key)) ?? null;
};

export function readJSON(key, fallback = null, kind = "local") {
  const raw = getRaw(key, kind);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value, kind = "local") {
  const raw = JSON.stringify(value);
  try {
    getArea(kind)?.setItem(fullKey(key), raw);
    memory[kind].delete(fullKey(key));
  } catch {
    memory[kind].set(fullKey(key), raw);
  }
}

export function removeKey(key, kind = "local") {
  memory[kind].delete(fullKey(key));
  try {
    getArea(kind)?.removeItem(fullKey(key));
  } catch {
    /* nada que hacer */
  }
}

export const STORAGE_NAMESPACE = NAMESPACE;
