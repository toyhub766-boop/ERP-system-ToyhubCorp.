import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getOrdersByCustomer,
  deleteOrder,
} from "../services/order.service";

import {
  getCustomers,
  deleteCustomer,
} from "../services/customer.service";

import {
  getParties,
} from "../../accounts/services/accountParty.service";

import CRMHeader from "../components/CRMHeader";
import CRMStats from "../components/CRMStats";
import CRMTabs from "../components/CRMTabs";

import CustomerList from "../components/CustomerList";
import CustomerProfile from "../components/CustomerProfile";

import OrdersTable from "../components/OrdersTable";

import CustomerModal from "../components/CustomerModal";
import OrderModal from "../components/OrderModal";
import AddNoteModal from "../components/AddNoteModal";

import SalesPipeline from "../components/SalesPipeline";
import CRMDueDates from "../components/CRMDueDates";

import {
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
} from "react-icons/fi";

import type { Customer } from "../types/customer.types";
import CRMStaffLayout from "../components/CRMStaffLayout";

type CRMTab =
  | "customers"
  | "pipeline"
  | "dues"
  | "orders";

type CRMRecord = any;

const CRMStaffPage = () => {
  // =========================================================
  // TAB
  // =========================================================

  const [activeTab, setActiveTab] =
    useState<CRMTab>("customers");

  // =========================================================
  // CRM OVERVIEW COLLAPSE
  // =========================================================

  const [showCRMOverview, setShowCRMOverview] =
    useState(() => {
      try {
        return (
          localStorage.getItem(
            "toyhub-crm-overview-expanded"
          ) === "true"
        );
      } catch {
        return false;
      }
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        "toyhub-crm-overview-expanded",
        String(showCRMOverview)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [showCRMOverview]);

  // =========================================================
  // FOLLOW-UP COMMAND CENTER COLLAPSE
  // =========================================================

  const [showFollowUpCenter, setShowFollowUpCenter] =
    useState(() => {
      try {
        return (
          localStorage.getItem(
            "toyhub-crm-followup-expanded"
          ) === "true"
        );
      } catch {
        return false;
      }
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        "toyhub-crm-followup-expanded",
        String(showFollowUpCenter)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [showFollowUpCenter]);

  // =========================================================
  // CRM LEADS / CUSTOMERS
  // =========================================================

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  // =========================================================
  // ACCOUNTS PARTIES
  // =========================================================

  const [accountParties, setAccountParties] =
    useState<any[]>([]);

  // =========================================================
  // SELECTED CRM RECORD
  // =========================================================

  const [selectedCustomer, setSelectedCustomer] =
    useState<CRMRecord>(null);

  const [search, setSearch] =
    useState("");

  // =========================================================
  // ORDERS
  // =========================================================

  const [orders, setOrders] =
    useState<any[]>([]);

  // =========================================================
  // CUSTOMER MODAL
  // =========================================================

  const [showAddCustomer, setShowAddCustomer] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<any>(null);

  // =========================================================
  // ORDER MODAL
  // =========================================================

  const [showOrderModal, setShowOrderModal] =
    useState(false);

  const [editingOrder, setEditingOrder] =
    useState<any>(null);

  // =========================================================
  // NOTES
  // =========================================================

  const [showNoteModal, setShowNoteModal] =
    useState(false);

  // =========================================================
  // LOAD CRM RECORDS
  // =========================================================

  const loadCustomers = async () => {
    try {
      const data =
        await getCustomers();

      const safeData =
        Array.isArray(data)
          ? data
          : [];

      setCustomers(
        safeData
      );

      /*
       * Keep the currently selected CRM record
       * synchronized after reload.
       *
       * Accounts Party records are handled separately
       * by loadAccountParties().
       */

      setSelectedCustomer(
        (current: any) => {
          if (!safeData.length) {
            /*
             * Do not clear an Accounts Party selection
             * when only CRM records are being refreshed.
             */
            if (
              current?.source ===
              "ACCOUNTS"
            ) {
              return current;
            }

            return null;
          }

          /*
           * Nothing selected yet.
           *
           * We intentionally do not automatically select
           * the first CRM record because Accounts Parties
           * are also part of the workspace.
           */
          if (!current?._id) {
            return null;
          }

          /*
           * If current selection is a CRM record,
           * update it from the fresh CRM response.
           */
          if (
            current.source ===
            "CRM"
          ) {
            const stillExists =
              safeData.find(
                (customer: any) =>
                  customer._id ===
                  current._id
              );

            return (
              stillExists
                ? {
                    ...stillExists,
                    source: "CRM",
                    crmType: "LEAD",
                  }
                : current
            );
          }

          return current;
        }
      );
    } catch (error) {
      console.error(
        "Failed to load CRM customers:",
        error
      );
    }
  };

  // =========================================================
  // LOAD ACCOUNTS PARTIES
  // =========================================================

  const loadAccountParties =
    async () => {
      try {
        const data =
          await getParties();

        const safeData =
          Array.isArray(data)
            ? data
            : [];

        setAccountParties(
          safeData
        );

        /*
         * Keep selected Accounts Party synchronized
         * with the latest Accounts response.
         */
        setSelectedCustomer(
          (current: any) => {
            if (
              !current?._id
            ) {
              return current;
            }

            if (
              current.source !==
              "ACCOUNTS"
            ) {
              return current;
            }

            const updatedParty =
              safeData.find(
                (party: any) =>
                  party._id ===
                  current._id
              );

            if (!updatedParty) {
              return current;
            }

            return normalizeAccountParty(
              updatedParty
            );
          }
        );
      } catch (error) {
        console.error(
          "Failed to load account parties:",
          error
        );

        setAccountParties([]);
      }
    };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCustomers();
    loadAccountParties();
  }, []);

  // =========================================================
  // COMBINED CRM WORKSPACE DATA
  // =========================================================

  const crmRecords =
    useMemo(() => {
      /*
       * =====================================================
       * CRM RECORDS
       * =====================================================
       *
       * These are records created through CRM.
       *
       * They remain CRM-owned records.
       */

      const crmRecords =
        customers.map(
          (customer: any) => ({
            ...customer,

            source: "CRM",
            crmType: "LEAD",
          })
        );

      /*
       * =====================================================
       * ACCOUNTS PARTIES
       * =====================================================
       *
       * Accounts is the source of truth for Party records.
       *
       * CRM reads those records.
       *
       * We DO NOT create duplicate CRM customers.
       *
       * CUSTOMER + SUPPLIER parties are included.
       * COMPANY_EXPENSE records are not CRM records.
       */

      const partyRecords =
        accountParties
          .filter(
            (party: any) => {
              /*
               * Inactive parties should not appear
               * in the active CRM workspace.
               */

              if (
                party.status ===
                "Inactive"
              ) {
                return false;
              }

              /*
               * Company expenses are accounting records,
               * not CRM relationships.
               */

              if (
                party.partyType ===
                "COMPANY_EXPENSE"
              ) {
                return false;
              }

              /*
               * Only actual Account Parties belong
               * in the CRM Party view.
               */

              return (
                party.partyType ===
                  "CUSTOMER" ||
                party.partyType ===
                  "SUPPLIER"
              );
            }
          )
          .map(
            (party: any) =>
              normalizeAccountParty(
                party
              )
          );

      /*
       * =====================================================
       * COMBINED WORKSPACE
       * =====================================================
       *
       * CRM Leads first.
       * Accounts Parties second.
       *
       * CustomerList will classify these using:
       *
       * CRM       -> Leads
       * ACCOUNTS  -> Parties
       */

      return [
        ...crmRecords,
        ...partyRecords,
      ];
    }, [
      customers,
      accountParties,
    ]);

  // =========================================================
  // KEEP SELECTED RECORD IN SYNC
  // =========================================================

  useEffect(() => {
    if (
      !selectedCustomer?._id
    ) {
      return;
    }

    const updated =
      crmRecords.find(
        (record: any) =>
          record._id ===
            selectedCustomer._id &&
          record.source ===
            selectedCustomer.source
      );

    if (updated) {
      setSelectedCustomer(
        updated
      );
    }
  }, [
    crmRecords,
    selectedCustomer?._id,
    selectedCustomer?.source,
  ]);

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const loadCustomerData =
    async (
      customerId?: string
    ) => {
      const customer =
        selectedCustomer;

      if (
        customer?.source ===
        "ACCOUNTS"
      ) {
        setOrders([]);
        return;
      }

      const id =
        customerId ||
        selectedCustomer?._id;

      if (!id) {
        setOrders([]);
        return;
      }

      try {
        const ordersData =
          await getOrdersByCustomer(id);

        setOrders(
          Array.isArray(
            ordersData
          )
            ? ordersData
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load customer orders:",
          error
        );

        setOrders([]);
      }
    };

  // =========================================================
  // LOAD SELECTED CUSTOMER DATA
  // =========================================================

  useEffect(() => {
    if (
      !selectedCustomer?._id
    ) {
      setOrders([]);
      return;
    }

    loadCustomerData(
      selectedCustomer._id
    );
  }, [
    selectedCustomer?._id,
    selectedCustomer?.source,
  ]);

  // =========================================================
  // REMINDER DATA
  // =========================================================

  const reminderStats =
    useMemo(() => {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      let overdue = 0;
      let todayCount = 0;
      let upcoming = 0;

      /*
       * Reminder activities currently live
       * on CRM Customer records.
       *
       * Accounts Parties are intentionally not
       * included here until their activity layer
       * is connected.
       */

      customers.forEach(
        (customer: any) => {
          customer.specialNotes?.forEach(
            (note: any) => {
              if (
                !note.reminderDate ||
                note.completed
              ) {
                return;
              }

              const reminder =
                new Date(
                  note.reminderDate
                );

              reminder.setHours(
                0,
                0,
                0,
                0
              );

              if (
                reminder.getTime() ===
                today.getTime()
              ) {
                todayCount++;
              } else if (
                reminder < today
              ) {
                overdue++;
              } else {
                upcoming++;
              }
            }
          );
        }
      );

      return {
        overdue,
        today: todayCount,
        upcoming,
      };
    }, [customers]);

  // =========================================================
  // DELETE CUSTOMER
  // =========================================================

  const handleDeleteCustomer =
    async (
      customer: any
    ) => {
      /*
       * Accounts owns Party records.
       *
       * They must never be deleted from CRM.
       */

      if (
        customer.source ===
        "ACCOUNTS"
      ) {
        window.alert(
          "This customer is managed from Accounts. Open Accounts to manage this party."
        );

        return;
      }

      if (
        !window.confirm(
          "Delete customer?"
        )
      ) {
        return;
      }

      try {
        await deleteCustomer(
          customer._id
        );

        setSelectedCustomer(
          null
        );

        setOrders([]);

        await loadCustomers();
      } catch (error) {
        console.error(
          "Failed to delete customer:",
          error
        );
      }
    };

  // =========================================================
  // DELETE ORDER
  // =========================================================

  const handleDeleteOrder =
    async (
      order: any
    ) => {
      if (
        !window.confirm(
          "Delete order?"
        )
      ) {
        return;
      }

      try {
        await deleteOrder(
          order._id
        );

        await loadCustomerData();
      } catch (error) {
        console.error(
          "Failed to delete order:",
          error
        );
      }
    };

  // =========================================================
  // CREATE ORDER
  // =========================================================

  const handleCreateOrder =
    () => {
      /*
       * AccountParty order integration will use
       * the existing Party relationship.
       *
       * Do not create a duplicate CRM customer.
       */

      if (
        selectedCustomer?.source ===
        "ACCOUNTS"
      ) {
        window.alert(
          "This customer comes from Accounts. Order integration will use the existing party relationship without creating a duplicate customer."
        );

        return;
      }

      setEditingOrder(null);

      setShowOrderModal(
        true
      );
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <CRMStaffLayout>
      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          space-y-6
        "
      >
        {/* =====================================================
            CRM HEADER
        ===================================================== */}

        <CRMHeader
          onAddCustomer={() => {
            setEditingCustomer(
              null
            );

            setShowAddCustomer(
              true
            );
          }}
        />

        {/* =====================================================
            FOLLOW-UP COMMAND CENTER + CRM STATUS
        ===================================================== */}

        <section
          className="
            grid
            gap-4
            lg:grid-cols-[minmax(0,1fr)_auto]
          "
        >
          {/* ===================================================
              FOLLOW-UP COMMAND CENTER
          =================================================== */}

          <section
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            {/* COLLAPSED HEADER */}

            <button
              type="button"
              onClick={() =>
                setShowFollowUpCenter(
                  (previous) =>
                    !previous
                )
              }
              className="
                flex
                w-full
                items-center
                justify-between
                gap-4
                px-5
                py-4
                text-left
                transition-colors
                hover:bg-slate-50
                sm:px-6
              "
              aria-expanded={
                showFollowUpCenter
              }
            >
              <div
                className="
                  flex
                  min-w-0
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
                    text-[#172B6B]
                  "
                >
                  <FiCheckCircle
                    size={16}
                  />
                </div>

                <div className="min-w-0">
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        h-2
                        w-2
                        shrink-0
                        rounded-full
                        bg-[#172B6B]
                      "
                    />

                    <span
                      className="
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-[#172B6B]
                      "
                    >
                      Follow-up Command Center
                    </span>
                  </div>

                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      text-slate-400
                    "
                  >
                    {showFollowUpCenter
                      ? "Track overdue, today's and upcoming customer activities."
                      : "Click to view follow-up activity"}
                  </p>
                </div>
              </div>

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  text-slate-400
                "
              >
                <FiChevronDown
                  size={16}
                  className={
                    showFollowUpCenter
                      ? "rotate-180 transition-transform duration-200"
                      : "transition-transform duration-200"
                  }
                />
              </span>
            </button>

            {/* EXPANDED CONTENT */}

            {showFollowUpCenter && (
              <div
                className="
                  border-t
                  border-slate-100
                  p-4
                  sm:p-5
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
                  {/* DESCRIPTION */}

                  <div className="min-w-0">
                    <h2
                      className="
                        text-xl
                        font-bold
                        tracking-tight
                        text-slate-900
                      "
                    >
                      Stay ahead of customer conversations
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Track overdue, today's and upcoming
                      customer activities.
                    </p>
                  </div>

                  {/* REMINDER CARDS */}

                  <div
                    className="
                      grid
                      grid-cols-3
                      gap-2
                      sm:gap-3
                      lg:min-w-[300px]
                    "
                  >
                    {/* OVERDUE */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "dues"
                        )
                      }
                      className="
                        group
                        min-w-0
                        rounded-2xl
                        border
                        border-red-100
                        bg-red-50/60
                        p-3
                        text-left
                        transition
                        hover:border-red-200
                        hover:bg-red-50
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <FiAlertCircle
                          size={15}
                          className="text-red-500"
                        />

                        <FiArrowUpRight
                          size={13}
                          className="
                            text-red-300
                            transition
                            group-hover:text-red-500
                          "
                        />
                      </div>

                      <p
                        className="
                          mt-3
                          text-2xl
                          font-bold
                          text-red-600
                        "
                      >
                        {
                          reminderStats.overdue
                        }
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-red-500
                        "
                      >
                        Overdue
                      </p>
                    </button>

                    {/* TODAY */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "dues"
                        )
                      }
                      className="
                        group
                        min-w-0
                        rounded-2xl
                        border
                        border-amber-100
                        bg-amber-50/60
                        p-3
                        text-left
                        transition
                        hover:border-amber-200
                        hover:bg-amber-50
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <FiClock
                          size={15}
                          className="text-amber-600"
                        />

                        <FiArrowUpRight
                          size={13}
                          className="
                            text-amber-300
                            transition
                            group-hover:text-amber-600
                          "
                        />
                      </div>

                      <p
                        className="
                          mt-3
                          text-2xl
                          font-bold
                          text-amber-700
                        "
                      >
                        {
                          reminderStats.today
                        }
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-amber-600
                        "
                      >
                        Today
                      </p>
                    </button>

                    {/* UPCOMING */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "dues"
                        )
                      }
                      className="
                        group
                        min-w-0
                        rounded-2xl
                        border
                        border-green-100
                        bg-green-50/60
                        p-3
                        text-left
                        transition
                        hover:border-green-200
                        hover:bg-green-50
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <FiCalendar
                          size={15}
                          className="text-green-600"
                        />

                        <FiArrowUpRight
                          size={13}
                          className="
                            text-green-300
                            transition
                            group-hover:text-green-600
                          "
                        />
                      </div>

                      <p
                        className="
                          mt-3
                          text-2xl
                          font-bold
                          text-green-700
                        "
                      >
                        {
                          reminderStats.upcoming
                        }
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-green-600
                        "
                      >
                        Upcoming
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ===================================================
              CRM STATUS
          =================================================== */}

          <div
            className="
              flex
              items-center
              gap-4
              rounded-[28px]
              border
              border-slate-200
              bg-white
              px-5
              py-5
              shadow-sm
              lg:min-w-[250px]
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-green-50
                text-green-600
              "
            >
              <FiCheckCircle
                size={19}
              />
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                CRM Status
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-bold
                  text-slate-900
                "
              >
                Workspace Active
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-400
                "
              >
                {
                  crmRecords.length
                } records managed
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            CRM OVERVIEW
        ===================================================== */}

        <section
          className="
            overflow-hidden
            rounded-[24px]
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          {/* OVERVIEW TOGGLE */}

          <button
            type="button"
            onClick={() =>
              setShowCRMOverview(
                (previous) =>
                  !previous
              )
            }
            className="
              flex
              w-full
              items-center
              justify-between
              gap-4
              px-5
              py-4
              text-left
              transition-colors
              hover:bg-slate-50
              sm:px-6
            "
            aria-expanded={
              showCRMOverview
            }
          >
            <div
              className="
                flex
                min-w-0
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
                  text-[#172B6B]
                "
              >
                <FiCheckCircle
                  size={16}
                />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  CRM Overview
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[11px]
                    text-slate-400
                  "
                >
                  {showCRMOverview
                    ? "Performance summary and activity"
                    : "Click to view CRM statistics"}
                </p>
              </div>
            </div>

            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-slate-400
              "
            >
              <FiChevronDown
                size={16}
                className={
                  showCRMOverview
                    ? "rotate-180 transition-transform duration-200"
                    : "transition-transform duration-200"
                }
              />
            </span>
          </button>

          {/* STATS */}

          {showCRMOverview && (
            <div
              className="
                border-t
                border-slate-100
                p-3
                sm:p-4
              "
            >
              <CRMStats
                customers={
                  customers
                }
                orders={
                  orders
                }
              />
            </div>
          )}
        </section>

        {/* =====================================================
            MAIN CRM WORKSPACE
        ===================================================== */}

        <section
          className="
            overflow-hidden
            rounded-[30px]
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          {/* TAB BAR */}

          <div
            className="
              border-b
              border-slate-100
              bg-slate-50/40
              px-4
              py-3
              sm:px-5
            "
          >
            <CRMTabs
              activeTab={
                activeTab
              }
              setActiveTab={
                setActiveTab
              }
            />
          </div>

          {/* CONTENT */}

          <div
            className="
              p-4
              sm:p-5
              lg:p-6
            "
          >
            {/* =================================================
                CUSTOMERS
            ================================================= */}

            {activeTab ===
              "customers" && (
              <>
                {/* =================================================
                    DESKTOP
                ================================================= */}

                <div
                  className="
                    hidden
                    gap-5
                    xl:grid
                    xl:grid-cols-[360px_minmax(0,1fr)]
                  "
                >
                  {/* CUSTOMER LIST */}

                  <div className="min-w-0">
                    <CustomerList
                      search={
                        search
                      }
                      setSearch={
                        setSearch
                      }
                      customers={
                        crmRecords
                      }
                      selectedCustomer={
                        selectedCustomer
                      }
                      setSelectedCustomer={
                        setSelectedCustomer
                      }
                    />
                  </div>

                  {/* CUSTOMER PROFILE */}

                  <div className="min-w-0">
                    <CustomerProfile
                      customer={
                        selectedCustomer
                      }
                      orders={
                        orders
                      }

                      onEdit={(
                        customer
                      ) => {
                        /*
                         * Accounts Parties remain owned
                         * by Accounts.
                         */

                        if (
                          customer?.source ===
                          "ACCOUNTS"
                        ) {
                          window.alert(
                            "This customer is managed from Accounts."
                          );

                          return;
                        }

                        setEditingCustomer(
                          customer
                        );

                        setShowAddCustomer(
                          true
                        );
                      }}

                      onDelete={
                        handleDeleteCustomer
                      }

                      onCreateOrder={
                        handleCreateOrder
                      }

                      onAddNote={() => {
                        /*
                         * CRM notes remain attached
                         * to CRM records for now.
                         */

                        if (
                          selectedCustomer?.source ===
                          "ACCOUNTS"
                        ) {
                          window.alert(
                            "Conversation notes for Account Parties will be connected to the CRM activity layer."
                          );

                          return;
                        }

                        setShowNoteModal(
                          true
                        );
                      }}

                    />
                  </div>
                </div>

                {/* =================================================
                    MOBILE / TABLET

                    List and profile are mutually exclusive.
                ================================================= */}

                <div className="xl:hidden">
                  {/* CUSTOMER LIST */}

                  {!selectedCustomer && (
                    <div className="min-w-0">
                      <CustomerList
                        search={
                          search
                        }
                        setSearch={
                          setSearch
                        }
                        customers={
                          crmRecords
                        }
                        selectedCustomer={
                          selectedCustomer
                        }
                        setSelectedCustomer={
                          setSelectedCustomer
                        }
                      />
                    </div>
                  )}

                  {/* CUSTOMER PROFILE */}

                  {selectedCustomer && (
                    <div className="min-w-0">
                      <CustomerProfile
                        customer={
                          selectedCustomer
                        }
                        orders={
                          orders
                        }

                        onBackToList={() => {
                          setSelectedCustomer(
                            null
                          );

                          setOrders(
                            []
                          );
                        }}

                        onEdit={(
                          customer
                        ) => {
                          /*
                           * Accounts Parties remain owned
                           * by Accounts.
                           */

                          if (
                            customer?.source ===
                            "ACCOUNTS"
                          ) {
                            window.alert(
                              "This customer is managed from Accounts."
                            );

                            return;
                          }

                          setEditingCustomer(
                            customer
                          );

                          setShowAddCustomer(
                            true
                          );
                        }}

                        onDelete={
                          handleDeleteCustomer
                        }

                        onCreateOrder={
                          handleCreateOrder
                        }

                        onAddNote={() => {
                          /*
                           * CRM notes remain attached
                           * to CRM records for now.
                           */

                          if (
                            selectedCustomer?.source ===
                            "ACCOUNTS"
                          ) {
                            window.alert(
                              "Conversation notes for Account Parties will be connected to the CRM activity layer."
                            );

                            return;
                          }

                          setShowNoteModal(
                            true
                          );
                        }}

                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* =================================================
                PIPELINE
            ================================================= */}

            {activeTab ===
              "pipeline" && (
              <SalesPipeline />
            )}

            {/* =================================================
                DUE DATES
            ================================================= */}

            {activeTab ===
              "dues" && (
              <CRMDueDates />
            )}

            {/* =================================================
                ORDERS
            ================================================= */}

            {activeTab ===
              "orders" && (
              <OrdersTable
                orders={
                  orders
                }
                onEdit={(
                  order
                ) => {
                  setEditingOrder(
                    order
                  );

                  setShowOrderModal(
                    true
                  );
                }}
                onDelete={
                  handleDeleteOrder
                }

              />
            )}

          </div>
        </section>

        {/* =====================================================
            CUSTOMER MODAL
        ===================================================== */}

        <CustomerModal
          open={
            showAddCustomer
          }
          customer={
            editingCustomer
          }
          onClose={() => {
            setShowAddCustomer(
              false
            );

            setEditingCustomer(
              null
            );
          }}
          onSuccess={async () => {
            await loadCustomers();

            setShowAddCustomer(
              false
            );

            setEditingCustomer(
              null
            );
          }}
        />

        {/* =====================================================
            ORDER MODAL
        ===================================================== */}

        <OrderModal
          open={
            showOrderModal
          }
          customer={
            selectedCustomer
          }
          order={
            editingOrder
          }
          onClose={() => {
            setShowOrderModal(
              false
            );

            setEditingOrder(
              null
            );
          }}
          onSuccess={async () => {
            await loadCustomerData();

            setShowOrderModal(
              false
            );

            setEditingOrder(
              null
            );
          }}
        />

        {/* =====================================================
            NOTE MODAL
        ===================================================== */}

        <AddNoteModal
          open={
            showNoteModal
          }
          customerId={
            selectedCustomer?.source ===
            "CRM"
              ? selectedCustomer?._id
              : undefined
          }
          onClose={() =>
            setShowNoteModal(
              false
            )
          }
          onSuccess={async () => {
            await loadCustomers();

            await loadCustomerData();

            setShowNoteModal(
              false
            );
          }}
        />
      </div>
    </CRMStaffLayout>
  );
};

/* =========================================================
   ACCOUNT PARTY NORMALIZER
========================================================= */

const normalizeAccountParty = (
  party: any
) => {
  return {
    ...party,

    /*
     * =======================================================
     * SOURCE / CRM TYPE
     * =======================================================
     *
     * AccountParty is a PARTY in CRM,
     * not a CRM Customer.
     */

    source: "ACCOUNTS",
    crmType: "PARTY",

    /*
     * =======================================================
     * COMMON CRM FIELDS
     * =======================================================
     */

    customerCode:
      party.partyCode ||
      "",

    companyName:
      party.companyName ||
      party.firmName ||
      "",

    contactPerson:
      party.contactPerson ||
      "",

    phone:
      party.phone ||
      "",

    email:
      party.email ||
      "",

    address:
      party.address ||
      "",

    city:
      party.city ||
      "",

    state:
      party.state ||
      "",

    pincode:
      party.pincode ||
      "",

    openingBalance:
      party.openingBalance ||
      0,

    currentBalance:
      party.currentBalance ||
      0,

    status:
      party.status ||
      "Active",

    partyType:
      party.partyType ||
      "",

    /*
     * =======================================================
     * SALESPERSON RELATIONSHIP
     * =======================================================
     *
     * This comes directly from Accounts.
     *
     * Database stores IDs.
     * CRM UI resolves/displays names.
     */

    assignedSalespeople:
      Array.isArray(
        party.assignedSalespeople
      )
        ? party.assignedSalespeople
        : [],
  };
};

export default CRMStaffPage;