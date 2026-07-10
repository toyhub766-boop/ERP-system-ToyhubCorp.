import api from "../../../services/api/axios";

export const getTasks = async () => {
  const { data } = await api.get("/tasks");
  return data;
};

export const createTask = async (payload: any) => {
  const { data } = await api.post("/tasks", payload);
  return data;
};

export const updateTask = async (
  id: string,
  payload: any
) => {
  const { data } = await api.put(
    `/tasks/${id}`,
    payload
  );

  return data;
};

export const deleteTask = async (id: string) => {
  const { data } = await api.delete(
    `/tasks/${id}`
  );

  return data;
};