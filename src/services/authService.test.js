import { ensureDemoAdmin, getCurrentUser, login, logout, register } from "./authService";
import { readJSON, writeJSON } from "./storage";
import { DEMO_ACCOUNT } from "../config/app";

const newUser = {
  name: "Ana",
  lastName: "Pérez",
  email: "ana@example.com",
  password: "Clave1234",
};

describe("authService", () => {
  it("registra un usuario, inicia sesión y no expone datos sensibles", async () => {
    const user = await register(newUser);

    expect(user).toMatchObject({ name: "Ana", email: "ana@example.com", role: "manager" });
    expect(user).not.toHaveProperty("passwordHash");
    expect(user).not.toHaveProperty("salt");
    expect(getCurrentUser()).toMatchObject({ email: "ana@example.com" });
  }, 20000);

  it("nunca guarda la contraseña en texto plano", async () => {
    await register(newUser);
    const raw = JSON.stringify(readJSON("users"));
    expect(raw).not.toContain(newUser.password);
  }, 20000);

  it("normaliza el email y rechaza duplicados", async () => {
    await register(newUser);
    await expect(register({ ...newUser, email: "  ANA@example.com " })).rejects.toMatchObject({
      code: "EMAIL_TAKEN",
    });
  }, 20000);

  it("rechaza contraseñas débiles y datos incompletos", async () => {
    await expect(register({ ...newUser, password: "corta" })).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(register({ ...newUser, name: "" })).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("no deja elegir el rol al registrarse", async () => {
    const user = await register({ ...newUser, role: "admin" });
    expect(user.role).toBe("manager");
  }, 20000);

  it("inicia sesión con credenciales correctas y falla con incorrectas", async () => {
    await register(newUser);
    logout();
    expect(getCurrentUser()).toBeNull();

    await expect(login({ email: newUser.email, password: "Incorrecta1" })).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    await expect(login({ email: "noexiste@example.com", password: "Clave1234" })).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      message: "Email o contraseña incorrectos.",
    });

    const user = await login({ email: "ANA@example.com", password: newUser.password });
    expect(user.email).toBe("ana@example.com");
  }, 30000);

  it("crea la cuenta demo de administrador", async () => {
    await ensureDemoAdmin();
    const user = await login({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password });
    expect(user.role).toBe("admin");
  }, 20000);

  it("no duplica la cuenta demo si se pide varias veces a la vez", async () => {
    await Promise.all([ensureDemoAdmin(), ensureDemoAdmin(), ensureDemoAdmin()]);
    const demos = readJSON("users", []).filter((u) => u.email === DEMO_ACCOUNT.email);
    expect(demos).toHaveLength(1);
  }, 20000);

  it('"Mantener sesión" usa localStorage; sin marcar usa sessionStorage', async () => {
    await register(newUser);
    logout();

    await login({ email: newUser.email, password: newUser.password, remember: false });
    expect(readJSON("session", null, "session")).not.toBeNull();
    expect(readJSON("session", null, "local")).toBeNull();

    await login({ email: newUser.email, password: newUser.password, remember: true });
    expect(readJSON("session", null, "local")).not.toBeNull();
    expect(readJSON("session", null, "session")).toBeNull();
  }, 30000);

  it("descarta las sesiones vencidas", async () => {
    const user = await register(newUser);
    writeJSON("session", { userId: user.id, expiresAt: Date.now() - 1000 }, "session");
    expect(getCurrentUser()).toBeNull();
    expect(readJSON("session", null, "session")).toBeNull();
  }, 20000);
});
