import api from "../../../services/api/axios";


export const getPartyLedger = async (
  partyId: string
) => {
  const res = await api.get(
    `/accounts/ledger/${partyId}`
  );

  return res.data;
};



export const createTransaction = async (
  data: FormData
) => {
  const res = await api.post(
    "/accounts/transaction",
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const updateTransaction = async (
  id: string,
  data: FormData
) => {
  const res = await api.put(
    `/accounts/transaction/${id}`,
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
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