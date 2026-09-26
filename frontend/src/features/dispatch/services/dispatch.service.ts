import api from "../../../services/api/axios";

export const getDispatches = async () => {
  const response = await api.get("/dispatch");
  return response.data;
};

export const getDispatchById = async (id: string) => {
  const response = await api.get(`/dispatch/${id}`);
  return response.data;
};

export const createDispatch = async (data: any) => {
  const response = await api.post("/dispatch", data);
  return response.data;
};

export const updateDispatch = async (id: string, data: any) => {
  const response = await api.put(`/dispatch/${id}`, data);
  return response.data;
};

export const getDispatchBalanceForItem = async (
  productionId: string,
  productionItemId: string,
) => {
  const response = await api.get(
    `/dispatch/production/${productionId}/item/${productionItemId}/balance`,
  );
  return response.data;
};

export const getDispatchesByProductionItem = async (
  productionId: string,
  productionItemId: string,
) => {
  const response = await api.get(
    `/dispatch/production/${productionId}/item/${productionItemId}/history`,
  );
  return response.data;
};
