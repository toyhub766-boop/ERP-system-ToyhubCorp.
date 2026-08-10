import api from "../../../services/api/axios";

export const getAttendance = async () => {
  const { data } = await api.get(
    "/attendance"
  );

  return data;
};

export const createAttendance = async (
  formData: FormData
) => {
  const { data } = await api.post(
    "/attendance",
    formData
  );

  return data;
};

export const updateAttendance = async (
  id: string,
  formData: FormData
) => {
  const { data } = await api.put(
    `/attendance/${id}`,
    formData
  );

  return data;
};

export const deleteAttendance = async (
  id: string
) => {
  const { data } = await api.delete(
    `/attendance/${id}`
  );

  return data;
};