export interface CustomerNote {
  _id?: string;

  title: string;

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

  addedBy?: string;

  createdAt?: string;
}


export interface Customer {
  _id: string;

  customerCode: string;

  companyName: string;

  contactPerson: string;

  phone: string;

  email: string;

  address: string;

  city: string;

  state: string;

  pincode: string;

  gstNumber: string;

  billingName: string;

  station: string;

  packingCharges: number;

  transportCharges: number;

  paymentTerms: number;

  stage:
    | "LEAD"
    | "RINGING"
    | "NEGOTIATION"
    | "CATALOG_SHARED"
    | "VERIFICATION"
    | "ACTIVE_DEALER"
    | "SUPPLIER"
    | "DELAYED_PAYMENT"
    | "CLOSED"
    | "NO_DEALER";

  category:
    | "ONLINE_SELLER"
    | "CONTAINER_PARTY"
    | "LOOSE_PARTY"
    | "CAKE_DOLL"
    | "TOY_DEALER"
    | "OTHER";

  specialNotes: CustomerNote[];

  reminderDate?: string;

  reminderSet: boolean;

  partyType: "CUSTOMER" | "SUPPLIER";

  openingBalance: number;

  currentBalance: number;

  status: "Active" | "Inactive";

  createdAt: string;

  updatedAt: string;
}

export interface CustomerForm {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;

  billingName: string;
  station: string;

  packingCharges: number;
  transportCharges: number;
  paymentTerms: number;

  stage: Customer["stage"];
  category: Customer["category"];

  partyType: Customer["partyType"];
  status: Customer["status"];

  openingBalance: number;

  reminderDate?: string;
  reminderSet?: boolean;
specialNotes?: CustomerNote[];
}