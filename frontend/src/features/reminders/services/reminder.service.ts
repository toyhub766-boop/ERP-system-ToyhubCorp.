import api from "../../../services/api/axios";

// =========================
// GET
// =========================

export const getReminders = async () => {
  const res = await api.get("/reminders");
  return res.data;
};

// =========================
// CREATE
// =========================

export const createReminder = async (
  data: any
) => {
  const res = await api.post(
    "/reminders",
    data
  );

  return res.data;
};

// =========================
// UPDATE
// =========================

export const updateReminder = async (
  id: string,
  data: any
) => {
  const res = await api.put(
    `/reminders/${id}`,
    data
  );

  return res.data;
};

// =========================
// COMPLETE
// =========================

export const completeReminder = async (
  id: string
) => {
  const res = await api.patch(
    `/reminders/${id}/complete`
  );

  return res.data;
};

// =========================
// DELETE
// =========================

export const deleteReminder = async (
  id: string
) => {
  const res = await api.delete(
    `/reminders/${id}`
  );

  return res.data;
};