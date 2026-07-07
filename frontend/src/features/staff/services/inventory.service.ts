import api from "../../../services/api/axios";

export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

export const stockIn = async (data: any) => {
  const res = await api.post(
    "/inventory/stock-in",
    data
  );
  return res.data;
};

export const stockOut = async (data: any) => {
  const res = await api.post(
    "/inventory/stock-out",
    data
  );
  return res.data;
};

export const getTransactions = async () => {
  const res = await api.get(
    "/inventory/transactions"
  );
  return res.data;
};

export const getProductTransactions = async (
  id: string
) => {
  const response = await api.get(
    `/inventory/transactions/product/${id}`
  );

  return response.data;
};