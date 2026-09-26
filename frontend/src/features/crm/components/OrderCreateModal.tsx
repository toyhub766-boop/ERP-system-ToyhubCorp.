import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

import { getCatalogues } from "../services/catalogue.service";
import { getParties } from "../../accounts/services/accountParty.service";
import { createOrder } from "../services/order.service";

interface CatalogueProduct {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  images?: string[];
  modelNumber?: string;
  marka?: string;
  price?: number;
  unit?: string;
  moq?: number;
  productType?: string;
  isActive?: boolean;
}

interface Party {
  _id: string;
  name?: string;
  companyName?: string;
  firmName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  partyType?: string;
  status?: string;
}

interface OrderItem {
  product: CatalogueProduct;
  quantity: number;
}

interface Props {
  /** Optional external control, used from Customer Profile. */
  open?: boolean;
  /** Preselects the customer when opened from a customer profile. */
  initialCustomerId?: string;
  /** Called after the CRM order has been created successfully. */
  onCreated?: () => void | Promise<void>;
  /** Called when an externally controlled modal is closed. */
  onClose?: () => void;
}

const getPartyName = (party: Party) =>
  party.companyName ||
  party.firmName ||
  party.name ||
  party.contactPerson ||
  "Unnamed Customer";

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const OrderCreateModal = ({
  open: controlledOpen,
  initialCustomerId,
  onCreated,
  onClose,
}: Props) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const [customers, setCustomers] = useState<Party[]>([]);
  const [catalogues, setCatalogues] = useState<
    CatalogueProduct[]
  >([]);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [items, setItems] = useState<OrderItem[]>([]);

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [productSearch, setProductSearch] =
    useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [catalogueData, partyData] =
        await Promise.all([
          getCatalogues(),
          getParties(),
        ]);

      setCatalogues(
        Array.isArray(catalogueData)
          ? catalogueData.filter(
              (product: CatalogueProduct) =>
                product.isActive !== false
            )
          : []
      );

      setCustomers(
        Array.isArray(partyData)
          ? partyData.filter(
              (party: Party) =>
                party.partyType === "CUSTOMER" &&
                party.status !== "Inactive"
            )
          : []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load customers and catalogue."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
      setCustomerId(initialCustomerId || "");
    }
  }, [open, initialCustomerId]);

  const filteredCustomers = useMemo(() => {
    const query =
      customerSearch.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) =>
      getPartyName(customer)
        .toLowerCase()
        .includes(query)
    );
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    const query =
      productSearch.trim().toLowerCase();

    if (!query) return catalogues;

    return catalogues.filter((product) =>
      [
        product.name,
        product.modelNumber,
        product.marka,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [catalogues, productSearch]);

  const selectedProduct = catalogues.find(
    (product) => product._id === productId
  );

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          (Number(item.product.price) || 0) *
            item.quantity,
        0
      ),
    [items]
  );

  const reset = () => {
    setCustomerId(initialCustomerId || "");
    setProductId("");
    setQuantity(1);
    setItems([]);
    setCustomerSearch("");
    setProductSearch("");
    setNotes("");
    setError("");
  };

  const close = () => {
    if (saving) return;

    if (isControlled) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }

    reset();
  };

  const addProduct = () => {
    setError("");

    if (!selectedProduct) {
      setError("Select a catalogue product.");
      return;
    }

    const moq =
      Number(selectedProduct.moq) || 1;

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      setError("Quantity must be a positive integer.");
      return;
    }

    if (qty < moq) {
      setError(
        `${selectedProduct.name} requires a minimum quantity of ${moq}.`
      );
      return;
    }

    if (qty % moq !== 0) {
      setError(
        `${selectedProduct.name} quantity must be a multiple of ${moq}.`
      );
      return;
    }

    const existingIndex = items.findIndex(
      (item) =>
        item.product._id === selectedProduct._id
    );

    if (existingIndex >= 0) {
      const updated = [...items];

      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity:
          updated[existingIndex].quantity + qty,
      };

      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          product: selectedProduct,
          quantity: qty,
        },
      ]);
    }

    setProductId("");
    setProductSearch("");
    setQuantity(1);
  };

  const removeProduct = (id: string) => {
    setItems((current) =>
      current.filter(
        (item) => item.product._id !== id
      )
    );
  };

  const updateQuantity = (
    id: string,
    value: number
  ) => {
    const safeValue = Number.isFinite(value)
      ? Math.max(0, Math.floor(value))
      : 0;

    setItems((current) =>
      current.map((item) =>
        item.product._id === id
          ? {
              ...item,
              quantity: safeValue,
            }
          : item
      )
    );
  };

  const handleCreate = async () => {
    setError("");

    if (!customerId) {
      setError("Select a customer.");
      return;
    }

    if (!items.length) {
      setError("Add at least one product.");
      return;
    }

    for (const item of items) {
      const moq =
        Number(item.product.moq) || 1;

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < moq ||
        item.quantity % moq !== 0
      ) {
        setError(
          `${item.product.name} quantity must be a multiple of ${moq}.`
        );
        return;
      }
    }

    try {
      setSaving(true);

      await createOrder({
        customer: customerId,
        items: items.map((item) => ({
          catalogueProduct:
            item.product._id,
          quantity: item.quantity,
        })),
        notes: notes.trim(),
      });

      await onCreated?.();

      close();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to create order."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {!isControlled && (
        <button
          type="button"
          onClick={() => setInternalOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#172B6B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20398F]"
      >
          <FiPlus size={16} />
          Create Order
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create Order
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a customer order from the catalogue.
                </p>
              </div>

              <button
                type="button"
                onClick={close}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Loading...
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Customer
                    </label>

                    <input
                      value={customerSearch}
                      onChange={(e) =>
                        setCustomerSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search customer..."
                      className="mb-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#172B6B]"
                    />

                    <select
                      value={customerId}
                      onChange={(e) =>
                        setCustomerId(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none"
                    >
                      <option value="">
                        Select customer
                      </option>

                      {filteredCustomers.map(
                        (customer) => (
                          <option
                            key={customer._id}
                            value={customer._id}
                          >
                            {getPartyName(
                              customer
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-slate-900">
                        Add Products
                      </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
                      <div>
                        <input
                          value={productSearch}
                          onChange={(e) =>
                            setProductSearch(
                              e.target.value
                            )
                          }
                          placeholder="Search catalogue..."
                          className="mb-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none"
                        />

                        <select
                          value={productId}
                          onChange={(e) =>
                            setProductId(
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none"
                        >
                          <option value="">
                            Select product
                          </option>

                          {filteredProducts.map(
                            (product) => (
                              <option
                                key={product._id}
                                value={product._id}
                              >
                                {product.name}
                                {product.modelNumber
                                  ? ` — ${product.modelNumber}`
                                  : ""}
                              </option>
                            )
                          )}
                        </select>

                        {selectedProduct && (
                          <p className="mt-2 text-xs text-slate-500">
                            {formatCurrency(
                              Number(
                                selectedProduct.price
                              ) || 0
                            )}{" "}
                            /{" "}
                            {selectedProduct.unit ||
                              "unit"}{" "}
                            · MOQ{" "}
                            {Number(
                              selectedProduct.moq
                            ) || 1}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                          Quantity
                        </label>

                        <input
                          type="number"
                          min={
                            Number(
                              selectedProduct?.moq
                            ) || 1
                          }
                          step={
                            Number(
                              selectedProduct?.moq
                            ) || 1
                          }
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={addProduct}
                          className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 md:w-auto"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
                        Order Items
                      </h3>

                      <span className="text-xs text-slate-400">
                        {items.length} item
                        {items.length !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    {items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center text-sm text-slate-400">
                        No products added.
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        {items.map((item) => {
                          const price =
                            Number(
                              item.product.price
                            ) || 0;

                          const total =
                            price *
                            item.quantity;

                          return (
                            <div
                              key={
                                item.product._id
                              }
                              className="flex flex-col gap-4 border-b border-slate-100 p-4 last:border-0 md:flex-row md:items-center"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900">
                                  {
                                    item.product
                                      .name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {item.product.modelNumber &&
                                    `${item.product.modelNumber} · `}
                                  {item.product.marka &&
                                    `${item.product.marka} · `}
                                  {item.product.productType || "PRODUCT"}
                                  {" · MOQ "}
                                  {Number(item.product.moq) || 1}
                                </p>
                              </div>

                              <input
                                type="number"
                                min={
                                  Number(
                                    item.product
                                      .moq
                                  ) || 1
                                }
                                step={
                                  Number(
                                    item.product
                                      .moq
                                  ) || 1
                                }
                                value={
                                  item.quantity
                                }
                                onChange={(e) =>
                                  updateQuantity(
                                    item.product
                                      ._id,
                                    Number(
                                      e.target.value
                                    )
                                  )
                                }
                                className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                              />

                              <div className="w-28 text-right">
                                <p className="text-xs text-slate-400">
                                  Total
                                </p>

                                <p className="font-semibold text-slate-900">
                                  {formatCurrency(
                                    total
                                  )}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeProduct(
                                    item.product
                                      ._id
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                              >
                                <FiTrash2
                                  size={15}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Notes
                    </label>

                    <textarea
                      value={notes}
                      onChange={(e) =>
                        setNotes(
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder="Optional order notes..."
                      className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#172B6B]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  Order Total
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(
                    totalAmount
                  )}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={close}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={
                    saving ||
                    loading ||
                    !customerId ||
                    items.length === 0
                  }
                  className="rounded-xl bg-[#172B6B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#20398F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCreateModal;