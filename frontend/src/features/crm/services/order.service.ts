import api from "../../../services/api/axios";

// ============================================================
// GET ALL CRM ORDERS
// ============================================================

export const getOrders = async () => {
  const { data } = await api.get("/orders");

  return data;
};

// ============================================================
// GET SINGLE CRM ORDER
// ============================================================

export const getOrderById = async (
  id: string
) => {
  const { data } = await api.get(
    `/orders/${id}`
  );

  return data;
};

// ============================================================
// GET ORDERS BY CUSTOMER
// ============================================================

export const getOrdersByCustomer = async (
  customerId: string
) => {
  const { data } = await api.get(
    `/orders/customer/${customerId}`
  );

  return data;
};

// ============================================================
// CREATE CRM ORDER
// ============================================================

export const createOrder = async (
  order: any
) => {
  const { data } = await api.post(
    "/orders",
    order
  );

  return data;
};

// ============================================================
// UPDATE CRM ORDER
// ============================================================

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

// ============================================================
// SEND CRM ORDER TO PRODUCTION
// ============================================================

export const sendOrderToProduction = async (
  id: string
) => {
  const { data } = await api.post(
    `/orders/${id}/send-to-production`
  );

  return data;
};

// ============================================================
// DELETE SINGLE CRM ORDER
// ============================================================

export const deleteOrder = async (
  id: string
) => {
  const { data } = await api.delete(
    `/orders/${id}`
  );

  return data;
};

// ============================================================
// DELETE MULTIPLE CRM ORDERS
// ============================================================

export const deleteOrdersBulk = async (
  ids: string[]
) => {
  const { data } = await api.delete(
    "/orders/bulk",
    {
      data: { ids },
    }
  );

  return data;
};