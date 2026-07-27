import api from "../../../services/api/axios";
import type { CustomerNote } from "../types/customer.types";

export const addCustomerNote = async (
  customerId: string,
  note: Omit<
    CustomerNote,
    "_id" | "addedBy" | "createdAt"
  >
) => {
  const { data } = await api.post(
    `/customers/${customerId}/notes`,
    note
  );

  return data;
};

export const updateCustomerNote = async (
  customerId: string,
  noteId: string,
  note: Partial<CustomerNote>
) => {
  const { data } = await api.put(
    `/customers/${customerId}/notes/${noteId}`,
    note
  );

  return data;
};

export const deleteCustomerNote = async (
  customerId: string,
  noteId: string
) => {
  const { data } = await api.delete(
    `/customers/${customerId}/notes/${noteId}`
  );

  return data;
};