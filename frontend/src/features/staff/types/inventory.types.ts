export interface Product {
  _id: string;

  name: string;

  type: "RAW" | "FINISHED";

  image?: string;

  sku: string;

  unit: string;

  minimumStock: number;

  currentStock: number;

  status: string;

  category: {
    _id: string;
    name: string;
  };

  warehouse: {
    _id: string;
    name: string;
  };
}

export interface Transaction {
  _id: string;

  type: "IN" | "OUT";

  quantity: number;

  previousStock: number;

  currentStock: number;

  reason: string;

  notes?: string;

  createdAt: string;

  product: {
    name: string;
    sku: string;
  };

  warehouse: {
    name: string;
  };

  performedBy?: {
    name: string;
  };
}