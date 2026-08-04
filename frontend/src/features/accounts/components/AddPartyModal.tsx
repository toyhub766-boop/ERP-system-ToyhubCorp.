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
        companyName: "",
        contactPerson: "",
        phone: "",
        email: "",

        address: "",
        city: "",
        state: "",
        pincode: "",

        openingBalance: 0,
        remarks: "",

        // Customer + Supplier
        gstNumber: "",

        billingName: "",

        transportName: "",
        transportNumber: "",

        marka: "",
        station: "",

        packingCharges: 0,
        transportCharges: 0,

        paymentTerms: 0,
        dueDate: "",

        // Company Expense

        expenseCategory: "",
        description: "",
    };

    const [form, setForm] =
        useState(initialForm);

    useEffect(() => {
        if (!open) return;

        // ======================
        // EDIT MODE
        // ======================

        if (editParty) {
            setPartyType(editParty.partyType);

            setForm({
                companyName:
                    editParty.companyName || "",

                contactPerson:
                    editParty.contactPerson || "",

                phone:
                    editParty.phone || "",

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
                    editParty.openingBalance || 0,

                remarks:
                    editParty.remarks || "",

                gstNumber:
                    editParty.customerDetails
                        ?.gstNumber ||
                    editParty.supplierDetails
                        ?.gstNumber ||
                    "",

                billingName:
                    editParty.customerDetails
                        ?.billingName || "",

                transportName:
                    editParty.customerDetails
                        ?.transportName || "",

                transportNumber:
                    editParty.customerDetails
                        ?.transportNumber || "",

                marka:
                    editParty.customerDetails
                        ?.marka || "",

                station:
                    editParty.customerDetails
                        ?.station || "",

                packingCharges:
                    editParty.customerDetails
                        ?.packingCharges || 0,

                transportCharges:
                    editParty.customerDetails
                        ?.transportCharges || 0,

                paymentTerms:
                    editParty.customerDetails
                        ?.paymentTerms ||
                    editParty.supplierDetails
                        ?.paymentTerms ||
                    0,

                dueDate:
                    editParty.customerDetails
                        ?.dueDate ||
                    editParty.supplierDetails
                        ?.dueDate ||
                    "",

                expenseCategory:
                    editParty
                        .companyExpenseDetails
                        ?.expenseCategory || "",

                description:
                    editParty
                        .companyExpenseDetails
                        ?.description || "",
            });

            return;
        }

        // ======================
        // ADD MODE
        // ======================

        setPartyType("CUSTOMER");

        setForm(initialForm);

    }, [open, editParty]);

    const updateField = (
        key: keyof typeof form,
        value: any
    ) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!form.companyName.trim()) {
            alert("Company Name is required.");
            return;
        }

        const payload = {
            partyType,

            companyName: form.companyName,
            contactPerson: form.contactPerson,

            phone: form.phone,
            email: form.email,

            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,

            openingBalance: Number(form.openingBalance),

            remarks: form.remarks,

            // Customer / Supplier
            gstNumber: form.gstNumber,

            billingName: form.billingName,

            transportName: form.transportName,
            transportNumber: form.transportNumber,

            marka: form.marka,
            station: form.station,

            packingCharges: Number(
                form.packingCharges
            ),

            transportCharges: Number(
                form.transportCharges
            ),

            paymentTerms: Number(
                form.paymentTerms
            ),

            dueDate: form.dueDate || null,

            // Company Expense

            expenseCategory:
                form.expenseCategory,

            description: form.description,
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

        } catch (err) {

            console.error(err);

            alert(
                editParty
                    ? "Failed to update party."
                    : "Failed to create party."
            );

        } finally {

            setSaving(false);

        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">

            <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">

                {/* Header */}

                <div className="border-b px-8 py-6">

                    <h2 className="text-3xl font-bold">

                        {editParty
                            ? "Edit Party"
                            : "Add Party"}

                    </h2>

                    <p className="mt-2 text-slate-500">

                        {editParty
                            ? "Update party information."
                            : "Create a new Customer, Supplier or Company Expense."}

                    </p>

                </div>

                {/* Tabs */}

                <div className="flex border-b">

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
                            disabled={!!editParty}
                            onClick={() =>
                                setPartyType(
                                    tab.value as any
                                )
                            }
                            className={`flex-1 py-4 font-semibold transition ${partyType === tab.value
                                    ? "border-b-2 border-[#17357A] text-[#17357A]"
                                    : "text-slate-500"
                                } ${editParty
                                    ? "cursor-not-allowed opacity-70"
                                    : ""
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}

                </div>

                {/* FORM */}

                <div className="max-h-[65vh] overflow-y-auto p-8 space-y-8">

                    {/* =========================
      COMMON DETAILS
========================= */}

                    <div>

                        <h3 className="mb-5 text-lg font-semibold">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-2 gap-5">

                            <div>
                                <label className="mb-2 block text-sm font-medium">
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
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
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
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Phone
                                </label>

                                <input
                                    value={form.phone}
                                    onChange={(e) =>
                                        updateField(
                                            "phone",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Email
                                </label>

                                <input
                                    value={form.email}
                                    onChange={(e) =>
                                        updateField(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="mb-2 block text-sm font-medium">
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
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 resize-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Opening Balance
                                </label>

                                <input
                                    type="number"
                                    value={form.openingBalance}
                                    onChange={(e) =>
                                        updateField(
                                            "openingBalance",
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
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
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                />
                            </div>

                        </div>

                    </div>

                    {/* =========================
      CUSTOMER
========================= */}

                    {partyType === "CUSTOMER" && (

                        <div>

                            <h3 className="mb-5 mt-8 text-lg font-semibold">
                                Customer Details
                            </h3>

                            <div className="grid grid-cols-2 gap-5">

                                {[
                                    ["GST Number", "gstNumber"],
                                    ["Billing Name", "billingName"],
                                    ["Transport Name", "transportName"],
                                    ["Transport Number", "transportNumber"],
                                    ["Marka", "marka"],
                                    ["Station", "station"],
                                ].map(([label, key]) => (
                                    <div key={key}>
                                        <label className="mb-2 block text-sm font-medium">
                                            {label}
                                        </label>

                                        <input
                                            value={(form as any)[key]}
                                            onChange={(e) =>
                                                updateField(
                                                    key as any,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Packing Charges
                                    </label>

                                    <input
                                        type="number"
                                        value={form.packingCharges}
                                        onChange={(e) =>
                                            updateField(
                                                "packingCharges",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Transport Charges
                                    </label>

                                    <input
                                        type="number"
                                        value={form.transportCharges}
                                        onChange={(e) =>
                                            updateField(
                                                "transportCharges",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Payment Terms (Days)
                                    </label>

                                    <input
                                        type="number"
                                        value={form.paymentTerms}
                                        onChange={(e) =>
                                            updateField(
                                                "paymentTerms",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
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
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                    />
                                </div>

                            </div>

                        </div>

                    )}

                    {/* =========================
      SUPPLIER
========================= */}

                    {partyType === "SUPPLIER" && (

                        <div>

                            <h3 className="mb-5 mt-8 text-lg font-semibold">
                                Supplier Details
                            </h3>

                            <div className="grid grid-cols-2 gap-5">

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        GST Number
                                    </label>

                                    <input
                                        value={form.gstNumber}
                                        onChange={(e) =>
                                            updateField(
                                                "gstNumber",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-medium">
                                        Payment Terms
                                    </label>

                                    <input
                                        type="number"
                                        value={form.paymentTerms}
                                        onChange={(e) =>
                                            updateField(
                                                "paymentTerms",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-medium">
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
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                    />

                                </div>

                            </div>

                        </div>

                    )}

                    {/* =========================
      COMPANY EXPENSE
========================= */}

                    {partyType === "COMPANY_EXPENSE" && (

                        <div>

                            <h3 className="mb-5 mt-8 text-lg font-semibold">
                                Company Expense
                            </h3>

                            <div className="grid grid-cols-2 gap-5">

                                <div>

                                    <label className="mb-2 block text-sm font-medium">
                                        Expense Category
                                    </label>

                                    <input
                                        value={form.expenseCategory}
                                        onChange={(e) =>
                                            updateField(
                                                "expenseCategory",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                    />

                                </div>

                                <div className="col-span-2">

                                    <label className="mb-2 block text-sm font-medium">
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
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 resize-none"
                                    />

                                </div>

                            </div>

                        </div>

                    )}

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-4 border-t px-8 py-6">

                    <button
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 px-6 py-3"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={saving}
                        onClick={handleSubmit}
                        className="rounded-xl bg-[#17357A] px-6 py-3 font-semibold text-white hover:bg-[#10295d]"
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