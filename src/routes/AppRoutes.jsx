import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingState } from "../components/StateViews";
import { ROUTES } from "../config/app";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute, PublicOnlyRoute } from "./ProtectedRoute";

// Cada pantalla se descarga solo cuando se visita (code splitting).
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const ProductsPage = lazy(() => import("../pages/products/ProductsPage"));
const OrdersPage = lazy(() => import("../pages/orders/OrdersPage"));
const CustomersPage = lazy(() => import("../pages/customers/CustomersPage"));
const SettingsPage = lazy(() => import("../pages/settings/SettingsPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState minHeight={400} />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path={ROUTES.products} element={<ProductsPage />} />
            <Route path={ROUTES.orders} element={<OrdersPage />} />
            <Route path={ROUTES.customers} element={<CustomersPage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
