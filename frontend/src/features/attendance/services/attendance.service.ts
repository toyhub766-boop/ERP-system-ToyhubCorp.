import api from "../../../services/api/axios";

export const getAttendance = async () => {
  const { data } = await api.get("/attendance");
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

export const getMyTodayAttendance = async () => {
  const { data } = await api.get(
    "/attendance/my/today"
  );

  return data;
};

export type AttendanceEventType =
  | "CHECK_IN"
  | "BREAK_OUT"
  | "BREAK_IN"
  | "CHECK_OUT";

export const registerAttendanceEvent = async (
  eventType: AttendanceEventType,
  photo?: File,
  note?: string
) => {
  const formData = new FormData();

  formData.append(
    "eventType",
    eventType
  );

  if (photo) {
    formData.append(
      "photo",
      photo
    );
  }

  if (note) {
    formData.append(
      "note",
      note
    );
  }

  const { data } = await api.post(
    "/attendance/my/event",
    formData
  );

  return data;
};

export const punchIn = async (
  selfie: File
) => {
  return registerAttendanceEvent(
    "CHECK_IN",
    selfie
  );
};

export const punchOut = async (
  selfie: File
) => {
  return registerAttendanceEvent(
    "CHECK_OUT",
    selfie
  );
};

export const breakOut = async () => {
  return registerAttendanceEvent(
    "BREAK_OUT"
  );
};

export const breakIn = async () => {
  return registerAttendanceEvent(
    "BREAK_IN"
  );
};

export const getAttendanceCalculations =
  async (id: string) => {
    const { data } = await api.get(
      `/attendance/${id}/calculations`
    );

    return data;
  };


export const registerLabourAttendanceEvent = async (
  labourId: string,
  eventType:
    | "CHECK_IN"
    | "BREAK_OUT"
    | "BREAK_IN"
    | "CHECK_OUT",
  photo?: File,
  note?: string
) => {
  const formData = new FormData();

  formData.append("eventType", eventType);

  if (photo) {
    formData.append("photo", photo);
  }

  if (note) {
    formData.append("note", note);
  }

  const { data } = await api.post(
    `/attendance/labour/${labourId}/event`,
    formData
  );

  return data;
};