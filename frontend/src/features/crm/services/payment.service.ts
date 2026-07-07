import api from "../../../services/api/axios";

export const getPayments = async () => {
  const { data } = await api.get("/payments");
  return data;
};

export const getPaymentById = async (
  id: string
) => {
  const { data } = await api.get(
    `/payments/${id}`
  );

  return data;
};

export const getPaymentsByCustomer = async (
  customerId: string
) => {
  const { data } = await api.get(
    `/payments/customer/${customerId}`
  );

  return data;
};

export const createPayment = async (
  payment: any
) => {
  const { data } = await api.post(
    "/payments",
    payment
  );

  return data;
};

export const updatePayment = async (
  id: string,
  payment: any
) => {
  const { data } = await api.put(
    `/payments/${id}`,
    payment
  );

  return data;
};

export const deletePayment = async (
  id: string
) => {
  const { data } = await api.delete(
    `/payments/${id}`
  );

  return data;
};