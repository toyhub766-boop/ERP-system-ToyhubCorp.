import api from "../../../services/api/axios";

export const getProductionClients =
  async () => {
    const response =
      await api.get(
        "/production-clients"
      );

    return response.data;
  };

export const getProductionClientById =
  async (id: string) => {
    const response =
      await api.get(
        `/production-clients/${id}`
      );

    return response.data;
  };

export const createProductionClient =
  async (data: any) => {
    const response =
      await api.post(
        "/production-clients",
        data
      );

    return response.data;
  };

export const updateProductionClient =
  async (
    id: string,
    data: any
  ) => {
    const response =
      await api.put(
        `/production-clients/${id}`,
        data
      );

    return response.data;
  };

export const deleteProductionClient =
  async (id: string) => {
    const response =
      await api.delete(
        `/production-clients/${id}`
      );

    return response.data;
  };