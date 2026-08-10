import api from "../../../services/api/axios";

export const getProductions =
  async () => {
    const response =
      await api.get("/production");

    return response.data;
  };

export const getProductionById =
  async (id: string) => {
    const response =
      await api.get(
        `/production/${id}`
      );

    return response.data;
  };

export const createProduction =
  async (data: any) => {
    const response =
      await api.post(
        "/production",
        data
      );

    return response.data;
  };

export const updateProduction =
  async (
    id: string,
    data: any
  ) => {
    const response =
      await api.put(
        `/production/${id}`,
        data
      );

    return response.data;
  };

export const updateProductionItem =
  async (
    productionId: string,
    itemId: string,
    data: any
  ) => {
    const response =
      await api.put(
        `/production/${productionId}/items/${itemId}`,
        data
      );

    return response.data;
  };

export const deleteProduction =
  async (id: string) => {
    const response =
      await api.delete(
        `/production/${id}`
      );

    return response.data;
  };

export const calculateProduction =
  async (data: any) => {
    const response =
      await api.post(
        "/production/calculate",
        data
      );

    return response.data;
  };

export const getMaterialConsumption =
  async (
    productionId: string
  ) => {
    const response =
      await api.get(
        `/production/${productionId}/material-consumption`
      );

    return response.data;
  };