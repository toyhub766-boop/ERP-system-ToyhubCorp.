import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";

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
  FiClock,
  FiActivity,
  FiBarChart2,
} from "react-icons/fi";

import type { Customer } from "../types/customer.types";

type CRMTab =
  | "customers"
  | "pipeline"
  | "dues"
  | "orders";

type CRMRecord = any;

const CRMPage = () => {
  // =========================================================
  // TAB
  // =========================================================

  const [activeTab, setActiveTab] =
    useState<CRMTab>("customers");

  // =========================================================
  // CRM OVERVIEW
  // =========================================================

  const [showCRMOverview, setShowCRMOverview] =
    useState(false);

  // =========================================================
  // FOLLOW-UP COMMAND CENTER
  // =========================================================

  const [showFollowUpCenter, setShowFollowUpCenter] =
    useState(false);

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

      setSelectedCustomer(
        (current: any) => {
          if (!safeData.length) {
            if (
              current?.source ===
              "ACCOUNTS"
            ) {
              return current;
            }

            return null;
          }

          if (!current?._id) {
            return null;
          }

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
      const crmRecords =
        customers.map(
          (customer: any) => ({
            ...customer,
            source: "CRM",
            crmType: "LEAD",
          })
        );

      const partyRecords =
        accountParties
          .filter(
            (party: any) => {
              if (
                party.status ===
                "Inactive"
              ) {
                return false;
              }

              if (
                party.partyType ===
                "COMPANY_EXPENSE"
              ) {
                return false;
              }

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
    <AdminLayout>
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
            COMPACT CRM UTILITY CONTROLS
        ===================================================== */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-2
          "
        >
          {/* FOLLOW-UP */}

          <button
            type="button"
            onClick={() =>
              setShowFollowUpCenter(
                (previous) =>
                  !previous
              )
            }
            aria-label="Toggle Follow-up Command Center"
            aria-expanded={
              showFollowUpCenter
            }
            title="Follow-up Command Center"
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              bg-white
              shadow-sm
              transition-all
              duration-200
              ${
                showFollowUpCenter
                  ? "border-[#172B6B] bg-[#172B6B] text-white"
                  : "border-slate-200 text-[#172B6B] hover:border-slate-300 hover:bg-slate-50"
              }
            `}
          >
            <FiActivity
              size={17}
              strokeWidth={2}
            />
          </button>

          {/* CRM OVERVIEW */}

          <button
            type="button"
            onClick={() =>
              setShowCRMOverview(
                (previous) =>
                  !previous
              )
            }
            aria-label="Toggle CRM Overview"
            aria-expanded={
              showCRMOverview
            }
            title="CRM Overview"
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              bg-white
              shadow-sm
              transition-all
              duration-200
              ${
                showCRMOverview
                  ? "border-[#172B6B] bg-[#172B6B] text-white"
                  : "border-slate-200 text-[#172B6B] hover:border-slate-300 hover:bg-slate-50"
              }
            `}
          >
            <FiBarChart2
              size={17}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* =====================================================
            FOLLOW-UP COMMAND CENTER
            EXISTING CONTENT PRESERVED
        ===================================================== */}

        {showFollowUpCenter && (
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
            <div
              className="
                flex
                flex-col
                gap-5
                p-4
                sm:p-5
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
          </section>
        )}

        
        {/* =====================================================
            CRM OVERVIEW
            EXISTING STATS PRESERVED
        ===================================================== */}

        {showCRMOverview && (
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
            <div
              className="
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
          </section>
        )}

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
                <div
                  className="
                    hidden
                    gap-5
                    xl:grid
                    xl:grid-cols-[360px_minmax(0,1fr)]
                  "
                >
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

                <div className="xl:hidden">
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
    </AdminLayout>
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

    source: "ACCOUNTS",
    crmType: "PARTY",

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

    assignedSalespeople:
      Array.isArray(
        party.assignedSalespeople
      )
        ? party.assignedSalespeople
        : [],
  };
};

export default CRMPage;