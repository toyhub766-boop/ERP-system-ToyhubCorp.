import api from "../../../services/api/axios";

export const getLabours = async () => {
  const { data } = await api.get("/labour");
  return data;
};

export const createLabour = async (payload: any) => {
  const { data } = await api.post("/labour", payload);
  return data;
};

export const updateLabour = async (
  id: string,
  payload: any
) => {
  const { data } = await api.put(`/labour/${id}`, payload);
  return data;
};

export const deleteLabour = async (id: string) => {
  const { data } = await api.delete(`/labour/${id}`);
  return data;
};