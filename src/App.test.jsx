import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import { AppRoutes } from "./routes/AppRoutes";

vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="line-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
}));

const WAIT = { timeout: 10000 };

function renderApp(path = "/login") {
  return render(
    <AppProviders Router={MemoryRouter} routerProps={{ initialEntries: [path] }}>
      <AppRoutes />
    </AppProviders>,
  );
}

async function loginAsDemo() {
  fireEvent.click(await screen.findByRole("button", { name: "Probar con la cuenta demo" }));
  await screen.findByRole("heading", { name: "Resumen general" }, WAIT);
}

const goTo = (name) => fireEvent.click(within(screen.getByRole("navigation", { name: "Navegación principal" })).getByRole("link", { name }));

describe("aplicación completa", () => {
  it("muestra el resumen con indicadores y gráficos tras iniciar sesión", async () => {
    renderApp();
    await loginAsDemo();

    expect(await screen.findByText("Ingresos", { selector: "span" }, WAIT)).toBeInTheDocument();
    expect(screen.getByText("Ticket promedio")).toBeInTheDocument();
    expect(await screen.findByTestId("line-chart", {}, WAIT)).toBeInTheDocument();
    expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Últimos pedidos" })).toBeInTheDocument();
  }, 30000);

  it("navega a productos, pedidos, clientes y configuración", async () => {
    renderApp();
    await loginAsDemo();

    goTo("Productos");
    expect(await screen.findByRole("heading", { name: "Productos" }, WAIT)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nuevo producto" })).toBeInTheDocument();

    goTo("Pedidos");
    expect(await screen.findByRole("heading", { name: "Pedidos" }, WAIT)).toBeInTheDocument();

    goTo("Clientes");
    expect(await screen.findByRole("heading", { name: "Clientes" }, WAIT)).toBeInTheDocument();

    goTo("Configuración");
    expect(await screen.findByRole("heading", { name: "Configuración" }, WAIT)).toBeInTheDocument();
    expect(screen.getByText("admin@demo.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restablecer datos" })).toBeEnabled();
  }, 40000);

  it("abre el formulario de producto y muestra los errores de validación", async () => {
    renderApp();
    await loginAsDemo();
    goTo("Productos");

    fireEvent.click(await screen.findByRole("button", { name: "Nuevo producto" }, WAIT));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Crear producto" }));

    expect(await within(dialog).findAllByText("Campo obligatorio")).not.toHaveLength(0);
  }, 30000);

  it("cierra la sesión y vuelve al login", async () => {
    renderApp();
    await loginAsDemo();

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú de usuario" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Cerrar sesión" }));

    expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  }, 30000);

  it("muestra la página 404 en rutas inexistentes", async () => {
    renderApp("/ruta-inexistente");
    expect(await screen.findByRole("heading", { name: "No encontramos esa página" }, WAIT)).toBeInTheDocument();
  });
});
