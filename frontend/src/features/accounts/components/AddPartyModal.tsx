import { useEffect, useState } from "react";

import {
  createParty,
  updateParty,
} from "../services/accountParty.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editParty?: any;
}

const AddPartyModal = ({
  open,
  onClose,
  onSuccess,
  editParty,
}: Props) => {
  const [saving, setSaving] = useState(false);

  const [partyType, setPartyType] = useState<
    "CUSTOMER" | "SUPPLIER" | "COMPANY_EXPENSE"
  >("CUSTOMER");

  const initialForm = {
    firmName: "",
    companyName: "",
    contactPerson: "",
    email: "",

    address: "",
    city: "",
    state: "",
    pincode: "",

    openingBalance: 0,
    remarks: "",

    gstNumber: "",
    billingName: "",

    transportName: "",
    transportNumber: "",
    transportPhone: "",

    marka: "",
    station: "",

    packingCharges: 0,
    transportCharges: 0,

    paymentTerms: 0,
    dueDate: "",

    expenseCategory: "",
    description: "",
  };

  const [form, setForm] = useState(initialForm);

  // ==========================================
  // HELPERS
  // ==========================================

  const formatDateForInput = (
    value?: string | Date | null
  ) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Date(
      date.getTime() -
      date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];
  };

  const updateField = (
    key: keyof typeof form,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ==========================================
  // LOAD FORM
  // ==========================================

  useEffect(() => {
    if (!open) return;

    // EDIT MODE
    if (editParty) {
      setPartyType(editParty.partyType);

      const details =
        editParty.partyType === "CUSTOMER"
          ? editParty.customerDetails
          : editParty.partyType === "SUPPLIER"
            ? editParty.supplierDetails
            : editParty.companyExpenseDetails;

      setForm({
        firmName:
          editParty.firmName || "",

        companyName:
          editParty.companyName || "",

        contactPerson:
          editParty.contactPerson || "",

        email:
          editParty.email || "",

        address:
          editParty.address || "",

        city:
          editParty.city || "",

        state:
          editParty.state || "",

        pincode:
          editParty.pincode || "",

        openingBalance:
          editParty.openingBalance ?? 0,

        remarks:
          editParty.remarks || "",

        gstNumber:
          details?.gstNumber || "",

        billingName:
          details?.billingName || "",

        transportName:
          details?.transportName || "",

        transportNumber:
          details?.transportNumber || "",

        transportPhone:
          details?.transportPhone || "",

        marka:
          details?.marka || "",

        station:
          details?.station || "",

        packingCharges:
          details?.packingCharges ?? 0,

        transportCharges:
          details?.transportCharges ?? 0,

        paymentTerms:
          details?.paymentTerms ?? 0,

        dueDate:
          formatDateForInput(
            details?.dueDate
          ),

        expenseCategory:
          details?.expenseCategory || "",

        description:
          details?.description || "",
      });

      return;
    }

    // ADD MODE
    setPartyType("CUSTOMER");
    setForm(initialForm);
  }, [open, editParty]);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async () => {
    if (!form.companyName.trim()) {
      alert("Company Name is required.");
      return;
    }

    if (
      form.openingBalance < 0
    ) {
      alert(
        "Opening balance cannot be negative."
      );
      return;
    }

    if (
      partyType !== "COMPANY_EXPENSE" &&
      (
        form.paymentTerms < 0 ||
        form.paymentTerms > 100 ||
        !Number.isInteger(
          Number(form.paymentTerms)
        )
      )
    ) {
      alert(
        "Payment terms must be a whole number between 0 and 100 days."
      );
      return;
    }

    const payload = {
      partyType,

      firmName:
        form.firmName.trim(),

      companyName:
        form.companyName.trim(),

      contactPerson:
        form.contactPerson.trim(),

      email:
        form.email.trim(),

      address:
        form.address.trim(),

      city:
        form.city.trim(),

      state:
        form.state.trim(),

      pincode:
        form.pincode.trim(),

      openingBalance:
        Number(form.openingBalance),

      remarks:
        form.remarks.trim(),

      gstNumber:
        form.gstNumber.trim(),

      billingName:
        form.billingName.trim(),

      transportName:
        form.transportName.trim(),

      transportNumber:
        form.transportNumber.trim(),

      transportPhone:
        form.transportPhone.trim(),

      marka:
        form.marka.trim(),

      station:
        form.station.trim(),

      packingCharges:
        Number(form.packingCharges),

      transportCharges:
        Number(form.transportCharges),

      paymentTerms:
        Number(form.paymentTerms),

      dueDate:
        form.dueDate || null,

      expenseCategory:
        form.expenseCategory.trim(),

      description:
        form.description.trim(),
    };

    try {
      setSaving(true);

      if (editParty) {
        await updateParty(
          editParty._id,
          payload
        );
      } else {
        await createParty(payload);
      }

      await onSuccess();

      onClose();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
        (
          editParty
            ? "Failed to update party."
            : "Failed to create party."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  // ==========================================
  // INPUT CLASS
  // ==========================================

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#17357A] focus:ring-2 focus:ring-[#17357A]/10";

  const labelClass =
    "mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6">

      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">

          <div className="flex items-start justify-between gap-4">

            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {editParty
                  ? "Edit Party"
                  : "Add Party"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editParty
                  ? "Update the complete party information."
                  : "Create a new customer, supplier or company expense."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              ×
            </button>

          </div>

        </div>

        {/* =====================================
            PARTY TYPE TABS
        ===================================== */}

        <div className="flex border-b border-slate-200">

          {[
            {
              label: "Customer",
              value: "CUSTOMER",
            },
            {
              label: "Supplier",
              value: "SUPPLIER",
            },
            {
              label: "Company Expense",
              value: "COMPANY_EXPENSE",
            },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              disabled={!!editParty}
              onClick={() =>
                setPartyType(
                  tab.value as
                  | "CUSTOMER"
                  | "SUPPLIER"
                  | "COMPANY_EXPENSE"
                )
              }
              className={`flex-1 px-3 py-3 text-sm font-semibold transition ${partyType === tab.value
                  ? "border-b-2 border-[#17357A] text-[#17357A]"
                  : "text-slate-500 hover:text-slate-700"
                } ${editParty
                  ? "cursor-not-allowed opacity-70"
                  : ""
                }`}
            >
              {tab.label}
            </button>
          ))}

        </div>

        {/* =====================================
            FORM
        ===================================== */}

        <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">

          <div className="space-y-8">

            {/* ==================================
                BASIC INFORMATION
            ================================== */}

            <section>

              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Basic Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  General identification and contact information.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
  <label className={labelClass}>
    Firm Name
  </label>

  <select
    value={form.firmName}
    onChange={(e) =>
      updateField("firmName", e.target.value)
    }
    className={inputClass}
  >
    <option value="">Select firm</option>
    <option value="Mehak Enterprises">
      Mehak Enterprises
    </option>
    <option value="ToyHub Corp">
      ToyHub Corp
    </option>
    <option value="Firm 3">
      Firm 3
    </option>
  </select>
</div>

                <div>
                  <label className={labelClass}>
                    Company Name *
                  </label>

                  <input
                    value={form.companyName}
                    onChange={(e) =>
                      updateField(
                        "companyName",
                        e.target.value
                      )
                    }
                    placeholder="Enter company name"
                    className={inputClass}
                  />
                </div>



                <div>
                  <label className={labelClass}>
                    Contact Person
                  </label>

                  <input
                    value={form.contactPerson}
                    onChange={(e) =>
                      updateField(
                        "contactPerson",
                        e.target.value
                      )
                    }
                    placeholder="Enter contact person"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="example@company.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Pincode
                  </label>

                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) =>
                      updateField(
                        "pincode",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="6 digit pincode"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Address
                  </label>

                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(e) =>
                      updateField(
                        "address",
                        e.target.value
                      )
                    }
                    placeholder="Enter complete address"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    City
                  </label>

                  <input
                    value={form.city}
                    onChange={(e) =>
                      updateField(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="City"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    State
                  </label>

                  <input
                    value={form.state}
                    onChange={(e) =>
                      updateField(
                        "state",
                        e.target.value
                      )
                    }
                    placeholder="State"
                    className={inputClass}
                  />
                </div>

              </div>

            </section>

            {/* ==================================
                ACCOUNT INFORMATION
            ================================== */}

            <section>

              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Account Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Opening balance and account notes.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label className={labelClass}>
                    Opening Balance
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.openingBalance}
                    onChange={(e) =>
                      updateField(
                        "openingBalance",
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className={inputClass}
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Must be zero or greater.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Remarks
                  </label>

                  <input
                    value={form.remarks}
                    onChange={(e) =>
                      updateField(
                        "remarks",
                        e.target.value
                      )
                    }
                    placeholder="Optional remarks"
                    className={inputClass}
                  />
                </div>

              </div>

            </section>

            {/* ==================================
                CUSTOMER
            ================================== */}

            {partyType === "CUSTOMER" && (
              <section>

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Customer Details
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    GST, billing, transport and commercial details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>
                    <label className={labelClass}>
                      GST Number
                    </label>

                    <input
                      value={form.gstNumber}
                      onChange={(e) =>
                        updateField(
                          "gstNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="GSTIN"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Billing Name
                    </label>

                    <input
                      value={form.billingName}
                      onChange={(e) =>
                        updateField(
                          "billingName",
                          e.target.value
                        )
                      }
                      placeholder="Billing name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Transport Name
                    </label>

                    <input
                      value={form.transportName}
                      onChange={(e) =>
                        updateField(
                          "transportName",
                          e.target.value
                        )
                      }
                      placeholder="Transporter name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Transport Number
                    </label>

                    <input
                      value={form.transportNumber}
                      onChange={(e) =>
                        updateField(
                          "transportNumber",
                          e.target.value
                        )
                      }
                      placeholder="Transport number"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Transport Phone
                    </label>

                    <input
                      type="tel"
                      inputMode="numeric"
                      value={form.transportPhone}
                      onChange={(e) =>
                        updateField(
                          "transportPhone",
                          e.target.value
                        )
                      }
                      placeholder="Transport phone"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Marka
                    </label>

                    <input
                      value={form.marka}
                      onChange={(e) =>
                        updateField(
                          "marka",
                          e.target.value
                        )
                      }
                      placeholder="Marka"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Station
                    </label>

                    <input
                      value={form.station}
                      onChange={(e) =>
                        updateField(
                          "station",
                          e.target.value
                        )
                      }
                      placeholder="Station"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Packing Charges
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.packingCharges}
                      onChange={(e) =>
                        updateField(
                          "packingCharges",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Transport Charges
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.transportCharges}
                      onChange={(e) =>
                        updateField(
                          "transportCharges",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Payment Terms
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={form.paymentTerms}
                      onChange={(e) =>
                        updateField(
                          "paymentTerms",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Days · 0–100
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        updateField(
                          "dueDate",
                          e.target.value
                        )
                      }
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Can also be changed directly from the party card.
                    </p>
                  </div>

                </div>

              </section>
            )}

            {/* ==================================
                SUPPLIER
            ================================== */}

            {partyType === "SUPPLIER" && (
              <section>

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Supplier Details
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Supplier GST and payment information.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>
                    <label className={labelClass}>
                      GST Number
                    </label>

                    <input
                      value={form.gstNumber}
                      onChange={(e) =>
                        updateField(
                          "gstNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="GSTIN"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Payment Terms
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={form.paymentTerms}
                      onChange={(e) =>
                        updateField(
                          "paymentTerms",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Days · 0–100
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        updateField(
                          "dueDate",
                          e.target.value
                        )
                      }
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Can also be changed directly from the party card.
                    </p>
                  </div>

                </div>

              </section>
            )}

            {/* ==================================
                COMPANY EXPENSE
            ================================== */}

            {partyType ===
              "COMPANY_EXPENSE" && (
                <section>

                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-900">
                      Company Expense
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Information about this company expense account.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5">

                    <div>
                      <label className={labelClass}>
                        Expense Category
                      </label>

                      <input
                        value={
                          form.expenseCategory
                        }
                        onChange={(e) =>
                          updateField(
                            "expenseCategory",
                            e.target.value
                          )
                        }
                        placeholder="Expense category"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Description
                      </label>

                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) =>
                          updateField(
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe the expense account..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                  </div>

                </section>
              )}

          </div>
        </div>

        {/* =====================================
            FOOTER
        ===================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="rounded-xl bg-[#17357A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10295d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editParty
                ? "Update Party"
                : "Create Party"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default AddPartyModal;