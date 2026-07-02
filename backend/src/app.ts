import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import warehouseRoutes from "./routes/warehouse.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import inventoryRoutes from "./routes/inventory.routes";
import bomRoutes from "./routes/bom.routes";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Toy Hub Backend Running");
});
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use(
  "/api/warehouses",
  warehouseRoutes
);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/bom", bomRoutes);
export default app;