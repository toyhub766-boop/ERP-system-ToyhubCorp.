import api from "../../../services/api/axios";


export const getOrders = async () => {
  const { data } = await api.get("/orders");
  return data;
};

export const getOrderById = async (
  id: string
) => {
  const { data } = await api.get(
    `/orders/${id}`
  );

  return data;
};

export const getOrdersByCustomer = async (
  customerId: string
) => {
  const { data } = await api.get(
    `/orders/customer/${customerId}`
  );

  return data;
};

export const createOrder = async (
  order: any
) => {
  const { data } = await api.post(
    "/orders",
    order
  );

  return data;
};

export const updateOrder = async (
  id: string,
  order: any
) => {
  const { data } = await api.put(
    `/orders/${id}`,
    order
  );

  return data;
};

export const deleteOrder = async (
  id: string
) => {
  const { data } = await api.delete(
    `/orders/${id}`
  );

  return data;
};