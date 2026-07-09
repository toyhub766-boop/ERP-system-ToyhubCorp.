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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl p-6 w-full max-w-md">

                <h2 className="text-xl font-bold mb-6">
                    {order ? "Edit Order" : "Create Order"}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    <input
                        name="totalAmount"
                        type="number"
                        placeholder="Total Amount"
                        value={form.totalAmount}
                        onChange={handleChange}
                        className="w-full border rounded-xl p-3"
                    />

                    <input
                        name="dueDate"
                        type="date"
                        value={form.dueDate}
                        onChange={handleChange}
                        className="w-full border rounded-xl p-3"
                    />

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border rounded-xl p-3"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Production">In Production</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <div className="flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            className="border px-5 py-2 rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="bg-[#172B6B] text-white px-5 py-2 rounded-lg"
                        >
                            Save
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default OrderModal;