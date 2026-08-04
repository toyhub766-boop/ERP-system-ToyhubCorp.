import { useEffect, useState } from "react";

import {
    createReminder,
    updateReminder,
} from "../services/reminder.service";

interface Props {
    open: boolean;

    editReminder?: any;

    onClose: () => void;

    onSuccess: () => void;
}

const ReminderModal = ({
    open,
    editReminder,
    onClose,
    onSuccess,
}: Props) => {

    const [saving, setSaving] =
        useState(false);

    const [form, setForm] =
        useState({

            title: "",

            description: "",

            module: "ACCOUNTS",

            relatedId: "",

            assignedTo: "",

            priority: "MEDIUM",

            dueDate: "",

        });

    useEffect(() => {

        if (editReminder) {

            setForm({

                title:
                    editReminder.title,

                description:
                    editReminder.description || "",

                module:
                    editReminder.module,

                relatedId:
                    editReminder.relatedId || "",

                assignedTo:
                    editReminder.assignedTo?._id || "",

                priority:
                    editReminder.priority,

                dueDate:
                    editReminder.dueDate
                        ?.slice(0, 10),

            });

        } else {

            setForm({

                title: "",

                description: "",

                module: "ACCOUNTS",

                relatedId: "",

                assignedTo: "",

                priority: "MEDIUM",

                dueDate: "",

            });

        }

    }, [
        editReminder,
        open,
    ]);

    const handleChange = (
        e: any
    ) => {

        setForm({

            ...form,

            [e.target.name]:
                e.target.value,

        });

    };

    const handleSubmit = async () => {

        if (!form.title.trim()) {
            alert("Please enter reminder title.");
            return;
        }

        if (!form.dueDate) {
            alert("Please select due date.");
            return;
        }

        try {

            setSaving(true);

            if (editReminder) {

                await updateReminder(
                    editReminder._id,
                    form
                );

            } else {

                await createReminder(form);

            }

            onSuccess();

        } catch (error) {

            console.error(error);

            alert("Failed to save reminder.");

        } finally {

            setSaving(false);

        }

    };

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

                {/* Header */}

                <div className="border-b p-6">

                    <h2 className="text-2xl font-bold">

                        {editReminder
                            ? "Edit Reminder"
                            : "Add Reminder"}

                    </h2>

                </div>

                {/* Body */}

                <div className="space-y-5 p-6">

                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Reminder Title"
                        className="w-full rounded-xl border px-4 py-3"
                    />

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Description"
                        className="w-full rounded-xl border px-4 py-3"
                    />

                    <div className="grid grid-cols-2 gap-4">

                        <select
                            name="module"
                            value={form.module}
                            onChange={handleChange}
                            className="rounded-xl border px-4 py-3"
                        >
                            <option value="ACCOUNTS">
                                Accounts
                            </option>

                            <option value="CRM">
                                CRM
                            </option>
                        </select>

                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                            className="rounded-xl border px-4 py-3"
                        >
                            <option value="LOW">
                                Low
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HIGH">
                                High
                            </option>
                        </select>

                    </div>

                    <input
                        type="date"
                        name="dueDate"
                        value={form.dueDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border px-4 py-3"
                    />

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-3 border-t p-6">

                    <button
                        onClick={onClose}
                        className="rounded-xl border px-6 py-3"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={saving}
                        onClick={handleSubmit}
                        className="rounded-xl bg-[#17357A] px-6 py-3 font-semibold text-white"
                    >
                        {saving
                            ? "Saving..."
                            : editReminder
                                ? "Update Reminder"
                                : "Create Reminder"}
                    </button>

                </div>

            </div>

        </div>

    );

};

export default ReminderModal;