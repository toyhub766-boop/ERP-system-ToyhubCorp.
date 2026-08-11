import {
  FiActivity,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiCreditCard,
  FiEdit3,
  FiFileText,
  FiMapPin,
  FiMail,
  FiPackage,
  FiPhone,
  FiPlus,
  FiTrash2,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import { exportCustomerPortfolio } from "../services/customerPdf";

interface Props {
  customer: any;
  orders: any[];

  onEdit: (customer: any) => void;
  onDelete: (customer: any) => void;

  onCreateOrder: (customer: any) => void;

  onAddNote: () => void;

  onRecordPayment: (customer: any) => void;
}


/* ============================================================
   HELPERS
============================================================ */

const formatCurrency = (value: any) => {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitial = (name?: string) => {
  return (
    name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "C"
  );
};


/* ============================================================
   STATUS
============================================================ */

const StatusBadge = ({
  status,
}: {
  status?: string;
}) => {
  const active = status === "Active";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-bold
        ${
          active
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${active ? "bg-emerald-500" : "bg-red-500"}
        `}
      />

      {status || "Unknown"}
    </span>
  );
};


/* ============================================================
   SECTION
============================================================ */

interface SectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const Section = ({
  title,
  subtitle,
  icon,
  children,
  action,
  className = "",
}: SectionProps) => {
  return (
    <section
      className={`
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        ${className}
      `}
    >
      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-slate-100
          px-5
          py-5
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <div className="flex items-start gap-3">

          {icon && (
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-[#172B6B]
              "
            >
              {icon}
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
};


/* ============================================================
   INFO ITEM
============================================================ */

const InfoItem = ({
  label,
  value,
  icon,
  full = false,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  full?: boolean;
}) => {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p
        className="
          mb-1.5
          text-[10px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-slate-400
        "
      >
        {label}
      </p>

      <div className="flex items-start gap-2">

        {icon && (
          <span className="mt-0.5 shrink-0 text-slate-400">
            {icon}
          </span>
        )}

        <p
          className="
            min-w-0
            break-words
            text-sm
            font-semibold
            leading-6
            text-slate-800
          "
        >
          {value || "-"}
        </p>

      </div>
    </div>
  );
};


/* ============================================================
   MAIN
============================================================ */

const CustomerProfile = ({
  customer,
  orders,
  onEdit,
  onDelete,
  onCreateOrder,
  onAddNote,
  onRecordPayment,
}: Props) => {
  if (!customer) {
    return (
      <div
        className="
          flex
          min-h-[650px]
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-slate-300
          bg-white
          px-6
          text-center
        "
      >
        <div>

          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-slate-100
              text-slate-400
            "
          >
            <FiUsers size={28} />
          </div>

          <h3 className="mt-5 text-base font-bold text-slate-800">
            Select a customer
          </h3>

          <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
            Choose a customer from the list to view their complete CRM profile.
          </p>

        </div>
      </div>
    );
  }


  const outstanding = Number(
    customer.currentBalance || 0
  );

  const isOutstanding = outstanding > 0;

  return (
    <div className="space-y-5 sm:space-y-6">


      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_4px_20px_rgba(15,23,42,0.06)]
        "
      >

        {/* Blue hero */}

        <div
          className="
            relative
            overflow-hidden
            bg-[#172B6B]
            px-5
            py-7
            text-white
            sm:px-7
            sm:py-8
          "
        >

          {/* Decorative elements */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-24
              h-64
              w-64
              rounded-full
              border-[40px]
              border-white/[0.035]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              right-24
              h-72
              w-72
              rounded-full
              border-[50px]
              border-white/[0.025]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-7
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            {/* Identity */}

            <div className="flex min-w-0 items-start gap-4 sm:gap-5">

              <div
                className="
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/15
                  bg-white/10
                  text-2xl
                  font-bold
                  shadow-inner
                  sm:h-20
                  sm:w-20
                  sm:text-3xl
                "
              >
                {getInitial(
                  customer.companyName
                )}
              </div>

              <div className="min-w-0">

                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >

                  <h1
                    className="
                      max-w-full
                      truncate
                      text-2xl
                      font-bold
                      tracking-tight
                      sm:text-3xl
                    "
                  >
                    {customer.companyName}
                  </h1>

                  <StatusBadge
                    status={customer.status}
                  />

                </div>

                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    items-center
                    gap-x-4
                    gap-y-1.5
                    text-sm
                    text-blue-100
                  "
                >
                  <span className="flex items-center gap-1.5">
                    <FiUser size={14} />
                    {customer.contactPerson || "No contact person"}
                  </span>

                  {customer.phone && (
                    <span className="flex items-center gap-1.5">
                      <FiPhone size={14} />
                      {customer.phone}
                    </span>
                  )}
                </div>

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {[
                    customer.customerCode,
                    customer.stage,
                    customer.category,
                    customer.partyType,
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <span
                        key={item}
                        className="
                          rounded-lg
                          border
                          border-white/10
                          bg-white/[0.08]
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          text-blue-50
                        "
                      >
                        {item}
                      </span>
                    ))}

                </div>

              </div>

            </div>


            {/* Financial KPIs */}

            <div
              className="
                grid
                grid-cols-2
                gap-2
                sm:gap-3
                lg:min-w-[360px]
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.08]
                  px-4
                  py-4
                  backdrop-blur-sm
                  sm:px-5
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-blue-200
                  "
                >
                  Outstanding
                </p>

                <p
                  className="
                    mt-2
                    text-xl
                    font-bold
                    tracking-tight
                    sm:text-2xl
                  "
                >
                  ₹{formatCurrency(outstanding)}
                </p>

                <p className="mt-1 text-[10px] text-blue-200">
                  {isOutstanding
                    ? "Payment pending"
                    : "Account clear"}
                </p>
              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.08]
                  px-4
                  py-4
                  backdrop-blur-sm
                  sm:px-5
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-blue-200
                  "
                >
                  Total Orders
                </p>

                <p
                  className="
                    mt-2
                    text-xl
                    font-bold
                    tracking-tight
                    sm:text-2xl
                  "
                >
                  {orders.length}
                </p>

                <p className="mt-1 text-[10px] text-blue-200">
                  Customer orders
                </p>
              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
            ACTION BAR
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-slate-100
            bg-white
            p-4
            sm:flex-row
            sm:flex-wrap
            sm:items-center
            sm:p-5
          "
        >

          <button
            onClick={() => onEdit(customer)}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#172B6B]
              px-4
              text-xs
              font-bold
              text-white
              shadow-sm
              transition-all
              hover:bg-[#20398F]
              hover:shadow-md
              active:scale-[0.98]
            "
          >
            <FiEdit3 size={15} />
            Edit Customer
          </button>


          <button
            onClick={onAddNote}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              px-4
              text-xs
              font-bold
              text-amber-700
              transition-all
              hover:bg-amber-100
              active:scale-[0.98]
            "
          >
            <FiActivity size={15} />
            Add Activity
          </button>


          <button
            onClick={() => onCreateOrder(customer)}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-emerald-200
              bg-emerald-50
              px-4
              text-xs
              font-bold
              text-emerald-700
              transition-all
              hover:bg-emerald-100
              active:scale-[0.98]
            "
          >
            <FiPlus size={15} />
            New Order
          </button>


          <button
            onClick={() =>
              onRecordPayment(customer)
            }
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-blue-200
              bg-blue-50
              px-4
              text-xs
              font-bold
              text-blue-700
              transition-all
              hover:bg-blue-100
              active:scale-[0.98]
            "
          >
            <FiCreditCard size={15} />
            Record Payment
          </button>


          <div className="hidden h-6 w-px bg-slate-200 sm:block" />


          <button
            onClick={() =>
              exportCustomerPortfolio(
                customer,
                orders
              )
            }
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-xs
              font-bold
              text-slate-700
              transition-all
              hover:border-slate-300
              hover:bg-slate-50
              active:scale-[0.98]
            "
          >
            <FiFileText size={15} />
            Export Portfolio
          </button>


          <button
            onClick={() => onDelete(customer)}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              px-3
              text-xs
              font-bold
              text-red-500
              transition-all
              hover:bg-red-50
              hover:text-red-600
              active:scale-[0.98]
              sm:ml-auto
            "
          >
            <FiTrash2 size={15} />
            Delete
          </button>

        </div>

      </section>


      {/* ======================================================
          CONTACT + BUSINESS
      ====================================================== */}

      <div className="grid gap-5 xl:grid-cols-2">


        {/* Contact */}

        <Section
          title="Contact Information"
          subtitle="Primary communication and registration details."
          icon={<FiUser size={17} />}
        >

          <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">

            <InfoItem
              label="Contact Person"
              value={
                customer.contactPerson
              }
              icon={<FiUser size={14} />}
            />

            <InfoItem
              label="Phone"
              value={customer.phone}
              icon={<FiPhone size={14} />}
            />

            <InfoItem
              label="Email"
              value={customer.email}
              icon={<FiMail size={14} />}
            />

            <InfoItem
              label="GST Number"
              value={customer.gstNumber}
              icon={<FiFileText size={14} />}
            />

            <InfoItem
              label="Address"
              value={customer.address}
              icon={<FiMapPin size={14} />}
              full
            />

            <div className="sm:col-span-2">

              <p
                className="
                  mb-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Location
              </p>

              <div className="flex flex-wrap gap-2">

                {[
                  customer.city,
                  customer.state,
                  customer.pincode,
                ]
                  .filter(Boolean)
                  .map((item) => (
                    <span
                      key={item}
                      className="
                        rounded-lg
                        border
                        border-slate-200
                        bg-slate-50
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-slate-600
                      "
                    >
                      {item}
                    </span>
                  ))}

              </div>

            </div>

          </div>

        </Section>


        {/* Business */}

        <Section
          title="Business Information"
          subtitle="CRM classification and customer profile."
          icon={<FiBriefcase size={17} />}
        >

          <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">

            <InfoItem
              label="Billing Name"
              value={customer.billingName}
            />

            <InfoItem
              label="Station"
              value={customer.station}
            />

            <InfoItem
              label="Party Type"
              value={
                <span
                  className="
                    inline-flex
                    rounded-lg
                    bg-blue-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-bold
                    text-blue-700
                  "
                >
                  {customer.partyType || "-"}
                </span>
              }
            />

            <InfoItem
              label="CRM Stage"
              value={
                <span
                  className="
                    inline-flex
                    rounded-lg
                    bg-amber-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-bold
                    text-amber-700
                  "
                >
                  {customer.stage || "-"}
                </span>
              }
            />

            <InfoItem
              label="Category"
              value={customer.category}
            />

            <InfoItem
              label="Account Status"
              value={
                <StatusBadge
                  status={customer.status}
                />
              }
            />

          </div>

        </Section>

      </div>


      {/* ======================================================
          COMMERCIAL
      ====================================================== */}

      <Section
        title="Commercial Information"
        subtitle="Pricing, payment terms and account balances."
        icon={<FiCreditCard size={17} />}
      >

        <div
          className="
            grid
            gap-3
            sm:grid-cols-2
            lg:grid-cols-5
          "
        >

          <CommercialCard
            label="Packing Charges"
            value={`₹${formatCurrency(
              customer.packingCharges
            )}`}
          />

          <CommercialCard
            label="Transport Charges"
            value={`₹${formatCurrency(
              customer.transportCharges
            )}`}
          />

          <CommercialCard
            label="Payment Terms"
            value={`${customer.paymentTerms || 0} Days`}
          />

          <CommercialCard
            label="Opening Balance"
            value={`₹${formatCurrency(
              customer.openingBalance
            )}`}
          />

          <CommercialCard
            label="Outstanding"
            value={`₹${formatCurrency(
              customer.currentBalance
            )}`}
            danger={isOutstanding}
          />

        </div>

      </Section>


      {/* ======================================================
          CRM TIMELINE
      ====================================================== */}

      <Section
        title="CRM Activity Timeline"
        subtitle="Meetings, follow-ups, payments and customer interactions."
        icon={<FiActivity size={17} />}
        action={
          <button
            onClick={onAddNote}
            className="
              inline-flex
              h-9
              items-center
              justify-center
              gap-1.5
              rounded-xl
              bg-[#172B6B]
              px-3.5
              text-xs
              font-bold
              text-white
              transition
              hover:bg-[#20398F]
            "
          >
            <FiPlus size={14} />
            Add Activity
          </button>
        }
      >

        {!customer.specialNotes?.length ? (

          <EmptyState
            icon={<FiActivity size={24} />}
            title="No CRM activity yet"
            description="Start recording meetings, follow-ups and customer interactions."
            action={
              <button
                onClick={onAddNote}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#172B6B]
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  transition
                  hover:bg-[#20398F]
                "
              >
                <FiPlus size={14} />
                Add First Activity
              </button>
            }
          />

        ) : (

          <div className="relative">

            {/* Timeline line */}

            <div
              className="
                absolute
                bottom-5
                left-[19px]
                top-5
                w-px
                bg-slate-200
              "
            />

            <div className="space-y-6">

              {customer.specialNotes.map(
                (note: any) => (

                  <div
                    key={note._id}
                    className="
                      relative
                      flex
                      gap-4
                    "
                  >

                    <div
                      className="
                        relative
                        z-10
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-[#172B6B]
                        shadow-sm
                      "
                    >
                      <ActivityIcon
                        type={note.type}
                      />
                    </div>


                    <div
                      className="
                        min-w-0
                        flex-1
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50/50
                        p-4
                        transition-all
                        hover:border-slate-300
                        hover:bg-white
                        hover:shadow-sm
                        sm:p-5
                      "
                    >

                      <div
                        className="
                          flex
                          flex-col
                          gap-3
                          sm:flex-row
                          sm:items-start
                          sm:justify-between
                        "
                      >

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h4
                              className="
                                text-sm
                                font-bold
                                text-slate-900
                              "
                            >
                              {note.title ||
                                "CRM Activity"}
                            </h4>

                            <ActivityBadge
                              type={note.type}
                            />

                          </div>

                          {note.note && (
                            <p
                              className="
                                mt-3
                                whitespace-pre-wrap
                                text-sm
                                leading-6
                                text-slate-600
                              "
                            >
                              {note.note}
                            </p>
                          )}

                        </div>

                        <PriorityBadge
                          priority={note.priority}
                        />

                      </div>


                      <div
                        className="
                          mt-4
                          flex
                          flex-wrap
                          items-center
                          gap-x-5
                          gap-y-2
                          border-t
                          border-slate-200
                          pt-3
                          text-[11px]
                          text-slate-400
                        "
                      >

                        <span className="flex items-center gap-1.5">
                          <FiClock size={12} />
                          {formatDateTime(
                            note.createdAt
                          )}
                        </span>

                        {note.reminderDate && (
                          <span className="flex items-center gap-1.5 font-semibold text-blue-600">
                            <FiCalendar size={12} />
                            Reminder{" "}
                            {formatDate(
                              note.reminderDate
                            )}
                          </span>
                        )}

                        {note.completed && (
                          <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                            <FiCheckCircle size={12} />
                            Completed
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </Section>


      {/* ======================================================
          ORDERS
      ====================================================== */}

      <Section
        title="Recent Orders"
        subtitle="Latest orders associated with this customer."
        icon={<FiPackage size={17} />}
        action={
          orders.length > 0 ? (
            <button
              onClick={() =>
                onCreateOrder(customer)
              }
              className="
                inline-flex
                h-9
                items-center
                gap-1.5
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3.5
                text-xs
                font-bold
                text-slate-700
                transition
                hover:bg-slate-50
              "
            >
              <FiPlus size={14} />
              New Order
            </button>
          ) : null
        }
      >

        {!orders.length ? (

          <EmptyState
            icon={<FiPackage size={24} />}
            title="No orders yet"
            description="Create the first order for this customer to start tracking sales activity."
            action={
              <button
                onClick={() =>
                  onCreateOrder(customer)
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#172B6B]
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  transition
                  hover:bg-[#20398F]
                "
              >
                <FiPlus size={14} />
                Create Order
              </button>
            }
          />

        ) : (

          <div className="space-y-3">

            {orders.slice(0, 5).map(
              (order: any) => (

                <div
                  key={order._id}
                  className="
                    group
                    flex
                    flex-col
                    gap-4
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    transition-all
                    hover:border-slate-300
                    hover:shadow-sm
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:p-5
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-500
                        transition
                        group-hover:bg-blue-50
                        group-hover:text-[#172B6B]
                      "
                    >
                      <FiPackage size={18} />
                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <h4 className="truncate text-sm font-bold text-slate-900">
                          {order.orderNumber ||
                            "Order"}
                        </h4>

                        <OrderStatus
                          status={order.status}
                        />

                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Created{" "}
                        {formatDate(
                          order.createdAt
                        )}
                      </p>

                    </div>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-5
                      sm:justify-end
                    "
                  >

                    {order.totalAmount !==
                      undefined && (
                      <div className="text-right">

                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Order Value
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-900">
                          ₹
                          {formatCurrency(
                            order.totalAmount
                          )}
                        </p>

                      </div>
                    )}

                    <FiChevronRight
                      size={17}
                      className="
                        text-slate-300
                        transition
                        group-hover:translate-x-0.5
                        group-hover:text-slate-500
                      "
                    />

                  </div>

                </div>

              )
            )}

            {orders.length > 5 && (
              <div className="pt-2 text-center">

                <span
                  className="
                    text-xs
                    font-semibold
                    text-slate-400
                  "
                >
                  Showing latest 5 of{" "}
                  {orders.length} orders
                </span>

              </div>
            )}

          </div>

        )}

      </Section>

    </div>
  );
};


/* ============================================================
   COMMERCIAL CARD
============================================================ */

const CommercialCard = ({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) => {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-4
        ${
          danger
            ? "border-red-100 bg-red-50"
            : "border-slate-100 bg-slate-50"
        }
      `}
    >
      <p
        className={`
          text-[10px]
          font-bold
          uppercase
          tracking-[0.1em]
          ${
            danger
              ? "text-red-500"
              : "text-slate-400"
          }
        `}
      >
        {label}
      </p>

      <p
        className={`
          mt-2
          truncate
          text-lg
          font-bold
          tracking-tight
          ${
            danger
              ? "text-red-600"
              : "text-slate-900"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
};


/* ============================================================
   EMPTY STATE
============================================================ */

const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-slate-200
        bg-slate-50/50
        px-6
        py-12
        text-center
      "
    >

      <div
        className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-white
          text-slate-400
          shadow-sm
        "
      >
        {icon}
      </div>

      <h4 className="mt-4 text-sm font-bold text-slate-800">
        {title}
      </h4>

      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}

    </div>
  );
};


/* ============================================================
   ACTIVITY ICON
============================================================ */

const ActivityIcon = ({
  type,
}: {
  type?: string;
}) => {
  if (type === "MEETING") {
    return <FiUsers size={17} />;
  }

  if (type === "FOLLOW_UP") {
    return <FiPhone size={17} />;
  }

  if (type === "PAYMENT") {
    return <FiCreditCard size={17} />;
  }

  if (type === "PRODUCT") {
    return <FiPackage size={17} />;
  }

  if (type === "COMPLAINT") {
    return <FiXCircle size={17} />;
  }

  return <FiFileText size={17} />;
};


/* ============================================================
   ACTIVITY BADGE
============================================================ */

const ActivityBadge = ({
  type,
}: {
  type?: string;
}) => {
  const labels: Record<string, string> = {
    MEETING: "Meeting",
    FOLLOW_UP: "Follow-up",
    PAYMENT: "Payment",
    PRODUCT: "Product",
    COMPLAINT: "Complaint",
    GENERAL: "General",
  };

  return (
    <span
      className="
        rounded-lg
        bg-slate-100
        px-2
        py-1
        text-[10px]
        font-bold
        text-slate-600
      "
    >
      {labels[type || "GENERAL"] ||
        type ||
        "General"}
    </span>
  );
};


/* ============================================================
   PRIORITY BADGE
============================================================ */

const PriorityBadge = ({
  priority,
}: {
  priority?: string;
}) => {
  const styles =
    priority === "HIGH"
      ? "bg-red-50 text-red-600 border-red-100"
      : priority === "MEDIUM"
      ? "bg-amber-50 text-amber-600 border-amber-100"
      : "bg-emerald-50 text-emerald-600 border-emerald-100";

  return (
    <span
      className={`
        inline-flex
        shrink-0
        rounded-lg
        border
        px-2.5
        py-1
        text-[10px]
        font-bold
        ${styles}
      `}
    >
      {priority || "LOW"}
    </span>
  );
};


/* ============================================================
   ORDER STATUS
============================================================ */

const OrderStatus = ({
  status,
}: {
  status?: string;
}) => {
  const normalized =
    status?.toLowerCase();

  let style =
    "bg-slate-100 text-slate-600";

  if (
    normalized === "completed" ||
    normalized === "delivered"
  ) {
    style =
      "bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "pending" ||
    normalized === "processing"
  ) {
    style =
      "bg-amber-50 text-amber-700";
  }

  if (
    normalized === "cancelled" ||
    normalized === "cancelled"
  ) {
    style =
      "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`
        hidden
        rounded-md
        px-2
        py-0.5
        text-[9px]
        font-bold
        sm:inline-flex
        ${style}
      `}
    >
      {status || "Unknown"}
    </span>
  );
};


export default CustomerProfile;