import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiSearch,
  FiUsers,
  FiX,
  FiArrowUpRight,
} from "react-icons/fi";

import { getCRMDueDates } from "../services/crmDue.service";


type DueStatus =
  | "OVERDUE"
  | "DUE_TODAY"
  | "UPCOMING"
  | "NO_DUE_DATE";


const CRMDueDates = () => {
  const [parties, setParties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);


  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    loadDueDates();
  }, []);


  const loadDueDates = async () => {
    try {
      setLoading(true);

      const data = await getCRMDueDates();

      const customers = data.filter(
        (party: any) =>
          party.partyType === "CUSTOMER"
      );

      setParties(customers);

    } catch (error) {
      console.error(
        "Failed to load CRM due dates:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     TODAY
  ========================================================= */

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);


  /* =========================================================
     STATUS
  ========================================================= */

  const getDueStatus = (
    dueDate?: string
  ): DueStatus => {

    if (!dueDate) {
      return "NO_DUE_DATE";
    }

    const date = new Date(dueDate);

    date.setHours(0, 0, 0, 0);

    if (date < today) {
      return "OVERDUE";
    }

    if (
      date.getTime() ===
      today.getTime()
    ) {
      return "DUE_TODAY";
    }

    return "UPCOMING";
  };


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredParties = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return parties;
    }

    return parties.filter(
      (party) =>
        party.companyName
          ?.toLowerCase()
          .includes(query) ||
        party.contactPerson
          ?.toLowerCase()
          .includes(query) ||
        party.phone
          ?.toLowerCase()
          .includes(query)
    );

  }, [parties, search]);


  /* =========================================================
     STATUS GROUPS
  ========================================================= */

  const overdue = filteredParties.filter(
    (party) =>
      getDueStatus(
        party.customerDetails?.dueDate
      ) === "OVERDUE"
  );

  const dueToday = filteredParties.filter(
    (party) =>
      getDueStatus(
        party.customerDetails?.dueDate
      ) === "DUE_TODAY"
  );

  const upcoming = filteredParties.filter(
    (party) =>
      getDueStatus(
        party.customerDetails?.dueDate
      ) === "UPCOMING"
  );

  const noDueDate = filteredParties.filter(
    (party) =>
      getDueStatus(
        party.customerDetails?.dueDate
      ) === "NO_DUE_DATE"
  );


  /* =========================================================
     FORMATTERS
  ========================================================= */

  const formatDate = (
    date?: string
  ) => {

    if (!date) {
      return "No due date";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Invalid date";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const formatAmount = (
    value: number
  ) => {

    return Math.abs(
      Number(value || 0)
    ).toLocaleString("en-IN");
  };


  /* =========================================================
     STATUS CONFIG
  ========================================================= */

  const getStatusConfig = (
    status: DueStatus
  ) => {

    switch (status) {

      case "OVERDUE":
        return {
          label: "Overdue",
          dot: "bg-red-500",
          badge:
            "bg-red-50 text-red-700 border-red-100",
          icon: FiAlertCircle,
        };

      case "DUE_TODAY":
        return {
          label: "Due Today",
          dot: "bg-amber-500",
          badge:
            "bg-amber-50 text-amber-700 border-amber-100",
          icon: FiCalendar,
        };

      case "UPCOMING":
        return {
          label: "Upcoming",
          dot: "bg-emerald-500",
          badge:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
          icon: FiClock,
        };

      default:
        return {
          label: "No Due Date",
          dot: "bg-slate-400",
          badge:
            "bg-slate-50 text-slate-600 border-slate-200",
          icon: FiCalendar,
        };
    }
  };


  return (
    <div className="space-y-7">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >

        <div>

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[#172B6B]
            "
          >
            <span>CRM</span>

            <span className="text-slate-300">
              /
            </span>

            <span className="text-slate-400">
              Accounts
            </span>
          </div>


          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
              sm:text-4xl
            "
          >
            Due Dates
          </h1>


          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
              sm:text-base
            "
          >
            Monitor customer payment deadlines,
            outstanding balances and upcoming
            collection dates.
          </p>

        </div>


        <div
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-3.5
            py-2.5
            text-xs
            font-medium
            text-slate-500
            shadow-sm
          "
        >

          <FiUsers
            size={15}
            className="text-[#172B6B]"
          />

          {filteredParties.length}
          {" "}
          customer
          {filteredParties.length !== 1
            ? "s"
            : ""}

        </div>

      </section>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-3
          shadow-sm
          sm:p-4
        "
      >

        <div
          className="
            relative
            max-w-xl
          "
        >

          <FiSearch
            size={18}
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customer, contact or phone..."
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-11
              pr-10
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

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="
                absolute
                right-3
                top-1/2
                flex
                h-7
                w-7
                -translate-y-1/2
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
              "
            >
              <FiX size={15} />
            </button>
          )}

        </div>

      </section>


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        {/* OVERDUE */}

        <div
          className="
            group
            rounded-2xl
            border
            border-red-100
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div className="flex items-start justify-between">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <FiAlertCircle
                size={18}
              />
            </div>

            <FiArrowUpRight
              size={17}
              className="
                text-slate-300
                transition
                group-hover:text-red-400
              "
            />

          </div>


          <p
            className="
              mt-5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Overdue
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-red-600
            "
          >
            {overdue.length}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            Requires attention
          </p>

        </div>


        {/* TODAY */}

        <div
          className="
            group
            rounded-2xl
            border
            border-amber-100
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div className="flex items-start justify-between">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-amber-50
                text-amber-600
              "
            >
              <FiCalendar
                size={18}
              />
            </div>

            <FiArrowUpRight
              size={17}
              className="
                text-slate-300
                transition
                group-hover:text-amber-400
              "
            />

          </div>


          <p
            className="
              mt-5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Due Today
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-amber-600
            "
          >
            {dueToday.length}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            Due before end of day
          </p>

        </div>


        {/* UPCOMING */}

        <div
          className="
            group
            rounded-2xl
            border
            border-emerald-100
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div className="flex items-start justify-between">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-emerald-50
                text-emerald-600
              "
            >
              <FiClock
                size={18}
              />
            </div>

            <FiArrowUpRight
              size={17}
              className="
                text-slate-300
                transition
                group-hover:text-emerald-400
              "
            />

          </div>


          <p
            className="
              mt-5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Upcoming
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-emerald-600
            "
          >
            {upcoming.length}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            Future payment dates
          </p>

        </div>


        {/* NO DATE */}

        <div
          className="
            group
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div className="flex items-start justify-between">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-slate-100
                text-slate-500
              "
            >
              <FiCalendar
                size={18}
              />
            </div>

            <FiArrowUpRight
              size={17}
              className="
                text-slate-300
                transition
                group-hover:text-slate-500
              "
            />

          </div>


          <p
            className="
              mt-5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            No Due Date
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-slate-800
            "
          >
            {noDueDate.length}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            Payment terms not configured
          </p>

        </div>

      </section>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        {/* TABLE HEADER */}

        <div
          className="
            flex
            flex-col
            gap-2
            border-b
            border-slate-100
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <h2
              className="
                text-sm
                font-bold
                text-slate-900
              "
            >
              Customer Payment Schedule
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-slate-400
              "
            >
              Outstanding balances and
              payment deadlines
            </p>

          </div>


          <div
            className="
              text-xs
              font-medium
              text-slate-400
            "
          >
            {filteredParties.length}
            {" "}
            record
            {filteredParties.length !== 1
              ? "s"
              : ""}
          </div>

        </div>


        <div className="overflow-x-auto">

          <table
            className="
              min-w-[1000px]
              w-full
            "
          >

            <thead>

              <tr
                className="
                  border-b
                  border-slate-100
                  bg-slate-50/70
                  text-left
                "
              >

                <th
                  className="
                    px-5
                    py-3.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  Customer
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  Contact
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  Outstanding
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  Payment Terms
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  Due Date
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                /* LOADING */

                Array.from({
                  length: 5,
                }).map((_, index) => (

                  <tr
                    key={index}
                    className="
                      border-b
                      border-slate-100
                    "
                  >

                    {Array.from({
                      length: 6,
                    }).map(
                      (_, cellIndex) => (

                        <td
                          key={cellIndex}
                          className="px-5 py-5"
                        >
                          <div
                            className="
                              h-4
                              w-24
                              animate-pulse
                              rounded-md
                              bg-slate-100
                            "
                          />
                        </td>

                      )
                    )}

                  </tr>

                ))

              ) : filteredParties.length ===
                0 ? (

                /* EMPTY */

                <tr>

                  <td
                    colSpan={6}
                    className="
                      px-6
                      py-16
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        text-center
                      "
                    >

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-slate-100
                          text-slate-400
                        "
                      >
                        <FiSearch
                          size={20}
                        />
                      </div>

                      <h3
                        className="
                          mt-4
                          text-sm
                          font-semibold
                          text-slate-800
                        "
                      >
                        No customers found
                      </h3>

                      <p
                        className="
                          mt-1
                          max-w-sm
                          text-xs
                          leading-5
                          text-slate-400
                        "
                      >
                        Try changing your search
                        or add customer payment
                        information through Accounts.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredParties.map(
                  (party) => {

                    const dueDate =
                      party.customerDetails
                        ?.dueDate;

                    const paymentTerms =
                      party.customerDetails
                        ?.paymentTerms;

                    const status =
                      getDueStatus(
                        dueDate
                      );

                    const statusConfig =
                      getStatusConfig(
                        status
                      );

                    const StatusIcon =
                      statusConfig.icon;

                    return (

                      <tr
                        key={party._id}
                        className="
                          group
                          border-b
                          border-slate-100
                          last:border-0
                          transition-colors
                          duration-150
                          hover:bg-slate-50/70
                        "
                      >

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >

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
                                text-xs
                                font-bold
                                text-[#172B6B]
                              "
                            >
                              {party.companyName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "C"}
                            </div>


                            <div
                              className="
                                min-w-0
                              "
                            >

                              <p
                                className="
                                  truncate
                                  text-sm
                                  font-semibold
                                  text-slate-800
                                "
                              >
                                {party.companyName ||
                                  "Unnamed Customer"}
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  truncate
                                  text-[11px]
                                  text-slate-400
                                "
                              >
                                {party.customerDetails
                                  ?.billingName ||
                                  "Customer account"}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* CONTACT */}

                        <td className="px-5 py-4">

                          <p
                            className="
                              text-sm
                              font-medium
                              text-slate-700
                            "
                          >
                            {party.contactPerson ||
                              "—"}
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[11px]
                              text-slate-400
                            "
                          >
                            {party.phone ||
                              "No phone"}
                          </p>

                        </td>


                        {/* OUTSTANDING */}

                        <td className="px-5 py-4">

                          <p
                            className="
                              text-sm
                              font-bold
                              text-slate-900
                            "
                          >
                            ₹
                            {formatAmount(
                              party.currentBalance ||
                                0
                            )}
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[10px]
                              text-slate-400
                            "
                          >
                            Outstanding balance
                          </p>

                        </td>


                        {/* PAYMENT TERMS */}

                        <td className="px-5 py-4">

                          {paymentTerms ? (

                            <span
                              className="
                                inline-flex
                                items-center
                                rounded-lg
                                border
                                border-slate-200
                                bg-slate-50
                                px-2.5
                                py-1.5
                                text-xs
                                font-semibold
                                text-slate-600
                              "
                            >
                              {paymentTerms}
                              {" "}
                              days
                            </span>

                          ) : (

                            <span
                              className="
                                text-xs
                                text-slate-400
                              "
                            >
                              Not set
                            </span>

                          )}

                        </td>


                        {/* DATE */}

                        <td className="px-5 py-4">

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              text-sm
                              font-medium
                              text-slate-700
                            "
                          >

                            <FiCalendar
                              size={14}
                              className="
                                shrink-0
                                text-slate-400
                              "
                            />

                            {formatDate(
                              dueDate
                            )}

                          </div>

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              px-3
                              py-1.5
                              text-[11px]
                              font-bold
                              ${statusConfig.badge}
                            `}
                          >

                            <span
                              className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${statusConfig.dot}
                              `}
                            />

                            <StatusIcon
                              size={12}
                            />

                            {statusConfig.label}

                          </span>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>


        {/* ===================================================
            FOOTER
        =================================================== */}

        {!loading &&
          filteredParties.length > 0 && (

            <div
              className="
                flex
                flex-col
                gap-1
                border-t
                border-slate-100
                bg-slate-50/50
                px-5
                py-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <p
                className="
                  text-[11px]
                  text-slate-400
                "
              >
                Due dates entered through
                Accounts appear here automatically.
              </p>

              <p
                className="
                  text-[11px]
                  font-medium
                  text-slate-400
                "
              >
                {filteredParties.length}
                {" "}
                customer
                {filteredParties.length !== 1
                  ? "s"
                  : ""}
              </p>

            </div>

          )}

      </section>

    </div>
  );
};


export default CRMDueDates;