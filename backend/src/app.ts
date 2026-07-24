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

import labourRoutes from "./routes/labour.routes";

import taskRoutes from "./routes/task.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Toy Hub Backend Running");
});

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/warehouses", warehouseRoutes);

app.use("/api/products", productRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/bom", bomRoutes);

app.use("/api/production", productionRoutes);

app.use("/api/dispatch", dispatchRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/accounts", accountTransactionRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/labour", labourRoutes);

app.use("/api/tasks", taskRoutes);


export default app;
