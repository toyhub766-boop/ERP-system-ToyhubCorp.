import {
  FiChevronDown,
  FiFilter,
  FiPhone,
  FiSearch,
  FiSliders,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import React from "react";

interface Props {
  customers: any[];

  selectedCustomer: any;

  setSelectedCustomer: (
    customer: any
  ) => void;

  search: string;

  setSearch: React.Dispatch<
    React.SetStateAction<string>
  >;
}

type ViewFilter =
  | "ALL"
  | "LEADS"
  | "CUSTOMERS"
  | "PARTIES";

type SortOption =
  | "AZ"
  | "ZA"
  | "NEWEST"
  | "OLDEST";

const getCustomerType = (
  customer: any
): ViewFilter => {
  /*
   * Every record coming from Accounts
   * is an Account Party in CRM.
   *
   * Accounts remains the source of truth.
   */
  if (
    customer.source === "ACCOUNTS" ||
    customer.crmType === "PARTY"
  ) {
    return "PARTIES";
  }
  /*
   * CRM-created leads.
   */
  if (
    customer.stage === "LEAD"
  ) {
    return "LEADS";
  }

  /*
   * Remaining CRM customer records.
   */
  return "CUSTOMERS";
};

const getSalespersonNames = (
  customer: any
): string[] => {
  const names: string[] = [];

  /*
   * New relationship field
   */

  if (
    Array.isArray(
      customer.assignedSalespeople
    )
  ) {
    customer.assignedSalespeople.forEach(
      (person: any) => {
        const name =
          typeof person === "string"
            ? person
            : person?.name;

        if (
          name &&
          !names.includes(name)
        ) {
          names.push(name);
        }
      }
    );
  }

  /*
   * Old backward-compatible field
   */

  if (
    customer.assignedSalesperson &&
    !names.includes(
      customer.assignedSalesperson
    )
  ) {
    names.push(
      customer.assignedSalesperson
    );
  }

  return names;
};

const getDisplayType = (
  customer: any
) => {
  const type =
    getCustomerType(customer);

  if (type === "LEADS") {
    return {
      label: "Lead",
      className:
        "bg-amber-50 text-amber-700 border-amber-100",
    };
  }

  if (type === "PARTIES") {
    return {
      label:
        customer.partyType ===
        "SUPPLIER"
          ? "Supplier"
          : "Party",
      className:
        "bg-purple-50 text-purple-700 border-purple-100",
    };
  }

  return {
    label: "Customer",
    className:
      "bg-blue-50 text-[#172B6B] border-blue-100",
  };
};

const CustomerList = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  search,
  setSearch,
}: Props) => {
  const [viewFilter, setViewFilter] =
    React.useState<ViewFilter>("ALL");

  const [sortOption, setSortOption] =
    React.useState<SortOption>("AZ");

  const [salespersonFilter, setSalespersonFilter] =
    React.useState("ALL");

  const [showFilters, setShowFilters] =
    React.useState(false);

  /*
   * =========================================================
   * SALESPERSON OPTIONS
   * =========================================================
   */

  const salespersonOptions =
    React.useMemo(() => {
      const names = new Set<string>();

      customers.forEach(
        (customer) => {
          getSalespersonNames(
            customer
          ).forEach((name) =>
            names.add(name)
          );
        }
      );

      return Array.from(names).sort(
        (a, b) =>
          a.localeCompare(b)
      );
    }, [customers]);

  /*
   * =========================================================
   * FILTER + SORT
   * =========================================================
   */

  const filteredCustomers =
    React.useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      const result =
        customers.filter(
          (customer) => {
            const companyName =
              customer.companyName
                ?.toLowerCase() ||
              "";

            const contactPerson =
              customer.contactPerson
                ?.toLowerCase() ||
              "";

            const phone =
              customer.phone
                ?.toLowerCase() ||
              "";

            const customerCode =
              customer.customerCode
                ?.toLowerCase() ||
              "";

            const gstNumber =
              customer.gstNumber
                ?.toLowerCase() ||
              "";

            const city =
              customer.city
                ?.toLowerCase() ||
              "";

            const state =
              customer.state
                ?.toLowerCase() ||
              "";

            const salespersonNames =
              getSalespersonNames(
                customer
              )
                .join(" ")
                .toLowerCase();

            /*
             * SEARCH
             */

            const matchesSearch =
              !query ||
              companyName.includes(
                query
              ) ||
              contactPerson.includes(
                query
              ) ||
              phone.includes(
                query
              ) ||
              customerCode.includes(
                query
              ) ||
              gstNumber.includes(
                query
              ) ||
              city.includes(
                query
              ) ||
              state.includes(
                query
              ) ||
              salespersonNames.includes(
                query
              );

            /*
             * TYPE
             */

            const customerType =
              getCustomerType(
                customer
              );

            const matchesType =
              viewFilter === "ALL" ||
              customerType ===
                viewFilter;

            /*
             * SALESPERSON
             */

            const matchesSalesperson =
              salespersonFilter ===
                "ALL" ||
              getSalespersonNames(
                customer
              ).includes(
                salespersonFilter
              );

            return (
              matchesSearch &&
              matchesType &&
              matchesSalesperson
            );
          }
        );

      /*
       * SORT
       */

      result.sort(
        (a, b) => {
          if (
            sortOption === "AZ"
          ) {
            return (
              (
                a.companyName ||
                ""
              ).localeCompare(
                b.companyName ||
                  ""
              )
            );
          }

          if (
            sortOption === "ZA"
          ) {
            return (
              (
                b.companyName ||
                ""
              ).localeCompare(
                a.companyName ||
                  ""
              )
            );
          }

          const dateA =
            new Date(
              a.createdAt || 0
            ).getTime();

          const dateB =
            new Date(
              b.createdAt || 0
            ).getTime();

          if (
            sortOption ===
            "NEWEST"
          ) {
            return dateB - dateA;
          }

          return dateA - dateB;
        }
      );

      return result;
    }, [
      customers,
      search,
      viewFilter,
      sortOption,
      salespersonFilter,
    ]);

  /*
   * =========================================================
   * COUNTS
   * =========================================================
   */

  const counts =
    React.useMemo(() => {
      const leads =
        customers.filter(
          (customer) =>
            getCustomerType(
              customer
            ) === "LEADS"
        ).length;

      const customerCount =
        customers.filter(
          (customer) =>
            getCustomerType(
              customer
            ) === "CUSTOMERS"
        ).length;

      const parties =
        customers.filter(
          (customer) =>
            getCustomerType(
              customer
            ) === "PARTIES"
        ).length;

      return {
        all: customers.length,
        leads,
        customers: customerCount,
        parties,
      };
    }, [customers]);

  /*
   * =========================================================
   * CLEAR FILTERS
   * =========================================================
   */

  const clearFilters = () => {
    setSearch("");
    setViewFilter("ALL");
    setSortOption("AZ");
    setSalespersonFilter("ALL");
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    viewFilter !== "ALL" ||
    sortOption !== "AZ" ||
    salespersonFilter !== "ALL";

  return (
    <section
      className="
        flex
        min-h-0
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          shrink-0
          border-b
          border-slate-100
          px-5
          py-5
          sm:px-6
        "
      >
        <div className="flex items-start justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-[#172B6B]
                "
              >
                <FiUsers
                  size={18}
                />
              </div>

              <div>
                <h2
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  "
                >
                  Customers
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-400
                  "
                >
                  Leads, customers and parties
                </p>
              </div>

            </div>
          </div>

          <div
            className="
              rounded-xl
              bg-slate-50
              px-3
              py-2
              text-right
            "
          >
            <p className="text-lg font-bold text-slate-900">
              {filteredCustomers.length}
            </p>

            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Showing
            </p>
          </div>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="relative mt-5">

          <FiSearch
            size={16}
            className="
              pointer-events-none
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search company, contact, phone, GST, code..."
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-10
              pr-10
              text-sm
              text-slate-800
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-[#172B6B]
              focus:bg-white
              focus:ring-4
              focus:ring-[#172B6B]/10
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
                -translate-y-1/2
                rounded-lg
                p-1
                text-slate-400
                hover:bg-slate-100
                hover:text-slate-700
              "
            >
              <FiX size={15} />
            </button>
          )}

        </div>

        {/* =================================================
            TYPE FILTERS
        ================================================= */}

        <div
          className="
            mt-4
            flex
            gap-2
            overflow-x-auto
            pb-1
          "
        >

          <FilterChip
            label="All"
            count={counts.all}
            active={
              viewFilter === "ALL"
            }
            onClick={() =>
              setViewFilter("ALL")
            }
          />

          <FilterChip
            label="Leads"
            count={counts.leads}
            active={
              viewFilter === "LEADS"
            }
            onClick={() =>
              setViewFilter("LEADS")
            }
          />

          <FilterChip
            label="Customers"
            count={
              counts.customers
            }
            active={
              viewFilter ===
              "CUSTOMERS"
            }
            onClick={() =>
              setViewFilter(
                "CUSTOMERS"
              )
            }
          />

          <FilterChip
            label="Parties"
            count={counts.parties}
            active={
              viewFilter ===
              "PARTIES"
            }
            onClick={() =>
              setViewFilter(
                "PARTIES"
              )
            }
          />

        </div>

        {/* =================================================
            ADVANCED FILTER BUTTON
        ================================================= */}

        <div className="mt-3 flex items-center justify-between gap-2">

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (previous) =>
                  !previous
              )
            }
            className={`
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-xs
              font-semibold
              transition
              ${
                showFilters ||
                salespersonFilter !==
                  "ALL"
                  ? "bg-[#172B6B]/10 text-[#172B6B]"
                  : "text-slate-500 hover:bg-slate-100"
              }
            `}
          >
            <FiSliders size={14} />
            More Filters

            <FiChevronDown
              size={13}
              className={`
                transition-transform
                ${
                  showFilters
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                px-2.5
                py-2
                text-xs
                font-semibold
                text-slate-400
                hover:bg-slate-100
                hover:text-slate-700
              "
            >
              <FiX size={13} />
              Clear
            </button>
          )}

        </div>

        {/* =================================================
            ADVANCED FILTERS
        ================================================= */}

        {showFilters && (
          <div
            className="
              mt-3
              grid
              gap-3
              rounded-xl
              border
              border-slate-100
              bg-slate-50/70
              p-3
              sm:grid-cols-2
            "
          >

            {/* SORT */}

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Sort
              </label>

              <div className="relative">

                <FiFilter
                  size={13}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <select
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(
                      event.target
                        .value as SortOption
                    )
                  }
                  className="
                    h-10
                    w-full
                    appearance-none
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    pl-9
                    pr-8
                    text-xs
                    font-medium
                    text-slate-700
                    outline-none
                    focus:border-[#172B6B]
                  "
                >
                  <option value="AZ">
                    A → Z
                  </option>

                  <option value="ZA">
                    Z → A
                  </option>

                  <option value="NEWEST">
                    Newest first
                  </option>

                  <option value="OLDEST">
                    Oldest first
                  </option>
                </select>

                <FiChevronDown
                  size={13}
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

              </div>
            </div>

            {/* SALESPERSON */}

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Salesperson
              </label>

              <div className="relative">

                <FiUser
                  size={13}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <select
                  value={
                    salespersonFilter
                  }
                  onChange={(event) =>
                    setSalespersonFilter(
                      event.target.value
                    )
                  }
                  className="
                    h-10
                    w-full
                    appearance-none
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    pl-9
                    pr-8
                    text-xs
                    font-medium
                    text-slate-700
                    outline-none
                    focus:border-[#172B6B]
                  "
                >
                  <option value="ALL">
                    All Salespeople
                  </option>

                  {salespersonOptions.map(
                    (name) => (
                      <option
                        key={name}
                        value={name}
                      >
                        {name}
                      </option>
                    )
                  )}
                </select>

                <FiChevronDown
                  size={13}
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

              </div>
            </div>

          </div>
        )}

      </div>

      {/* =====================================================
          CUSTOMER LIST
      ===================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
        "
      >

        {filteredCustomers.length ===
        0 ? (
          <div
            className="
              flex
              min-h-[360px]
              flex-col
              items-center
              justify-center
              px-6
              text-center
            "
          >

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-400
              "
            >
              <FiSearch
                size={21}
              />
            </div>

            <h3
              className="
                mt-4
                text-sm
                font-bold
                text-slate-800
              "
            >
              No records found
            </h3>

            <p
              className="
                mt-1.5
                max-w-xs
                text-xs
                leading-5
                text-slate-400
              "
            >
              Try changing the search or
              filters.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="
                  mt-4
                  rounded-lg
                  bg-[#172B6B]
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-white
                "
              >
                Clear filters
              </button>
            )}

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {filteredCustomers.map(
              (customer) => {
                const isSelected =
                  selectedCustomer?._id ===
                  customer._id;

                const displayType =
                  getDisplayType(
                    customer
                  );

                const salespersonNames =
                  getSalespersonNames(
                    customer
                  );

                return (
                  <button
                    key={
                      customer._id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedCustomer(
                        customer
                      )
                    }
                    className={`
                      w-full
                      px-5
                      py-4
                      text-left
                      transition
                      sm:px-6
                      ${
                        isSelected
                          ? "bg-[#172B6B]/5"
                          : "hover:bg-slate-50"
                      }
                    `}
                  >

                    <div className="flex items-start gap-3">

                      {/* AVATAR */}

                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          text-sm
                          font-bold
                          ${
                            isSelected
                              ? "bg-[#172B6B] text-white"
                              : "bg-slate-100 text-slate-600"
                          }
                        `}
                      >
                        {(
                          customer.companyName ||
                          customer.contactPerson ||
                          "C"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <p
                            className={`
                              truncate
                              text-sm
                              font-bold
                              ${
                                isSelected
                                  ? "text-[#172B6B]"
                                  : "text-slate-900"
                              }
                            `}
                          >
                            {customer.companyName ||
                              "Unnamed Customer"}
                          </p>

                          <span
                            className={`
                              shrink-0
                              rounded-md
                              border
                              px-2
                              py-1
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-wide
                              ${displayType.className}
                            `}
                          >
                            {
                              displayType.label
                            }
                          </span>

                        </div>

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-slate-500
                          "
                        >
                          {customer.contactPerson ||
                            "No contact person"}
                        </p>

                        <div
                          className="
                            mt-2
                            flex
                            flex-wrap
                            items-center
                            gap-x-3
                            gap-y-1
                            text-[11px]
                            text-slate-400
                          "
                        >

                          {customer.phone && (
                            <span className="flex items-center gap-1.5">
                              <FiPhone
                                size={11}
                              />
                              {
                                customer.phone
                              }
                            </span>
                          )}

                          {customer.customerCode && (
                            <span>
                              {
                                customer.customerCode
                              }
                            </span>
                          )}

                        </div>

                        {/* SALESPERSON */}

                        {salespersonNames.length >
                          0 && (
                          <div
                            className="
                              mt-2.5
                              flex
                              flex-wrap
                              items-center
                              gap-1.5
                            "
                          >

                            <FiUser
                              size={11}
                              className="text-slate-400"
                            />

                            {salespersonNames.map(
                              (
                                name
                              ) => (
                                <span
                                  key={
                                    name
                                  }
                                  className="
                                    rounded-md
                                    bg-slate-100
                                    px-2
                                    py-1
                                    text-[10px]
                                    font-medium
                                    text-slate-600
                                  "
                                >
                                  {
                                    name
                                  }
                                </span>
                              )
                            )}

                          </div>
                        )}

                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

      </div>

    </section>
  );
};

/* =========================================================
   FILTER CHIP
========================================================= */

const FilterChip = ({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        shrink-0
        items-center
        gap-2
        rounded-lg
        border
        px-3
        py-2
        text-xs
        font-semibold
        transition
        ${
          active
            ? "border-[#172B6B] bg-[#172B6B] text-white"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      {label}

      <span
        className={`
          rounded-md
          px-1.5
          py-0.5
          text-[10px]
          ${
            active
              ? "bg-white/15 text-white"
              : "bg-slate-100 text-slate-500"
          }
        `}
      >
        {count}
      </span>
    </button>
  );
};

export default CustomerList;