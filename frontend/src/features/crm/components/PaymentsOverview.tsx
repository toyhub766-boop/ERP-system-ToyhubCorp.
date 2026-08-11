import {
  FiCalendar,
  FiCheckCircle,
  FiCreditCard,
  FiEdit2,
  FiFileText,
  FiTrash2,
} from "react-icons/fi";

interface Props {
  payments: any[];
  onEdit: (payment: any) => void;
  onDelete: (payment: any) => void;
}

const formatAmount = (value: any) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value: any) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PaymentsOverview = ({
  payments,
  onEdit,
  onDelete,
}: Props) => {
  const totalReceived = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.amountPaid || 0),
    0
  );

  return (
    <div
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* ================= HEADER ================= */}

      <div
        className="
          border-b
          border-slate-100
          px-5
          py-5
          sm:px-7
          sm:py-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* Title */}

          <div className="flex items-start gap-3.5">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-emerald-50
                text-emerald-600
              "
            >
              <FiCreditCard size={20} />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-2xl
                "
              >
                Payments
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  leading-5
                  text-slate-500
                "
              >
                Payment history, receipts and transaction
                records.
              </p>
            </div>
          </div>

          {/* Summary */}

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <div
              className="
                min-w-[120px]
                rounded-2xl
                border
                border-slate-100
                bg-slate-50
                px-4
                py-3
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Transactions
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                {payments.length}
              </p>
            </div>

            <div
              className="
                min-w-[160px]
                rounded-2xl
                border
                border-emerald-100
                bg-emerald-50/70
                px-4
                py-3
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-emerald-600
                "
              >
                Total Received
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-emerald-700
                "
              >
                ₹{formatAmount(totalReceived)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="p-4 sm:p-6">
        {payments.length === 0 ? (
          <div
            className="
              flex
              min-h-[340px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-slate-200
              bg-slate-50/70
              px-6
              text-center
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-slate-400
                shadow-sm
                ring-1
                ring-slate-100
              "
            >
              <FiCreditCard size={26} />
            </div>

            <h3
              className="
                mt-5
                text-base
                font-bold
                text-slate-800
              "
            >
              No Payments Found
            </h3>

            <p
              className="
                mt-1.5
                max-w-sm
                text-sm
                leading-5
                text-slate-500
              "
            >
              Payment records will appear here once a
              transaction has been recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  transition-all
                  duration-200
                  hover:border-slate-300
                  hover:shadow-md
                  sm:p-5
                "
              >
                {/* TOP ROW */}

                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  "
                >
                  {/* Amount */}

                  <div className="flex items-center gap-3.5">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-50
                        text-emerald-600
                      "
                    >
                      <FiCheckCircle size={19} />
                    </div>

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-slate-400
                        "
                      >
                        Amount Paid
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-2xl
                          font-bold
                          tracking-tight
                          text-[#172B6B]
                          sm:text-3xl
                        "
                      >
                        ₹{formatAmount(
                          payment.amountPaid
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Payment date */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-slate-100
                      bg-slate-50
                      px-4
                      py-3
                      lg:min-w-[190px]
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-slate-500
                        shadow-sm
                      "
                    >
                      <FiCalendar size={16} />
                    </div>

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-slate-400
                        "
                      >
                        Payment Date
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-sm
                          font-semibold
                          text-slate-800
                        "
                      >
                        {formatDate(
                          payment.paymentDate
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DETAILS */}

                <div
                  className="
                    mt-4
                    grid
                    gap-3
                    border-t
                    border-slate-100
                    pt-4
                    sm:grid-cols-2
                  "
                >
                  {/* Payment method */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      bg-slate-50/70
                      px-3.5
                      py-3
                    "
                  >
                    <FiCreditCard
                      size={16}
                      className="text-slate-400"
                    />

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-slate-400
                        "
                      >
                        Payment Method
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-sm
                          font-semibold
                          text-slate-700
                        "
                      >
                        {payment.paymentMethod ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Order */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      bg-slate-50/70
                      px-3.5
                      py-3
                    "
                  >
                    <FiFileText
                      size={16}
                      className="text-slate-400"
                    />

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-slate-400
                        "
                      >
                        Order
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-sm
                          font-semibold
                          text-slate-700
                        "
                      >
                        {payment.order?.orderNumber ||
                          "Order linked"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* REMARKS */}

                <div
                  className="
                    mt-3
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50/50
                    px-4
                    py-3
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-400
                    "
                  >
                    Remarks
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-5
                      text-slate-600
                    "
                  >
                    {payment.remarks ||
                      "No remarks available."}
                  </p>
                </div>

                {/* ACTIONS */}

                <div
                  className="
                    mt-4
                    flex
                    flex-col-reverse
                    gap-2
                    border-t
                    border-slate-100
                    pt-4
                    sm:flex-row
                    sm:justify-end
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      onDelete(payment)
                    }
                    className="
                      inline-flex
                      h-10
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-red-100
                      bg-white
                      px-4
                      text-sm
                      font-semibold
                      text-red-600
                      transition
                      hover:bg-red-50
                      hover:border-red-200
                    "
                  >
                    <FiTrash2 size={15} />
                    Delete
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onEdit(payment)
                    }
                    className="
                      inline-flex
                      h-10
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
                      transition
                      hover:bg-[#20398F]
                      hover:shadow-md
                      active:scale-[0.98]
                    "
                  >
                    <FiEdit2 size={15} />
                    Edit Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsOverview;