import api from "../../../services/api/axios";

export interface CRMDueDate {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  currentBalance: number;
  paymentTerms: number;
  dueDate?: string | null;
  partyType: string;

  assignedSalespeople?: {
    _id: string;
    name: string;
    role?: string;
    status?: string;
  }[];
}

export const getCRMDueDates = async (): Promise<
  CRMDueDate[]
> => {
  const res = await api.get("/accounts/party");

  const parties = Array.isArray(res.data)
    ? res.data
    : [];

  return parties
    .filter(
      (party: any) =>
        party.partyType === "CUSTOMER" &&
        party.status === "Active"
    )
    .map(
      (party: any): CRMDueDate => ({
        _id: party._id,

        companyName:
          party.companyName ||
          "Unnamed Customer",

        contactPerson:
          party.contactPerson || "",

        phone:
          party.phone || "",

        currentBalance:
          Number(
            party.currentBalance || 0
          ),

        paymentTerms:
          Number(
            party.customerDetails
              ?.paymentTerms || 0
          ),

        dueDate:
          party.customerDetails
            ?.dueDate || null,

        partyType:
          party.partyType ||
          "CUSTOMER",

        assignedSalespeople:
  Array.isArray(
    party.assignedSalespeople
  )
    ? party.assignedSalespeople
        .map((person: any) => ({
          _id: person._id,
          name: person.name,
          role: person.role,
          status: person.status,
        }))
    : [],
      })
    );
};


/* =========================================================
   UPDATE ACCOUNT DUE DATE
   ========================================================= */

export const updateCRMDueDate = async (
  partyId: string,
  dueDate: string | null
) => {
  const res = await api.patch(
    `/accounts/party/${partyId}/due-date`,
    {
      dueDate,
    }
  );

  return res.data;
};