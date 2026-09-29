// Autenticación simulada 100 % en el navegador (no hay backend).
// - Las contraseñas nunca se guardan en texto plano: PBKDF2-SHA256 con sal aleatoria (Web Crypto).
// - La sesión vive en localStorage ("Recordarme") o sessionStorage (se cierra con la pestaña).
// IMPORTANTE: es una demo para portfolio. En producción la autenticación debe resolverla un servidor.
import { AppError } from "./errors";
import { readJSON, removeKey, writeJSON } from "./storage";
import { uid } from "./db";
import { DEMO_ACCOUNT, ROLES } from "../config/app";
import { validateEmail, validateLogin, validatePassword } from "../utils/validators";

const USERS_KEY = "users";
const SESSION_KEY = "session";
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 horas
const REMEMBER_TTL = 30 * 24 * 60 * 60 * 1000; // 30 días
const PBKDF2_ITERATIONS = 100_000;
const DUMMY_SALT = "00".repeat(16);

const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();
const readUsers = () => readJSON(USERS_KEY, []);
const writeUsers = (users) => writeJSON(USERS_KEY, users);

export const toPublicUser = ({ id, name, lastName, email, role, createdAt }) => ({
  id,
  name,
  lastName,
  email,
  role,
  createdAt,
});

const toHex = (bytes) => Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex) => Uint8Array.from(hex.match(/.{2}/g) ?? [], (pair) => parseInt(pair, 16));

const randomHex = (size) => toHex(globalThis.crypto.getRandomValues(new Uint8Array(size)));

async function hashPassword(password, saltHex) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new AppError("CRYPTO_UNAVAILABLE", "Tu navegador no permite cifrar contraseñas. Abrí la app por HTTPS.");
  }
  const key = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromHex(saltHex), iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return toHex(bits);
}

// Comparación en tiempo constante para no filtrar información por diferencias de tiempo.
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function buildUser({ name, lastName, email, password, role }) {
  const salt = randomHex(16);
  return {
    id: uid("user"),
    name: name.trim(),
    lastName: lastName.trim(),
    email: normalizeEmail(email),
    role,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
}

let pendingDemoSeed = null;

async function createDemoAdminIfMissing() {
  if (readUsers().some((user) => user.email === DEMO_ACCOUNT.email)) return;
  const admin = await buildUser({ ...DEMO_ACCOUNT, role: ROLES.ADMIN });
  const users = readUsers();
  if (!users.some((user) => user.email === DEMO_ACCOUNT.email)) writeUsers([...users, admin]);
}

export function ensureDemoAdmin() {
  if (!pendingDemoSeed) {
    pendingDemoSeed = createDemoAdminIfMissing().finally(() => {
      pendingDemoSeed = null;
    });
  }
  return pendingDemoSeed;
}

function saveSession(userId, remember) {
  const ttl = remember ? REMEMBER_TTL : SESSION_TTL;
  clearSession();
  writeJSON(SESSION_KEY, { userId, expiresAt: Date.now() + ttl }, remember ? "local" : "session");
}

function clearSession() {
  removeKey(SESSION_KEY, "local");
  removeKey(SESSION_KEY, "session");
}

export function getCurrentUser() {
  const session = readJSON(SESSION_KEY, null, "local") ?? readJSON(SESSION_KEY, null, "session");
  if (!session || typeof session.expiresAt !== "number" || session.expiresAt < Date.now()) {
    if (session) clearSession();
    return null;
  }
  const user = readUsers().find((candidate) => candidate.id === session.userId);
  if (!user) {
    clearSession();
    return null;
  }
  return toPublicUser(user);
}

export async function login({ email, password, remember = false }) {
  if (Object.keys(validateLogin({ email, password })).length > 0) {
    throw new AppError("VALIDATION", "Completá un email válido y tu contraseña.");
  }
  await ensureDemoAdmin();

  const user = readUsers().find((candidate) => candidate.email === normalizeEmail(email));
  // Se calcula el hash aunque el usuario no exista, para no revelar qué emails están registrados.
  const hash = await hashPassword(password, user?.salt ?? DUMMY_SALT);
  if (!user || !safeEqual(hash, user.passwordHash)) {
    throw new AppError("INVALID_CREDENTIALS", "Email o contraseña incorrectos.");
  }

  saveSession(user.id, remember);
  return toPublicUser(user);
}

export async function register({ name, lastName, email, password }) {
  const errors = {
    name: name?.trim() ? null : "Campo obligatorio",
    lastName: lastName?.trim() ? null : "Campo obligatorio",
    email: validateEmail(email),
    password: validatePassword(password),
  };
  if (Object.values(errors).some(Boolean)) {
    throw new AppError("VALIDATION", "Revisá los datos ingresados.", errors);
  }
  await ensureDemoAdmin();

  if (readUsers().some((user) => user.email === normalizeEmail(email))) {
    throw new AppError("EMAIL_TAKEN", "Ya existe una cuenta con ese email.");
  }

  // El rol nunca lo elige quien se registra: toda cuenta nueva es "gestor".
  const user = await buildUser({ name, lastName, email, password, role: ROLES.MANAGER });
  writeUsers([...readUsers(), user]);
  saveSession(user.id, false);
  return toPublicUser(user);
}

export function logout() {
  clearSession();
}
