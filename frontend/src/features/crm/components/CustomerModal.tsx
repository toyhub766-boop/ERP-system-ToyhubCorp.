import { useState } from "react";
import {
  createCustomer,
  updateCustomer,
} from "../services/customer.service";

interface Props {
  open: boolean;
  customer?: any;
  onClose: () => void;
  onSuccess: () => void;
}
const CustomerModal = ({
  open,
  customer,
  onClose,
  onSuccess,
}: Props) => {
  const [form, setForm] = useState({
  companyName: customer?.companyName || "",
  contactPerson: customer?.contactPerson || "",
  phone: customer?.phone || "",
  email: customer?.email || "",
  address: customer?.address || "",
  city: customer?.city || "",
  state: customer?.state || "",
  pincode: customer?.pincode || "",
  gstNumber: customer?.gstNumber || "",
});

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
if (customer?._id) {
  await updateCustomer(customer._id, form);
} else {
  await createCustomer(form);
}
      onSuccess();
      onClose();

      setForm({
        contactPerson: "",
        companyName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gstNumber: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

    <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">

      {/* Header */}

      <div className="border-b border-slate-200 px-6 py-5">

        <h2 className="text-2xl font-bold text-slate-900">
          {customer ? "Edit Customer" : "Add New Customer"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {customer
            ? "Update customer information."
            : "Create a new customer profile for your CRM."}
        </p>

      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
      >

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Contact Person
            </label>

            <input
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              placeholder="Enter contact person"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Company Name
            </label>

            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Phone Number
            </label>

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Address
            </label>

            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              City
            </label>

            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Enter city"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              State
            </label>

            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Enter state"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Pincode
            </label>

            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              placeholder="Enter pincode"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              GST Number
            </label>

            <input
              name="gstNumber"
              value={form.gstNumber}
              onChange={handleChange}
              placeholder="Enter GST number"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-100"
            />
          </div>

        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-[#172B6B] px-6 py-3 font-semibold text-white transition hover:bg-[#20398F]"
          >
            {customer ? "Update Customer" : "Create Customer"}
          </button>

        </div>

      </form>

    </div>

  </div>
);
};

export default CustomerModal;
