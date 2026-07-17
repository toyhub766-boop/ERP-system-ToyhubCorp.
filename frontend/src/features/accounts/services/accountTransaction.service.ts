import api from "../../../services/api/axios";
export const getParties = async () => {
  const res = await api.get("/accounts/parties");
  return res.data;
};

export const getCustomerLedger = async (
  customerId: string
) => {
  const res = await api.get(
    `/accounts/ledger/${customerId}`
  );
  return res.data;
};

export const createTransaction = async (
  data: any
) => {
  const res = await api.post(
    "/accounts/transaction",
    data
  );
  return res.data;
};

export const updateTransaction = async (
  id: string,
  data: any
) => {
  const res = await api.put(
    `/accounts/transaction/${id}`,
    data
  );
  return res.data;
};

export const deleteTransaction = async (
  id: string
) => {
  const res = await api.delete(
    `/accounts/transaction/${id}`
  );
  return res.data;
};