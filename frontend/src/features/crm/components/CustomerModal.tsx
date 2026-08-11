import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiX,
} from "react-icons/fi";

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

type Step = 1 | 2 | 3 | 4;

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

const steps = [
  {
    id: 1,
    label: "Basic",
    description: "Contact information",
    icon: FiUser,
  },
  {
    id: 2,
    label: "Address",
    description: "Location & GST",
    icon: FiMapPin,
  },
  {
    id: 3,
    label: "Business",
    description: "CRM classification",
    icon: FiBriefcase,
  },
  {
    id: 4,
    label: "Commercial",
    description: "Terms & balances",
    icon: FiCreditCard,
  },
] as const;

const CustomerModal = ({
  open,
  customer,
  onClose,
  onSuccess,
}: Props) => {
  const [form, setForm] =
    useState<CustomerForm>(emptyForm);

  const [step, setStep] = useState<Step>(1);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const totalSteps = 4;

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setError("");

    if (customer) {
      setForm({
        companyName:
          customer.companyName ?? "",

        contactPerson:
          customer.contactPerson ?? "",

        phone:
          customer.phone ?? "",

        email:
          customer.email ?? "",

        address:
          customer.address ?? "",

        city:
          customer.city ?? "",

        state:
          customer.state ?? "",

        pincode:
          customer.pincode ?? "",

        gstNumber:
          customer.gstNumber ?? "",

        billingName:
          customer.billingName ?? "",

        station:
          customer.station ?? "",

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

  const currentStep = steps[step - 1];

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

    if (error) {
      setError("");
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(
        (step + 1) as Step
      );
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(
        (step - 1) as Step
      );
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSaving(true);
    setError("");

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
      setStep(1);

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to save customer. Please check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-3
        backdrop-blur-md
        sm:p-6
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[94vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-white/60
          bg-white
          shadow-[0_30px_100px_rgba(15,23,42,0.25)]
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header
          className="
            shrink-0
            border-b
            border-slate-100
            bg-white
            px-5
            py-5
            sm:px-7
            sm:py-6
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div className="min-w-0">

              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#172B6B]
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-orange-500
                  "
                />

                CRM
              </div>

              <h2
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-2xl
                "
              >
                {customer
                  ? "Edit Customer"
                  : "Add Customer"}
              </h2>

              <p
                className="
                  mt-1.5
                  max-w-xl
                  text-xs
                  leading-5
                  text-slate-500
                  sm:text-sm
                "
              >
                {customer
                  ? "Update customer information, business classification and commercial terms."
                  : "Create a complete customer profile for your CRM workspace."}
              </p>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                text-slate-400
                transition-all
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              aria-label="Close"
            >
              <FiX size={19} />
            </button>
          </div>
        </header>


        {/* =====================================================
            STEPPER
        ===================================================== */}

        <div
          className="
            shrink-0
            border-b
            border-slate-100
            bg-slate-50/70
            px-4
            py-4
            sm:px-7
            sm:py-5
          "
        >
          <div className="flex items-center">

            {steps.map((item, index) => {
              const Icon = item.icon;

              const completed =
                step > item.id;

              const active =
                step === item.id;

              return (
                <div
                  key={item.id}
                  className="flex min-w-0 flex-1 items-center"
                >

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        item.id < step
                      ) {
                        setStep(
                          item.id as Step
                        );
                      }
                    }}
                    className={`
                      group
                      flex
                      min-w-0
                      items-center
                      gap-2.5
                      text-left
                      ${
                        item.id < step
                          ? "cursor-pointer"
                          : "cursor-default"
                      }
                    `}
                  >

                    <div
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        text-xs
                        font-bold
                        transition-all
                        ${
                          completed
                            ? `
                              border-[#172B6B]
                              bg-[#172B6B]
                              text-white
                            `
                            : active
                            ? `
                              border-[#172B6B]
                              bg-white
                              text-[#172B6B]
                              ring-4
                              ring-blue-50
                            `
                            : `
                              border-slate-200
                              bg-white
                              text-slate-400
                            `
                        }
                      `}
                    >
                      {completed ? (
                        <FiCheck
                          size={16}
                          strokeWidth={2.5}
                        />
                      ) : (
                        <Icon size={15} />
                      )}
                    </div>

                    <div className="hidden min-w-0 lg:block">

                      <p
                        className={`
                          truncate
                          text-xs
                          font-bold
                          ${
                            active ||
                            completed
                              ? "text-slate-900"
                              : "text-slate-400"
                          }
                        `}
                      >
                        {item.label}
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-[10px]
                          text-slate-400
                        "
                      >
                        {item.description}
                      </p>

                    </div>

                  </button>

                  {index !==
                    steps.length - 1 && (
                    <div
                      className={`
                        mx-2
                        h-px
                        flex-1
                        transition-colors
                        duration-300
                        sm:mx-4
                        ${
                          completed
                            ? "bg-[#172B6B]"
                            : "bg-slate-200"
                        }
                      `}
                    />
                  )}

                </div>
              );
            })}

          </div>

          {/* Mobile step label */}

          <div className="mt-3 lg:hidden">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {currentStep.label}
                </p>

                <p className="text-[11px] text-slate-500">
                  {currentStep.description}
                </p>
              </div>

              <span
                className="
                  rounded-full
                  bg-white
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  text-slate-500
                  shadow-sm
                "
              >
                {step} / {totalSteps}
              </span>

            </div>

          </div>
        </div>


        {/* =====================================================
            FORM BODY
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-5
              py-6
              sm:px-7
              sm:py-7
              [scrollbar-color:#CBD5E1_transparent]
              [scrollbar-width:thin]
            "
          >

            {/* Section intro */}

            <div className="mb-6">

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#172B6B]
                "
              >
                Step {step}
              </p>

              <h3
                className="
                  mt-1
                  text-lg
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                {currentStep.label === "Basic" &&
                  "Basic Information"}

                {currentStep.label === "Address" &&
                  "Address & Tax Information"}

                {currentStep.label === "Business" &&
                  "Business Classification"}

                {currentStep.label === "Commercial" &&
                  "Commercial Details"}
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                {currentStep.description}
              </p>

            </div>


            {/* =================================================
                STEP 1
            ================================================= */}

            {step === 1 && (
              <div className="grid gap-5 md:grid-cols-2">

                <Field
                  label="Company Name"
                  required
                >
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Sharma Toys Pvt. Ltd."
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Contact Person"
                  required
                >
                  <input
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    placeholder="Primary contact person"
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Phone"
                  required
                >
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Customer phone number"
                    className={inputClass}
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                    className={inputClass}
                  />
                </Field>

              </div>
            )}


            {/* =================================================
                STEP 2
            ================================================= */}

            {step === 2 && (
              <div className="grid gap-5 md:grid-cols-2">

                <Field
                  label="Address"
                  required
                  className="md:col-span-2"
                >
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Complete business address"
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3
                      text-sm
                      text-slate-800
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-[#172B6B]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />
                </Field>

                <Field label="City">
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={inputClass}
                  />
                </Field>

                <Field label="State">
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={inputClass}
                  />
                </Field>

                <Field label="Pincode">
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    inputMode="numeric"
                    className={inputClass}
                  />
                </Field>

                <Field label="GST Number">
                  <input
                    name="gstNumber"
                    value={form.gstNumber}
                    onChange={handleChange}
                    placeholder="GSTIN"
                    className={inputClass}
                  />
                </Field>

              </div>
            )}


            {/* =================================================
                STEP 3
            ================================================= */}

            {step === 3 && (
              <div className="grid gap-5 md:grid-cols-2">

                <Field label="Billing Name">
                  <input
                    name="billingName"
                    value={form.billingName}
                    onChange={handleChange}
                    placeholder="Name used for billing"
                    className={inputClass}
                  />
                </Field>

                <Field label="Station">
                  <input
                    name="station"
                    value={form.station}
                    onChange={handleChange}
                    placeholder="Business station"
                    className={inputClass}
                  />
                </Field>

                <Field label="Party Type">
                  <SelectInput
                    name="partyType"
                    value={form.partyType}
                    onChange={handleChange}
                  >
                    <option value="CUSTOMER">
                      Customer
                    </option>

                    <option value="SUPPLIER">
                      Supplier
                    </option>
                  </SelectInput>
                </Field>

                <Field label="Status">
                  <SelectInput
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </SelectInput>
                </Field>

                <Field label="CRM Stage">
                  <SelectInput
                    name="stage"
                    value={form.stage}
                    onChange={handleChange}
                  >
                    <option value="LEAD">
                      Lead
                    </option>

                    <option value="RINGING">
                      Ringing
                    </option>

                    <option value="NEGOTIATION">
                      Negotiation
                    </option>

                    <option value="CATALOG_SHARED">
                      Catalog Shared
                    </option>

                    <option value="VERIFICATION">
                      Verification
                    </option>

                    <option value="ACTIVE_DEALER">
                      Active Dealer
                    </option>

                    <option value="SUPPLIER">
                      Supplier
                    </option>

                    <option value="DELAYED_PAYMENT">
                      Delayed Payment
                    </option>

                    <option value="CLOSED">
                      Closed
                    </option>

                    <option value="NO_DEALER">
                      No Dealer
                    </option>
                  </SelectInput>
                </Field>

                <Field label="Customer Category">
                  <SelectInput
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="ONLINE_SELLER">
                      Online Seller
                    </option>

                    <option value="CONTAINER_PARTY">
                      Container Party
                    </option>

                    <option value="LOOSE_PARTY">
                      Loose Party
                    </option>

                    <option value="CAKE_DOLL">
                      Cake Doll
                    </option>

                    <option value="TOY_DEALER">
                      Toy Dealer
                    </option>

                    <option value="OTHER">
                      Other
                    </option>
                  </SelectInput>
                </Field>

              </div>
            )}


            {/* =================================================
                STEP 4
            ================================================= */}

            {step === 4 && (
              <div>

                <div
                  className="
                    mb-5
                    rounded-2xl
                    border
                    border-blue-100
                    bg-blue-50/60
                    p-4
                  "
                >
                  <p className="text-sm font-semibold text-[#172B6B]">
                    Commercial setup
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Define the customer's commercial
                    terms, applicable charges and
                    opening account balance.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">

                  <Field label="Packing Charges">
                    <MoneyInput
                      name="packingCharges"
                      value={form.packingCharges}
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Transport Charges">
                    <MoneyInput
                      name="transportCharges"
                      value={form.transportCharges}
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Payment Terms">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        name="paymentTerms"
                        value={form.paymentTerms}
                        onChange={handleChange}
                        className={`${inputClass} pr-16`}
                      />

                      <span
                        className="
                          pointer-events-none
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-xs
                          font-semibold
                          text-slate-400
                        "
                      >
                        DAYS
                      </span>
                    </div>
                  </Field>

                  <Field label="Opening Balance">
                    <MoneyInput
                      name="openingBalance"
                      value={form.openingBalance}
                      onChange={handleChange}
                    />
                  </Field>

                </div>

              </div>
            )}


            {/* Error */}

            {error && (
              <div
                className="
                  mt-6
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-red-700
                "
              >
                {error}
              </div>
            )}

          </div>


          {/* ===================================================
              FOOTER
          =================================================== */}

          <footer
            className="
              shrink-0
              border-t
              border-slate-100
              bg-white
              px-5
              py-4
              sm:px-7
            "
          >
            <div className="flex items-center justify-between gap-3">

              <button
                type="button"
                disabled={saving}
                onClick={
                  step === 1
                    ? onClose
                    : previousStep
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-semibold
                  text-slate-600
                  transition-all
                  hover:border-slate-300
                  hover:bg-slate-50
                  hover:text-slate-900
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {step === 1 ? (
                  <>
                    <FiX size={16} />
                    Cancel
                  </>
                ) : (
                  <>
                    <FiArrowLeft size={16} />
                    Back
                  </>
                )}
              </button>


              <div className="flex items-center gap-2">

                <span
                  className="
                    hidden
                    text-xs
                    font-medium
                    text-slate-400
                    sm:block
                  "
                >
                  Step {step} of {totalSteps}
                </span>

                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#172B6B]
                      px-5
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition-all
                      hover:bg-[#20398F]
                      hover:shadow-md
                      active:scale-[0.98]
                    "
                  >
                    Continue
                    <FiArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      inline-flex
                      h-11
                      min-w-[150px]
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#172B6B]
                      px-5
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition-all
                      hover:bg-[#20398F]
                      hover:shadow-md
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {saving ? (
                      <>
                        <span
                          className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-white/30
                            border-t-white
                          "
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheck size={16} />
                        {customer
                          ? "Update Customer"
                          : "Create Customer"}
                      </>
                    )}
                  </button>
                )}

              </div>

            </div>
          </footer>

        </form>

      </div>
    </div>
  );
};


/* =============================================================
   REUSABLE FORM COMPONENTS
============================================================= */

const inputClass = `
  h-12
  w-full
  rounded-xl
  border
  border-slate-200
  bg-slate-50
  px-4
  text-sm
  text-slate-800
  outline-none
  transition-all
  placeholder:text-slate-400
  hover:border-slate-300
  focus:border-[#172B6B]
  focus:bg-white
  focus:ring-4
  focus:ring-blue-50
`;

interface FieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Field = ({
  label,
  required,
  className = "",
  children,
}: FieldProps) => {
  return (
    <div className={className}>
      <label
        className="
          mb-2
          block
          text-xs
          font-bold
          tracking-wide
          text-slate-700
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-orange-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
};


interface SelectInputProps {
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  children: React.ReactNode;
}

const SelectInput = ({
  name,
  value,
  onChange,
  children,
}: SelectInputProps) => {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
          ${inputClass}
          appearance-none
          pr-10
        `}
      >
        {children}
      </select>

      <FiChevronDown
        size={16}
        className="
          pointer-events-none
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-slate-400
        "
      />
    </div>
  );
};


interface MoneyInputProps {
  name: string;
  value: number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const MoneyInput = ({
  name,
  value,
  onChange,
}: MoneyInputProps) => {
  return (
    <div className="relative">

      <span
        className="
          pointer-events-none
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-sm
          font-semibold
          text-slate-400
        "
      >
        ₹
      </span>

      <input
        type="number"
        min="0"
        name={name}
        value={value}
        onChange={onChange}
        className={`
          ${inputClass}
          pl-9
        `}
      />

    </div>
  );
};

export default CustomerModal;