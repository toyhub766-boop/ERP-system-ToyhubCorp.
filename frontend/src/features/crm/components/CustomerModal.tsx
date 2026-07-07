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

const AddCustomerModal = ({ open, onClose, onSuccess }: Props) => {
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold mb-6">{customer ? "Edit Customer" : "Add Customer"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="contactPerson"
            placeholder="Name"
            value={form.contactPerson}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            name="companyName"
            placeholder="Company"
            value={form.companyName}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            name="pincode"
            placeholder="Pincode"
            value={form.pincode}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            name="gstNumber"
            placeholder="GST Number"
            value={form.gstNumber}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#172B6B] text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;
