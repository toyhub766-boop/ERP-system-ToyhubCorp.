import api from "../../../services/api/axios";

export interface AttendanceShift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  graceMinutes: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceShiftPayload {
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  graceMinutes: number;
  status?: "ACTIVE" | "INACTIVE";
}

export const getAttendanceShifts = async () => {
  const { data } = await api.get("/attendance-shifts");
  return data;
};

export const getActiveAttendanceShifts = async () => {
  const { data } = await api.get(
    "/attendance-shifts/active"
  );
  return data;
};

export const getAttendanceShift = async (
  id: string
) => {
  const { data } = await api.get(
    `/attendance-shifts/${id}`
  );
  return data;
};

export const createAttendanceShift = async (
  payload: AttendanceShiftPayload
) => {
  const { data } = await api.post(
    "/attendance-shifts",
    payload
  );
  return data;
};

export const updateAttendanceShift = async (
  id: string,
  payload: Partial<AttendanceShiftPayload>
) => {
  const { data } = await api.put(
    `/attendance-shifts/${id}`,
    payload
  );
  return data;
};

export const deleteAttendanceShift = async (
  id: string
) => {
  const { data } = await api.delete(
    `/attendance-shifts/${id}`
  );
  return data;
};