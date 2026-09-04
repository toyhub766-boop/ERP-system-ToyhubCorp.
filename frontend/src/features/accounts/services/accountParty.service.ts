import api from "../../../services/api/axios";

export const getParties = async () => {
  const res = await api.get("/accounts/party");
  return res.data;
};

export const getParty = async (
  id: string
) => {
  const res = await api.get(
    `/accounts/party/${id}`
  );

  return res.data;
};

export const createParty = async (
  data: any
) => {
  const res = await api.post(
    "/accounts/party",
    data
  );

  return res.data;
};

export const updateParty = async (
  id: string,
  data: any
) => {
  const res = await api.put(
    `/accounts/party/${id}`,
    data
  );

  return res.data;
};

export const updatePartyDueDate = async (
  id: string,
  dueDate: string | null
) => {
  const res = await api.patch(
    `/accounts/party/${id}/due-date`,
    {
      dueDate,
    }
  );

  return res.data;
};

export const deleteParty = async (
  id: string
) => {
  const res = await api.delete(
    `/accounts/party/${id}`
  );

  return res.data;
};

export const updatePartySalespeople = async (
  partyId: string,
  assignedSalespeople: string[]
) => {
  const res = await api.patch(
    `/accounts/party/${partyId}/salespeople`,
    {
      assignedSalespeople,
    }
  );

  return res.data;
};

export interface PartyPipelineUpdate {
  crmPipeline?: string;
  crmStage?: string;
  crmAssociation?: string;
}

export const updatePartyPipeline = async (
  partyId: string,
  data: PartyPipelineUpdate
) => {
  const response =
    await api.patch(
      `/accounts/party/${partyId}/pipeline`,
      data
    );

  return response.data;
};

export interface PartyNote {
  _id?: string;

  title?: string;

  note: string;

  type:
    | "GENERAL"
    | "PAYMENT"
    | "MEETING"
    | "FOLLOW_UP"
    | "COMPLAINT"
    | "PRODUCT";

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  reminderDate?: string;

  completed: boolean;

  addedBy?: {
    _id: string;
    name: string;
    employeeId?: string;
    role?: string;
  };

  createdAt?: string;
}

export const addPartyNote = async (
  partyId: string,
  note: Omit<
    PartyNote,
    "_id" |
    "addedBy" |
    "createdAt"
  >
) => {
  const { data } =
    await api.post(
      `/accounts/party/${partyId}/notes`,
      note
    );

  return data;
};

export const updatePartyNote = async (
  partyId: string,
  noteId: string,
  note: Partial<PartyNote>
) => {
  const { data } =
    await api.put(
      `/accounts/party/${partyId}/notes/${noteId}`,
      note
    );

  return data;
};

export const deletePartyNote = async (
  partyId: string,
  noteId: string
) => {
  const { data } =
    await api.delete(
      `/accounts/party/${partyId}/notes/${noteId}`
    );

  return data;
};