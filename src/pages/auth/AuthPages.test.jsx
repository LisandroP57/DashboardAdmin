import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProviders } from "../../AppProviders";
import { ProtectedRoute, PublicOnlyRoute } from "../../routes/ProtectedRoute";
import { readJSON } from "../../services/storage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

function renderAt(path) {
  return render(
    <AppProviders Router={MemoryRouter} routerProps={{ initialEntries: [path] }}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route index element={<h1>Panel privado</h1>} />
        </Route>
      </Routes>
    </AppProviders>,
  );
}

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const WAIT = { timeout: 8000 };

describe("acceso a rutas", () => {
  it("redirige a login a quien no inició sesión", async () => {
    renderAt("/");
    expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.queryByText("Panel privado")).not.toBeInTheDocument();
  });
});

describe("LoginPage", () => {
  it("muestra los errores de validación sin llamar al servicio", async () => {
    renderAt("/login");
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findAllByText("Campo obligatorio")).toHaveLength(2);
  });

  it("informa credenciales incorrectas", async () => {
    renderAt("/login");
    type("Email", "nadie@example.com");
    type("Contraseña", "Incorrecta1");
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert", {}, WAIT)).toHaveTextContent("Email o contraseña incorrectos.");
  }, 20000);

  it("permite ingresar con la cuenta demo", async () => {
    renderAt("/login");
    fireEvent.click(screen.getByRole("button", { name: "Probar con la cuenta demo" }));
    expect(await screen.findByText("Panel privado", {}, WAIT)).toBeInTheDocument();
  }, 20000);

  it("muestra y oculta la contraseña", () => {
    renderAt("/login");
    const input = screen.getByLabelText("Contraseña");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(input).toHaveAttribute("type", "text");
  });
});

describe("RegisterPage", () => {
  it("valida contraseñas distintas y términos sin aceptar", async () => {
    renderAt("/register");
    type("Contraseña", "Clave1234");
    type("Repetir contraseña", "Otra12345");
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Las contraseñas no coinciden")).toBeInTheDocument();
    expect(screen.getByText("Debés aceptar los términos y condiciones")).toBeInTheDocument();
  });

  it("crea la cuenta e ingresa al panel", async () => {
    renderAt("/register");
    type("Nombre", "Ana");
    type("Apellido", "Pérez");
    type("Email", "ana@example.com");
    type("Contraseña", "Clave1234");
    type("Repetir contraseña", "Clave1234");
    fireEvent.click(screen.getByLabelText("Acepto los términos y condiciones"));
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Panel privado", {}, WAIT)).toBeInTheDocument();
    expect(readJSON("users").some((u) => u.email === "ana@example.com")).toBe(true);
  }, 20000);
});
