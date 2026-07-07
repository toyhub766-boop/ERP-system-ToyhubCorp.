import api from "../../../services/api/axios";

export const getCustomers = async () => {
  const { data } = await api.get("/customers");
  return data;
};

export const getCustomerById = async (
  id: string
) => {
  const { data } = await api.get(
    `/customers/${id}`
  );

  return data;
};

export const createCustomer = async (
  customer: any
) => {
  const { data } = await api.post(
    "/customers",
    customer
  );

  return data;
};

export const updateCustomer = async (
  id: string,
  customer: any
) => {
  const { data } = await api.put(
    `/customers/${id}`,
    customer
  );

  return data;
};

export const deleteCustomer = async (
  id: string
) => {
  const { data } = await api.delete(
    `/customers/${id}`
  );

  return data;
};