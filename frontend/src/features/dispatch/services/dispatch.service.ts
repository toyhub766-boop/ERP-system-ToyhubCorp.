import api from "../../../services/api/axios";

export const getDispatches = async () => {
  const response = await api.get("/dispatch");
  return response.data;
};

export const createDispatch = async (data: any) => {
  const response = await api.post("/dispatch", data);
  return response.data;
};

export const updateDispatch = async (
  id: string,
  data: any
) => {
  const response = await api.put(
    `/dispatch/${id}`,
    data
  );

  return response.data;
};