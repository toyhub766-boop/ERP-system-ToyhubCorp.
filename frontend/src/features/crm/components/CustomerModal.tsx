import { useEffect, useState } from "react";
import {
  createCustomer,
  updateCustomer,
} from "../services/customer.service";

import type { CustomerForm } from "../types/customer.types";

interface Props {
  open: boolean;
  customer?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm: CustomerForm = {
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  gstNumber: "",
  billingName: "",
  station: "",

  packingCharges: 0,
  transportCharges: 0,
  paymentTerms: 0,

  openingBalance: 0,

  stage: "LEAD",
  category: "OTHER",

  partyType: "CUSTOMER",
  status: "Active",
};

const CustomerModal = ({
  open,
  customer,
  onClose,
  onSuccess,
}: Props) => {

  const [form, setForm] =
    useState<CustomerForm>(emptyForm);

	const [step, setStep] = useState(1);

const totalSteps = 5;

const nextStep = () => {
  if (step < totalSteps) {
    setStep(step + 1);
  }
};

const prevStep = () => {
  if (step > 1) {
    setStep(step - 1);
  }
};

  useEffect(() => {

    if (!open) return;

    if (customer) {

      setForm({

        companyName: customer.companyName ?? "",
        contactPerson: customer.contactPerson ?? "",
        phone: customer.phone ?? "",
        email: customer.email ?? "",

        address: customer.address ?? "",
        city: customer.city ?? "",
        state: customer.state ?? "",
        pincode: customer.pincode ?? "",

        gstNumber: customer.gstNumber ?? "",
        billingName: customer.billingName ?? "",
        station: customer.station ?? "",

        packingCharges:
          customer.packingCharges ?? 0,

        transportCharges:
          customer.transportCharges ?? 0,

        paymentTerms:
          customer.paymentTerms ?? 0,

        openingBalance:
          customer.openingBalance ?? 0,

        stage:
          customer.stage ?? "LEAD",

        category:
          customer.category ?? "OTHER",

        partyType:
          customer.partyType ?? "CUSTOMER",

        status:
          customer.status ?? "Active",

      });

    } else {

      setForm(emptyForm);

    }

  }, [customer, open]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {

    const {
      name,
      value,
      type,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : value,
    }));

  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      if (customer?._id) {

        await updateCustomer(
          customer._id,
          form
        );

      } else {

        await createCustomer(form);

      }

      setForm(emptyForm);

      onSuccess();

      onClose();

    } catch (err) {

      console.error(err);

    }

  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

    <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden">

      {/* Header */}

      <div className="border-b border-slate-200 px-6 py-5">

        <h2 className="text-2xl font-bold text-slate-900">
          {customer ? "Edit Customer" : "Add Customer"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage customer information and CRM details.
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col"
      >

        {/* Stepper */}

        <div className="border-b border-slate-200 px-6 py-5">

          <div className="flex items-center justify-between">

            {[
              "Basic",
              "Address",
              "Business",
              "Commercial",
            ].map((label, index) => (

              <div
                key={label}
                className="flex flex-1 items-center"
              >

                <div
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-sm
                    font-semibold

                    ${
                      step >= index + 1
                        ? "bg-[#172B6B] text-white"
                        : "bg-slate-200 text-slate-500"
                    }
                  `}
                >
                  {index + 1}
                </div>

                {index !== 3 && (

                  <div
                    className={`
                      h-1
                      flex-1

                      ${
                        step > index + 1
                          ? "bg-[#172B6B]"
                          : "bg-slate-200"
                      }
                    `}
                  />

                )}

              </div>

            ))}

          </div>

          <h3 className="mt-5 text-center text-lg font-semibold">

            {
              [
                "Basic Information",
                "Address",
                "Business Details",
                "Commercial Details",
              ][step - 1]
            }

          </h3>

        </div>

        {/* Body */}

        <div className="max-h-[65vh] overflow-y-auto p-6">

          {/* STEP 1 */}

          {step === 1 && (

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold">

                  Company Name

                </label>

                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">

                  Contact Person

                </label>

                <input
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">

                  Phone

                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">

                  Email

                </label>

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

            </div>

          )}

          {/* STEP 2 */}

          {step === 2 && (

            <div className="grid gap-5 md:grid-cols-2">

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold">

                  Address

                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border p-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">

                  City

                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">

                  State

                </label>

                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">

                  Pincode

                </label>

                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">

                  GST Number

                </label>

                <input
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

            </div>

          )}

                    {step === 3 && (

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Billing Name
                </label>

                <input
                  name="billingName"
                  value={form.billingName}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Station
                </label>

                <input
                  name="station"
                  value={form.station}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Party Type
                </label>

                <select
                  name="partyType"
                  value={form.partyType}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="SUPPLIER">Supplier</option>
                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Stage
                </label>

                <select
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                >
                  <option value="LEAD">Lead</option>
                  <option value="RINGING">Ringing</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="CATALOG_SHARED">Catalog Shared</option>
                  <option value="VERIFICATION">Verification</option>
                  <option value="ACTIVE_DEALER">Active Dealer</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="DELAYED_PAYMENT">Delayed Payment</option>
                  <option value="CLOSED">Closed</option>
                  <option value="NO_DEALER">No Dealer</option>
                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                >
                  <option value="ONLINE_SELLER">Online Seller</option>
                  <option value="CONTAINER_PARTY">Container Party</option>
                  <option value="LOOSE_PARTY">Loose Party</option>
                  <option value="CAKE_DOLL">Cake Doll</option>
                  <option value="TOY_DEALER">Toy Dealer</option>
                  <option value="OTHER">Other</option>
                </select>

              </div>

            </div>

          )}

          {/* STEP 4 */}

          {step === 4 && (

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Packing Charges
                </label>

                <input
                  type="number"
                  name="packingCharges"
                  value={form.packingCharges}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Transport Charges
                </label>

                <input
                  type="number"
                  name="transportCharges"
                  value={form.transportCharges}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Payment Terms (Days)
                </label>

                <input
                  type="number"
                  name="paymentTerms"
                  value={form.paymentTerms}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Opening Balance
                </label>

                <input
                  type="number"
                  name="openingBalance"
                  value={form.openingBalance}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4"
                />

              </div>

            </div>

          )}

        </div>

        {/* Footer */}

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-5">

          <button
            type="button"
            onClick={step === 1 ? onClose : prevStep}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step < totalSteps ? (

            <button
              type="button"
              onClick={nextStep}
              className="rounded-xl bg-[#172B6B] px-6 py-3 font-semibold text-white hover:bg-[#20398F]"
            >
              Next
            </button>

          ) : (

            <button
              type="submit"
              className="rounded-xl bg-[#172B6B] px-6 py-3 font-semibold text-white hover:bg-[#20398F]"
            >
              {customer ? "Update Customer" : "Create Customer"}
            </button>

          )}

        </div>

      </form>

    </div>

  </div>
);
};

export default CustomerModal;
