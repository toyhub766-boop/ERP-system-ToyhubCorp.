import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginSelectorPage from "../../features/auth/pages/LoginSelectorPage";
import AdminLoginPage from "../../features/auth/pages/AdminLoginPage";
import StaffLoginPage from "../../features/auth/pages/StaffLoginPage";

import DashboardPage from "../../features/dashboard/pages/DashboardPage";

import UsersPage from "../../features/users/pages/UsersPage";

import ProtectedRoute from "../../components/ProtectedRoute";

import CategoryPage from "../../features/categories/pages/CategoryPage";

import WarehousePage from "../../features/warehouses/pages/WarehousePage";

import InventoryPage from "../../features/inventory/pages/InventoryPage";

import StaffInventoryPage from "../../features/staff/pages/StaffInventoryPage";

import StockInPage from "../../features/staff/pages/StockInPage";

import StockOutPage from "../../features/staff/pages/StockOutPage";

import TransactionsPage from "../../features/staff/pages/TransactionsPage";

import ProfilePage from "../../features/staff/pages/ProfilePage";

import InventoryDetailsPage from "../../features/inventory/pages/InventoryDetailsPage";

import BOMPage from "../../features/bom/pages/BOMPage";

import ProductionPage from "../../features/production/pages/ProductionPage";

import DispatchPage from "../../features/dispatch/pages/DispatchPage";

import ProductionStaffLayout from "../../features/productionStaff/layouts/ProductionStaffLayout";

import ProductionStaffBOMPage from "../../features/productionStaff/pages/BOMPage";

import ProductionStaffProductionPage from "../../features/productionStaff/pages/ProductionPage";

import ProductionStaffDispatchPage from "../../features/productionStaff/pages/DispatchPage";

import ProductionDashboardPage from "../../features/productionStaff/pages/DashboardPage";

import CRMPage from "../../features/crm/pages/CRMPage";

import CRMStaffPage from "../../features/crm/pages/CRMStaffPage";

import AccountsPage from "../../features/accounts/pages/AccountsPage";

import AccountantPage from "../../features/accountant/pages/AccountantPage";

import AttendancePage from "../../features/attendance/pages/attendancePage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Flow */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginSelectorPage />} />

        <Route path="/login/admin" element={<AdminLoginPage />} />

        <Route path="/login/staff" element={<StaffLoginPage />} />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <CategoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/warehouses"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <WarehousePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/:id"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <InventoryDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bom"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <BOMPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/production"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <ProductionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dispatch"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <DispatchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/crm"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <CRMPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <AccountsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={["FOUNDER"]}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        {/* Staff */}
        <Route
          path="/staff/dashboard"
          element={<Navigate to="/staff/inventory" replace />}
        />

        <Route
          path="/staff/inventory"
          element={
            <ProtectedRoute allowedRoles={["INVENTORY", "FOUNDER"]}>
              <StaffInventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/stock-in/:id"
          element={
            <ProtectedRoute allowedRoles={["INVENTORY", "FOUNDER"]}>
              <StockInPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/stock-out/:id"
          element={
            <ProtectedRoute allowedRoles={["INVENTORY", "FOUNDER"]}>
              <StockOutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/transactions"
          element={
            <ProtectedRoute allowedRoles={["INVENTORY", "FOUNDER"]}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "INVENTORY",
                "PRODUCTION",
                "CRM",
                "ACCOUNTANT",
                "ATTENDANCE/HR",
                "FOUNDER",
              ]}
            >
              <ProfilePage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/production-staff"
          element={
            <ProtectedRoute allowedRoles={["PRODUCTION"]}>
              <ProductionStaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProductionDashboardPage />} />

          <Route path="bom" element={<ProductionStaffBOMPage />} />

          <Route
            path="production"
            element={<ProductionStaffProductionPage />}
          />

          <Route path="dispatch" element={<ProductionStaffDispatchPage />} />
        </Route>

        <Route
          path="/crm-staff"
          element={
            <ProtectedRoute allowedRoles={["CRM"]}>
              <CRMStaffPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accountant"
          element={
            <ProtectedRoute allowedRoles={["ACCOUNTANT"]}>
              <AccountantPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
