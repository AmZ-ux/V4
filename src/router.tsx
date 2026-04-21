import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute, RedirectByRole } from "@/components/auth/ProtectedRoute";
import { TabBarLayout } from "@/layouts/TabBarLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { PassengerPage } from "@/pages/PassengerPage";
import { PassengerPaymentPage } from "@/pages/PassengerPaymentPage";
import { PassengersPage } from "@/pages/PassengersPage";
import { PaymentsPage } from "@/pages/PaymentsPage";
import { PortalPage } from "@/pages/PortalPage";
import { SettingsPage } from "@/pages/SettingsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<RedirectByRole />} />

        <Route
          path="/passageiro"
          element={
            <ProtectedRoute role="passenger">
              <PassengerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passageiro/pagamento"
          element={
            <ProtectedRoute role="passenger">
              <PassengerPaymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute role="admin">
              <TabBarLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard-admin" element={<HomePage />} />
          <Route path="/passageiros" element={<PassengersPage />} />
          <Route path="/pagamentos" element={<PaymentsPage />} />
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
