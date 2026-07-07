import api from "../../../services/api/axios";

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const createCategory = async (categoryData: any) => {
  const response = await api.post(
    "/categories",
    categoryData
  );
  return response.data;
};

export const updateCategory = async (
  id: string,
  categoryData: any
) => {
  const response = await api.put(
    `/categories/${id}`,
    categoryData
  );
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(
    `/categories/${id}`
  );
  return response.data;
};