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

const CustomerProfile = ({
  customer,
  orders,
  onEdit,
  onDelete,
  onCreateOrder,
  onAddNote,
}: Props) => {

  if (!customer) {
    return (
      <div className="flex h-full min-h-[700px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-slate-500">

        Select a customer to view the portfolio.

      </div>
    );
  }

    return (
  <div className="space-y-8">

    {/* ================= HERO ================= */}

    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      <div className="bg-gradient-to-r from-[#172B6B] via-[#234291] to-[#3366CC] p-8 text-white">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          {/* Left */}

          <div className="flex items-center gap-6">

            <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-4xl font-bold">

              {customer.companyName?.charAt(0)}

            </div>

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-3xl font-bold">

                  {customer.companyName}

                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold

                  ${
                    customer.status === "Active"
                      ? "bg-green-500/20 text-green-100"
                      : "bg-red-500/20 text-red-100"
                  }`}
                >
                  {customer.status}
                </span>

              </div>

              <p className="mt-2 text-blue-100">

                {customer.contactPerson}

              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">

                  {customer.customerCode}

                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">

                  {customer.stage}

                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">

                  {customer.category}

                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">

                  {customer.partyType}

                </span>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-5">

              <p className="text-xs uppercase tracking-wide text-blue-100">

                Outstanding

              </p>

              <h2 className="mt-2 text-3xl font-bold">

                ₹{customer.currentBalance || 0}

              </h2>

            </div>

            <div className="rounded-2xl bg-white/10 p-5">

              <p className="text-xs uppercase tracking-wide text-blue-100">

                Orders

              </p>

              <h2 className="mt-2 text-3xl font-bold">

                {orders.length}

              </h2>

            </div>

          </div>

        </div>

      </div>

      {/* Action Bar */}

      <div className="flex flex-wrap gap-3 border-t border-slate-200 bg-slate-50 p-5">

        <button
          onClick={() => onEdit(customer)}
          className="rounded-xl bg-[#172B6B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#20398F]"
        >
          Edit Customer
        </button>

        <button
          onClick={onAddNote}
          className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600"
        >
          + Add CRM Activity
        </button>

        <button
          onClick={() => onCreateOrder(customer)}
          className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          + New Order
        </button>

        <button
          onClick={() => onDelete(customer)}
          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
        >
          Delete
        </button>

        <button
  onClick={() =>
    exportCustomerPortfolio(
      customer,
      orders
    )
  }
  className="
    rounded-xl
    bg-slate-800
    px-5
    py-3
    text-sm
    font-semibold
    text-white
    transition
    hover:bg-slate-900
  "
>
  Export Portfolio
</button>

      </div>

    </div>

    {/* ================= CUSTOMER PORTFOLIO ================= */}

    <div className="grid gap-6 xl:grid-cols-2">
            {/* ================= CONTACT INFORMATION ================= */}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <h3 className="mb-6 text-xl font-bold text-slate-900">
          Contact Information
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Contact Person
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {customer.contactPerson || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Phone
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {customer.phone || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Email
            </p>
            <p className="mt-1 break-all font-semibold text-slate-800">
              {customer.email || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              GST Number
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {customer.gstNumber || "-"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Address
            </p>

            <p className="mt-1 leading-relaxed text-slate-700">
              {customer.address || "-"}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {customer.city} {customer.state} {customer.pincode}
            </p>

          </div>

        </div>

      </div>

      {/* ================= BUSINESS DETAILS ================= */}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <h3 className="mb-6 text-xl font-bold text-slate-900">
          Business Information
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Billing Name
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {customer.billingName || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Station
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {customer.station || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Party Type
            </p>

            <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {customer.partyType}
            </span>

          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Stage
            </p>

            <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {customer.stage}
            </span>

          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Category
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {customer.category}
            </p>

          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                customer.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer.status}
            </span>

          </div>

        </div>

      </div>

    </div>

    {/* ================= COMMERCIAL DETAILS ================= */}

    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h3 className="mb-6 text-xl font-bold text-slate-900">
        Commercial Information
      </h3>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-xs uppercase tracking-wide text-slate-400">
            Packing
          </p>

          <h4 className="mt-3 text-2xl font-bold text-slate-900">
            ₹{customer.packingCharges}
          </h4>

        </div>

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-xs uppercase tracking-wide text-slate-400">
            Transport
          </p>

          <h4 className="mt-3 text-2xl font-bold text-slate-900">
            ₹{customer.transportCharges}
          </h4>

        </div>

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-xs uppercase tracking-wide text-slate-400">
            Payment Terms
          </p>

          <h4 className="mt-3 text-2xl font-bold text-slate-900">
            {customer.paymentTerms} Days
          </h4>

        </div>

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-xs uppercase tracking-wide text-slate-400">
            Opening Balance
          </p>

          <h4 className="mt-3 text-2xl font-bold text-slate-900">
            ₹{customer.openingBalance}
          </h4>

        </div>

        <div className="rounded-2xl bg-red-50 p-5">

          <p className="text-xs uppercase tracking-wide text-red-500">
            Outstanding
          </p>

          <h4 className="mt-3 text-2xl font-bold text-red-600">
            ₹{customer.currentBalance}
          </h4>

        </div>

      </div>

    </div>
        {/* ================= CRM TIMELINE ================= */}

    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h3 className="text-xl font-bold text-slate-900">
            CRM Activity Timeline
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Meetings, follow-ups, payments and customer interactions.
          </p>

        </div>

        <button
          onClick={onAddNote}
          className="rounded-xl bg-[#172B6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20398F]"
        >
          + Add CRM Activity
        </button>

      </div>

      <div className="p-6">

        {!customer.specialNotes?.length ? (

          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">

            <div className="text-5xl">
              📝
            </div>

            <h4 className="mt-5 text-xl font-bold text-slate-800">
              No CRM Activity Yet
            </h4>

            <p className="mt-2 text-slate-500">
              Start recording meetings and follow ups.
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {customer.specialNotes.map((note: any) => (

              <div
                key={note._id}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-[#172B6B]/30 hover:shadow-sm"
              >

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                  <div className="flex gap-4">

                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#172B6B]/10 text-xl">

                      {note.type === "MEETING" && "🤝"}
                      {note.type === "FOLLOW_UP" && "📞"}
                      {note.type === "PAYMENT" && "💰"}
                      {note.type === "PRODUCT" && "📦"}
                      {note.type === "COMPLAINT" && "⚠️"}
                      {note.type === "GENERAL" && "📝"}

                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h4 className="text-lg font-bold text-slate-900">

                          {note.title || "CRM Activity"}

                        </h4>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">

                          {note.type}

                        </span>

                      </div>

                      <p className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-700">

                        {note.note}

                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">

                        <span>

                          {new Date(
                            note.createdAt
                          ).toLocaleString()}

                        </span>

                        {note.reminderDate && (

                          <span className="font-medium text-blue-600">

                            Reminder:
                            {" "}
                            {new Date(
                              note.reminderDate
                            ).toLocaleDateString()}

                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                  <div>

                    <span
                      className={`rounded-full px-3 py-2 text-xs font-bold

                      ${
                        note.priority === "HIGH"
                          ? "bg-red-100 text-red-700"

                          : note.priority === "MEDIUM"

                          ? "bg-amber-100 text-amber-700"

                          : "bg-green-100 text-green-700"
                      }`}
                    >

                      {note.priority}

                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

    {/* ================= RECENT ORDERS ================= */}

    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 p-6">

        <h3 className="text-xl font-bold text-slate-900">
          Recent Orders
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Latest orders from this customer.
        </p>

      </div>

      <div className="p-6">

        {!orders.length ? (

          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">

            <div className="text-5xl">
              📦
            </div>

            <h4 className="mt-5 text-xl font-bold text-slate-800">
              No Orders Yet
            </h4>

          </div>

        ) : (

          <div className="space-y-4">

            {orders.slice(0, 5).map((order: any) => (

              <div
                key={order._id}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-[#172B6B]/30"
              >

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div>

                    <h4 className="text-lg font-bold">

                      {order.orderNumber}

                    </h4>

                    <p className="mt-1 text-sm text-slate-500">

                      {order.status}

                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-sm text-slate-500">

                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : "-"}

                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  </div>
);
};

export default CustomerProfile;
