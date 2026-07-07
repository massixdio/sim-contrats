import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Auth/Login";
import { Dashboard } from "@/pages/Dashboard";
import { ClientsPage } from "@/pages/Clients/ClientsPage";
import { InsurersPage } from "@/pages/Insurers/InsurersPage";
import { ContractsPage } from "@/pages/Contracts/ContractsPage";
import { ContractDetailPage } from "@/pages/Contracts/ContractDetailPage";
import { PaymentsPage } from "@/pages/Payments/PaymentsPage";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/insurers" element={<InsurersPage />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/contracts/:id" element={<ContractDetailPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
