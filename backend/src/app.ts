import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import warehouseRoutes from "./routes/warehouse.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import inventoryRoutes from "./routes/inventory.routes";
import bomRoutes from "./routes/bom.routes";
import productionRoutes from "./routes/production.routes";
import dispatchRoutes from "./routes/dispatch.routes";
import customerRoutes from "./routes/customer.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import accountTransactionRoutes from "./routes/accountTransaction.routes";
import attendanceRoutes from "./routes/attendance.routes";
import attendanceShiftRoutes from "./routes/attendanceShift.routes";
import labourRoutes from "./routes/labour.routes";
import taskRoutes from "./routes/task.routes";
import accountPartyRoutes from "./routes/accountParty.routes";
import reminderRoutes from "./routes/reminder.routes";
import productionClientRoutes from "./routes/productionClient.routes";

const app = express();

app.use(cors());

app.use(express.json());

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (_req, res) => {
  res.send("Toy Hub Backend Running");
});

/* =========================================================
   AUTHENTICATION & USERS
========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

/* =========================================================
   MASTER DATA
========================================================= */

app.use("/api/categories", categoryRoutes);

app.use("/api/warehouses", warehouseRoutes);

app.use("/api/products", productRoutes);

/* =========================================================
   INVENTORY
========================================================= */

app.use("/api/inventory", inventoryRoutes);

/* =========================================================
   BOM & PRODUCTION
========================================================= */

app.use("/api/bom", bomRoutes);

app.use("/api/production", productionRoutes);

app.use("/api/production-clients", productionClientRoutes);

/* =========================================================
   DISPATCH
========================================================= */

app.use("/api/dispatch", dispatchRoutes);

/* =========================================================
   CRM
========================================================= */

app.use("/api/customers", customerRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/reminders", reminderRoutes);

/* =========================================================
   ACCOUNTS
========================================================= */

app.use("/api/accounts", accountTransactionRoutes);

app.use("/api/accounts/party", accountPartyRoutes);

app.use("/api/payments", paymentRoutes);

/* =========================================================
   ATTENDANCE & HR
========================================================= */

// Attendance records + employee self-service
app.use("/api/attendance", attendanceRoutes);

// Attendance shift management
app.use(
  "/api/attendance-shifts",
  attendanceShiftRoutes
);

// Labour management
app.use("/api/labour", labourRoutes);

/* =========================================================
   TASKS
========================================================= */

app.use("/api/tasks", taskRoutes);

export default app;