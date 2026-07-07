import api from "../../../services/api/axios";

export const getBOMs = async () => {
  const response = await api.get("/bom");
  return response.data;
};

export const getBOMById = async (id: string) => {
  const response = await api.get(`/bom/${id}`);
  return response.data;
};

export const createBOM = async (data: any) => {
  const response = await api.post("/bom", data);
  return response.data;
};

export const updateBOM = async (
  id: string,
  data: any
) => {
  const response = await api.put(`/bom/${id}`, data);
  return response.data;
};

export const deleteBOM = async (id: string) => {
  const response = await api.delete(`/bom/${id}`);
  return response.data;
};