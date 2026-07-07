import axios from "../../../services/api/axios";

export const getWarehouses = async () => {
  const response = await axios.get("/warehouses");
  return response.data;
};

export const createWarehouse = async (warehouseData: any) => {
  const response = await axios.post(
    "/warehouses",
    warehouseData
  );

  return response.data;
};

export const updateWarehouse = async (
  id: string,
  warehouseData: any
) => {
  const response = await axios.put(
    `/warehouses/${id}`,
    warehouseData
  );

  return response.data;
};

export const deleteWarehouse = async (
  id: string
) => {
  const response = await axios.delete(
    `/warehouses/${id}`
  );

  return response.data;
};