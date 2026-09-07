import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import SessionRestorer from "../../features/auth/components/SessionRestorer";
import ProtectedRoute from "../../components/ProtectedRoute";

/* Auth */
import LoginSelectorPage from "../../features/auth/pages/LoginSelectorPage";
import AdminLoginPage from "../../features/auth/pages/AdminLoginPage";
import StaffLoginPage from "../../features/auth/pages/StaffLoginPage";

/* Dashboard */
import DashboardPage from "../../features/dashboard/pages/DashboardPage";

/* Users */
import UsersPage from "../../features/users/pages/UsersPage";

/* Master Data */
import CategoryPage from "../../features/categories/pages/CategoryPage";
import WarehousePage from "../../features/warehouses/pages/WarehousePage";

/* Inventory */
import InventoryPage from "../../features/inventory/pages/InventoryPage";
import InventoryDetailsPage from "../../features/inventory/pages/InventoryDetailsPage";

/* Production */
import BOMPage from "../../features/bom/pages/BOMPage";
import ProductionPage from "../../features/production/pages/ProductionPage";
import DispatchPage from "../../features/dispatch/pages/DispatchPage";

/* Inventory Staff */
import StaffInventoryPage from "../../features/staff/pages/StaffInventoryPage";
import StockInPage from "../../features/staff/pages/StockInPage";
import StockOutPage from "../../features/staff/pages/StockOutPage";
import TransactionsPage from "../../features/staff/pages/TransactionsPage";
import ProfilePage from "../../features/staff/pages/ProfilePage";

/* Production Staff */
import ProductionStaffLayout from "../../features/productionStaff/layouts/ProductionStaffLayout";
import ProductionDashboardPage from "../../features/productionStaff/pages/DashboardPage";
import ProductionStaffBOMPage from "../../features/productionStaff/pages/BOMPage";
import ProductionStaffProductionPage from "../../features/productionStaff/pages/ProductionPage";
import ProductionStaffDispatchPage from "../../features/productionStaff/pages/DispatchPage";

/* CRM */
import CRMPage from "../../features/crm/pages/CRMPage";
import CRMStaffPage from "../../features/crm/pages/CRMStaffPage";
import CRMStaffLayout from "../../features/crm/components/CRMStaffLayout";

/* Accounts */
import AccountsPage from "../../features/accounts/pages/AccountsPage";

/* Accountant */
import AccountantPage from "../../features/accountant/pages/AccountantPage";
import AccountantLayout from "../../features/accountant/layouts/AccountantLayout";

/* Attendance */
import AttendancePage from "../../features/attendance/pages/attendancePage";
import AttendanceShiftPage from "../../features/attendance/pages/AttendanceShiftPage";
import AttendancePunchPage from "../../features/attendance/pages/AttendancePunchPage";

/* Tasks */
import TaskPage from "../../features/tasks/pages/TaskPage";
import MyTasksPage from "../../features/tasks/pages/MyTasksPage";

/* Reports */
import ReportsPage from "../../features/reports/pages/ReportsPage";

/* Reminders */
import ReminderPage from "../../features/reminders/pages/ReminderPage";

