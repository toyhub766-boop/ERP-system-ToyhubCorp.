import api from "../../../services/api/axios";

export const getAttendance = async () => {
  const { data } = await api.get("/attendance");
  return data;
};

export const createAttendance = async (payload: any) => {
  const { data } = await api.post("/attendance", payload);
  return data;
};

export const updateAttendance = async (
  id: string,
  payload: any
) => {
  const { data } = await api.put(`/attendance/${id}`, payload);
  return data;
};

export const deleteAttendance = async (id: string) => {
  const { data } = await api.delete(`/attendance/${id}`);
  return data;
};