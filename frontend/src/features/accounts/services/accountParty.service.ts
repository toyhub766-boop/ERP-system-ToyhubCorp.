import api from "../../../services/api/axios";

export const getParties = async () => {
  const res = await api.get("/accounts/party");
  return res.data;
};

export const getParty = async (
  id: string
) => {
  const res = await api.get(
    `/accounts/party/${id}`
  );

  return res.data;
};

export const createParty = async (
  data: any
) => {
  const res = await api.post(
    "/accounts/party",
    data
  );

  return res.data;
};

export const updateParty = async (
  id: string,
  data: any
) => {
  const res = await api.put(
    `/accounts/party/${id}`,
    data
  );

  return res.data;
};

export const updatePartyDueDate = async (
  id: string,
  dueDate: string | null
) => {
  const res = await api.patch(
    `/accounts/party/${id}/due-date`,
    {
      dueDate,
    }
  );

  return res.data;
};

export const deleteParty = async (
  id: string
) => {
  const res = await api.delete(
    `/accounts/party/${id}`
  );

  return res.data;
};