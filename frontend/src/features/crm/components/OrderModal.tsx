import { useState } from "react";
import {
    createOrder,
    updateOrder,
} from "../services/order.service";

interface Props {
    open: boolean;
    customer: any;
    order?: any;
    onClose: () => void;
    onSuccess: () => void;
}

const OrderModal = ({
    open,
    customer,
    order,
    onClose,
    onSuccess,
}: Props) => {
    const [form, setForm] = useState({
        totalAmount: order?.totalAmount || "",
        dueDate: order?.dueDate?.substring(0, 10) || "",
        status: order?.status || "Pending",
    });

    if (!open) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            const payload = {
                ...form,
                customer: customer._id,
            };

            if (order?._id) {
                await updateOrder(order._id, payload);
            } else {
                await createOrder(payload);
            }

            onSuccess();
            onClose();

        } catch (err) {
            console.error(err);
        }
    };

    return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

      {/* Header */}

      <div className="border-b border-slate-200 px-6 py-5">

        <h2 className="text-2xl font-bold text-slate-900">
          {order ? "Edit Order" : "Create New Order"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {order
            ? "Update the order details below."
            : "Create a new order for the selected customer."}
        </p>

      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
      >

        {/* Total Amount */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Total Amount
          </label>

          <input
            name="totalAmount"
            type="number"
            placeholder="Enter total amount"
            value={form.totalAmount}
            onChange={handleChange}
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-300
              px-4
              outline-none
              transition
              focus:border-[#172B6B]
              focus:ring-4
              focus:ring-blue-100
            "
          />

        </div>

        {/* Due Date */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Due Date
          </label>

          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-300
              px-4
              outline-none
              transition
              focus:border-[#172B6B]
              focus:ring-4
              focus:ring-blue-100
            "
          />

        </div>

        {/* Status */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Order Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-300
              px-4
              outline-none
              transition
              focus:border-[#172B6B]
              focus:ring-4
              focus:ring-blue-100
            "
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Production">
              In Production
            </option>
            <option value="Dispatched">
              Dispatched
            </option>
            <option value="Delivered">
              Delivered
            </option>
            <option value="Cancelled">
              Cancelled
            </option>
          </select>

        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              border
              border-slate-300
              px-6
              py-3
              font-semibold
              transition
              hover:bg-slate-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            className="
              rounded-xl
              bg-[#172B6B]
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-[#20398F]
            "
          >
            {order ? "Update Order" : "Create Order"}
          </button>

        </div>

      </form>

    </div>

  </div>
);
};

export default OrderModal;