/* HR Layout */
import HRPage from "../../features/hr/pages/HRPage";
import HRLayout from "../../features/hr/layouts/HRLayout";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <SessionRestorer />

      <Routes>

        {/* =========================
            AUTHENTICATION
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<LoginSelectorPage />}
        />

        <Route
          path="/login/admin"
          element={<AdminLoginPage />}
        />

        <Route
          path="/login/staff"
          element={<StaffLoginPage />}
        />

        {/* =========================
            FOUNDER / ADMIN
        ========================= */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <CategoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/warehouses"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <WarehousePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/:id"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <InventoryDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bom"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <BOMPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/production"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <ProductionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dispatch"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <DispatchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/crm"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <CRMPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <AccountsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tasks"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <TaskPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reminders"
          element={
            <ProtectedRoute
              allowedRoles={["FOUNDER"]}
            >
              <ReminderPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            ATTENDANCE MANAGEMENT
        ========================= */}

        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute
              allowedRoles={[
                "FOUNDER",
                "ATTENDANCE/HR",
              ]}
            >
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/hr"
          element={
            <ProtectedRoute
              allowedRoles={[
                "FOUNDER",
                "ATTENDANCE/HR",
              ]}
            >
              <HRPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/hr/shifts"
          element={
            <ProtectedRoute
              allowedRoles={[
                "FOUNDER",
                "ATTENDANCE/HR",
              ]}
            >
              <HRLayout>
                <AttendanceShiftPage />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/punch"
          element={
            <ProtectedRoute
              allowedRoles={[
                "FOUNDER",
                "INVENTORY",
                "PRODUCTION",
                "CRM",
                "ACCOUNTANT",
                "ATTENDANCE/HR",
              ]}
            >
              <AttendancePunchPage />
            </ProtectedRoute>
          }
        />
        {/* =========================
            HR MY TASKS
        ========================= */}

        <Route
          path="/attendance/my-tasks"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ATTENDANCE/HR",
              ]}
            >
              <HRLayout>
                <MyTasksPage />
              </HRLayout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            INVENTORY STAFF
        ========================= */}

        <Route
          path="/staff/dashboard"
          element={
            <Navigate
              to="/staff/inventory"
              replace
            />
          }
        />

        <Route
          path="/staff/inventory"
          element={
            <ProtectedRoute
              allowedRoles={[
                "INVENTORY",
                "FOUNDER",
              ]}
            >
              <StaffInventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/stock-in/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "INVENTORY",
                "FOUNDER",
              ]}
            >
              <StockInPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/stock-out/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "INVENTORY",
                "FOUNDER",
              ]}
            >
              <StockOutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/transactions"
          element={
            <ProtectedRoute
              allowedRoles={[
                "INVENTORY",
                "FOUNDER",
              ]}
            >
              <TransactionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "FOUNDER",
                "INVENTORY",
                "PRODUCTION",
                "CRM",
                "ACCOUNTANT",
                "ATTENDANCE/HR",
              ]}
            >
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/my-tasks"
          element={
            <ProtectedRoute
              allowedRoles={["INVENTORY"]}
            >
              <MyTasksPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            PRODUCTION STAFF
        ========================= */}

        <Route
          path="/production-staff"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCTION"]}
            >
              <ProductionStaffLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProductionDashboardPage />
            }
          />

          <Route
            path="bom"
            element={
              <ProductionStaffBOMPage />
            }
          />

          <Route
            path="production"
            element={
              <ProductionStaffProductionPage />
            }
          />

          <Route
            path="dispatch"
            element={
              <ProductionStaffDispatchPage />
            }
          />

          <Route
            path="my-tasks"
            element={
              <MyTasksPage />
            }
          />
        </Route>

        {/* =========================
            CRM STAFF
        ========================= */}

        <Route
          path="/crm-staff"
          element={
            <ProtectedRoute
              allowedRoles={["CRM"]}
            >
              <CRMStaffPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-staff/my-tasks"
          element={
            <ProtectedRoute
              allowedRoles={["CRM"]}
            >
              <CRMStaffLayout>
                <MyTasksPage />
              </CRMStaffLayout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            ACCOUNTANT
        ========================= */}

        <Route
          path="/accountant"
          element={
            <ProtectedRoute
              allowedRoles={["ACCOUNTANT"]}
            >
              <AccountantPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accountant/my-tasks"
          element={
            <ProtectedRoute
              allowedRoles={["ACCOUNTANT"]}
            >
              <AccountantLayout>
                <MyTasksPage />
              </AccountantLayout>
            </ProtectedRoute>
          }
        />

        {/* =========================
            FALLBACK
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;