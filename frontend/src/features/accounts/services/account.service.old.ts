import api from "../../../services/api/axios";

export const getAccounts = async () => {
  const { data } = await api.get("/accounts");
  return data;
};

export const getSummary = async () => {
  const { data } = await api.get("/accounts/summary");
  return data;
};

export const createAccount = async (payload: any) => {
  const { data } = await api.post("/accounts", payload);
  return data;
};

export const updateAccount = async (
  id: string,
  payload: any
) => {
  const { data } = await api.put(`/accounts/${id}`, payload);
  return data;
};

export const deleteAccount = async (id: string) => {
  const { data } = await api.delete(`/accounts/${id}`);
  return data;
};