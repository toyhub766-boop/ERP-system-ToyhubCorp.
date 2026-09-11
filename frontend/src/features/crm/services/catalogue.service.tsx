import api from "../../../services/api/axios";

export const getCatalogues = async () => {
  const response = await api.get("/catalogue");
  return response.data;
};

export const getCatalogueById = async (
  id: string
) => {
  const response = await api.get(`/catalogue/${id}`);
  return response.data;
};

export const createCatalogue = async (
  formData: FormData
) => {
  const response = await api.post(
    "/catalogue",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const updateCatalogue = async (
  id: string,
  formData: FormData
) => {
  const response = await api.put(
    `/catalogue/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteCatalogue = async (
  id: string
) => {
  const response = await api.delete(
    `/catalogue/${id}`
  );

  return response.data;
};