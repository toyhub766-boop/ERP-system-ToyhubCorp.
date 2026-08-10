import api from "../../../services/api/axios";
import type { CustomerForm } from "../types/customer.types";

export const getCustomers = async () => {
  const { data } = await api.get("/customers");
  return data;
};

export const getCustomerById = async (id: string) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

export const createCustomer = async (
  customer: CustomerForm
) => {
  const { data } = await api.post(
    "/customers",
    customer
  );

  return data;
};

export const updateCustomer = async (
  id: string,
  customer: CustomerForm
) => {
  const { data } = await api.put(
    `/customers/${id}`,
    customer
  );

  return data;
};

export const deleteCustomer = async (id: string) => {
  const { data } = await api.delete(
    `/customers/${id}`
  );

  return data;
};

export const getSalesPipeline = async () => {
  const response = await api.get("/customer/pipeline");

  return response.data;
};

export const updateSalesPipeline = async (
  customerId: string,
  data: {
    stage?: string;

    salespersonName?: string;
    salespersonPhone?: string;

    assignedDate?: string | null;

    leadSource?: string;

    lastContactDate?: string | null;
    nextFollowUpDate?: string | null;
    expectedCloseDate?: string | null;

    pipelineNotes?: string;
  }
) => {
  const response = await api.put(
    `/customer/${customerId}/pipeline`,
    data
  );

  return response.data;
};