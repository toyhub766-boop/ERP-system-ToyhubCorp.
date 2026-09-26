import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getCustomers,
  deleteCustomer,
} from "../services/customer.service";

import {
  getParties,
} from "../../accounts/services/accountParty.service";

import {
  getOrders,
  updateOrder,
  sendOrderToProduction,
  deleteOrder,
  deleteOrdersBulk,
} from "../services/order.service";

import {
  getProductions,
} from "../../production/services/production.services";

import CRMHeader from "../components/CRMHeader";
import CRMStats from "../components/CRMStats";
import CRMTabs from "../components/CRMTabs";

import CustomerList from "../components/CustomerList";
import CustomerProfile from "../components/CustomerProfile";
import OrdersTable from "../components/OrdersTable";
import OrderCreateModal from "../components/OrderCreateModal";
import Catalogue from "../components/Catalogue";

import CustomerModal from "../components/CustomerModal";
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
  | "catalogue"
  | "pipeline"
  | "dues"
  | "orders";

type CRMRecord = any;

const CRMPage = () => {
  /*
  |--------------------------------------------------------------------------
  | TAB
  |--------------------------------------------------------------------------
  */

  const [activeTab, setActiveTab] =
    useState<CRMTab>("customers");

  /*
  |--------------------------------------------------------------------------
  | COMPACT CRM CONTROLS
  |--------------------------------------------------------------------------
  */

  const [showCRMOverview, setShowCRMOverview] =
    useState(false);

  const [showFollowUpCenter, setShowFollowUpCenter] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | CRM CUSTOMERS / LEADS
  |--------------------------------------------------------------------------
  */

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  /*
  |--------------------------------------------------------------------------
  | ACCOUNTS PARTIES
  |--------------------------------------------------------------------------
  */

  const [accountParties, setAccountParties] =
    useState<any[]>([]);

  /*
  |--------------------------------------------------------------------------
  | SELECTED CRM RECORD
  |--------------------------------------------------------------------------
  */

  const [selectedCustomer, setSelectedCustomer] =
    useState<CRMRecord>(null);

  const [search, setSearch] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | PRODUCTION TRACKING
  |--------------------------------------------------------------------------
  */

  const [orders, setOrders] =
    useState<any[]>([]);

  const [crmOrders, setCrmOrders] =
    useState<any[]>([]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCTION FORM DATA
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER MODAL
  |--------------------------------------------------------------------------
  */

  const [showAddCustomer, setShowAddCustomer] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<any>(null);

  /*
  |--------------------------------------------------------------------------
  | CRM ORDER MODAL
  |--------------------------------------------------------------------------
  */

  const [showOrderModal, setShowOrderModal] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | NOTES
  |--------------------------------------------------------------------------
  */

  const [showNoteModal, setShowNoteModal] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD CRM CUSTOMERS
  |--------------------------------------------------------------------------
  */

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();

      const safeData =
        Array.isArray(data) ? data : [];

      setCustomers(safeData);

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
            return current;
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

            return stillExists
              ? {
                  ...stillExists,
                  source: "CRM",
                  crmType: "LEAD",
                }
              : current;
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

  /*
  |--------------------------------------------------------------------------
  | LOAD ACCOUNTS PARTIES
  |--------------------------------------------------------------------------
  */

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
              !current?._id ||
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

  /*
  |--------------------------------------------------------------------------
  | LOAD PRODUCTION ORDERS
  |--------------------------------------------------------------------------
  */

  const loadProductionOrders =
    async () => {
      try {
        const data =
          await getProductions();

        setOrders(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load production orders:",
          error
        );

        setOrders([]);
      }
    };

  const loadCRMOrders =
    async () => {
      try {
        const data =
          await getOrders();

        setCrmOrders(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load CRM orders:",
          error
        );

        setCrmOrders([]);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadCustomers();
    loadAccountParties();
    loadProductionOrders();
    loadCRMOrders();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | COMBINED CRM WORKSPACE DATA
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | KEEP SELECTED RECORD IN SYNC
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER ORDER HISTORY
  |--------------------------------------------------------------------------
  */

  const customerOrders =
    useMemo(() => {
      if (
        !selectedCustomer?._id
      ) {
        return [];
      }

      const selectedId =
        String(
          selectedCustomer._id
        );

      return crmOrders.filter(
        (order: any) => {
          const customerId =
            order?.customer?._id ||
            order?.customer;

          return (
            customerId &&
            String(customerId) === selectedId
          );
        }
      );
    }, [
      crmOrders,
      selectedCustomer?._id,
    ]);

  /*
  |--------------------------------------------------------------------------
  | REMINDER DATA
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | DELETE CUSTOMER
  |--------------------------------------------------------------------------
  */

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

        await loadCustomers();
      } catch (error) {
        console.error(
          "Failed to delete customer:",
          error
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | CREATE PRODUCTION ORDER
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | This can ONLY be opened from the
  | currently selected customer.
  |
  */

  const handleCreateOrder = () => {
    if (!selectedCustomer?._id) {
      window.alert(
        "Open a customer profile before creating an order."
      );
      return;
    }

    if (selectedCustomer.source !== "ACCOUNTS") {
      window.alert(
        "Convert this CRM lead into an Account customer before creating an order."
      );
      return;
    }

    setShowOrderModal(true);
  };

  const handleSendOrderToProduction = async (order: any) => {
    if (!order?._id) return;

    if (order?.production) {
      window.alert(
        `${order?.orderNumber || "This order"} has already been sent to Production.`
      );
      return;
    }

    if (order?.status !== "Confirmed") {
      window.alert(
        "Only confirmed CRM orders can be sent to Production."
      );
      return;
    }

    try {
      await sendOrderToProduction(order._id);

      await Promise.all([
        loadCRMOrders(),
        loadProductionOrders(),
      ]);
    } catch (error: any) {
      console.error(
        "Failed to send CRM order to Production:",
        error
      );

      window.alert(
        error?.response?.data?.message ||
          "Failed to send order to Production."
      );
    }
  };

  const handleConfirmCRMOrder = async (order: any) => {
    if (!order?._id) return;

    if (order?.status !== "Pending") {
      window.alert(
        "Only pending CRM orders can be confirmed."
      );
      return;
    }

    try {
      await updateOrder(order._id, {
        status: "Confirmed",
      });

      await loadCRMOrders();
    } catch (error: any) {
      console.error(
        "Failed to confirm CRM order:",
        error
      );

      window.alert(
        error?.response?.data?.message ||
          "Failed to confirm order."
      );
    }
  };

  const handleBulkDeleteCRMOrders = async (selectedOrders: any[]) => {
    const ids = selectedOrders
      .map((order: any) => order?._id)
      .filter(Boolean);

    if (!ids.length) return;

    try {
      await deleteOrdersBulk(ids);
      await Promise.all([
        loadCRMOrders(),
        loadProductionOrders(),
      ]);
    } catch (error: any) {
      console.error(
        "Failed to bulk delete CRM orders:",
        error
      );

      window.alert(
        error?.response?.data?.message ||
          "Failed to delete selected orders."
      );

      throw error;
    }
  };

  const handleDeleteCRMOrder =
    async (
      order: any
    ) => {
      if (!order?._id) {
        return;
      }

      const orderNumber =
        order.orderNumber ||
        "this order";

      if (
        !window.confirm(
          `Delete ${orderNumber}?`
        )
      ) {
        return;
      }

      try {
        await deleteOrder(
          order._id
        );

        await loadCRMOrders();
      } catch (error: any) {
        console.error(
          "Failed to delete CRM order:",
          error
        );

        window.alert(
          error?.response?.data?.message ||
            "Failed to delete order."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

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
        {/* Header */}

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

        {/* Compact controls */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-2
          "
        >
          <button
            type="button"
            onClick={() =>
              setShowFollowUpCenter(
                (current) =>
                  !current
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
              transition
              ${
                showFollowUpCenter
                  ? "border-[#172B6B] bg-[#172B6B] text-white"
                  : "border-slate-200 text-[#172B6B] hover:bg-slate-50"
              }
            `}
          >
            <FiActivity size={17} />
          </button>

          <button
            type="button"
            onClick={() =>
              setShowCRMOverview(
                (current) =>
                  !current
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
              transition
              ${
                showCRMOverview
                  ? "border-[#172B6B] bg-[#172B6B] text-white"
                  : "border-slate-200 text-[#172B6B] hover:bg-slate-50"
              }
            `}
          >
            <FiBarChart2 size={17} />
          </button>
        </div>

        {/* Follow-up Center */}

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

              <div
                className="
                  grid
                  grid-cols-3
                  gap-2
                  sm:gap-3
                  lg:min-w-[300px]
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "dues"
                    )
                  }
                  className="
                    rounded-2xl
                    border
                    border-red-100
                    bg-red-50/60
                    p-3
                    text-left
                    transition
                    hover:bg-red-50
                  "
                >
                  <div className="flex items-center justify-between">
                    <FiAlertCircle
                      size={15}
                      className="text-red-500"
                    />

                    <FiArrowUpRight
                      size={13}
                      className="text-red-300"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-red-600">
                    {
                      reminderStats.overdue
                    }
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                    Overdue
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "dues"
                    )
                  }
                  className="
                    rounded-2xl
                    border
                    border-amber-100
                    bg-amber-50/60
                    p-3
                    text-left
                    transition
                    hover:bg-amber-50
                  "
                >
                  <div className="flex items-center justify-between">
                    <FiClock
                      size={15}
                      className="text-amber-600"
                    />

                    <FiArrowUpRight
                      size={13}
                      className="text-amber-300"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-amber-700">
                    {
                      reminderStats.today
                    }
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                    Today
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "dues"
                    )
                  }
                  className="
                    rounded-2xl
                    border
                    border-green-100
                    bg-green-50/60
                    p-3
                    text-left
                    transition
                    hover:bg-green-50
                  "
                >
                  <div className="flex items-center justify-between">
                    <FiCalendar
                      size={15}
                      className="text-green-600"
                    />

                    <FiArrowUpRight
                      size={13}
                      className="text-green-300"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-green-700">
                    {
                      reminderStats.upcoming
                    }
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-600">
                    Upcoming
                  </p>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* CRM Overview */}

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
            <div className="p-3 sm:p-4">
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

        {/* Main Workspace */}

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

          <div
            className="
              p-4
              sm:p-5
              lg:p-6
            "
          >
            {/* Customers */}

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
                        customerOrders
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
                            "Conversation notes for Account Parties are managed from the Accounts relationship."
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
                  )}

                  {selectedCustomer && (
                    <CustomerProfile
                      customer={
                        selectedCustomer
                      }
                      orders={
                        customerOrders
                      }
                      onBackToList={() =>
                        setSelectedCustomer(
                          null
                        )
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
                            "Conversation notes for Account Parties are managed from the Accounts relationship."
                          );

                          return;
                        }

                        setShowNoteModal(
                          true
                        );
                      }}
                    />
                  )}
                </div>
              </>
            )}

            {/* Catalogue */}

            {activeTab ===
              "catalogue" && (
              <Catalogue />
            )}

            {/* Sales Pipeline */}

            {activeTab ===
              "pipeline" && (
              <SalesPipeline />
            )}

            {/* Due Dates */}

            {activeTab ===
              "dues" && (
              <CRMDueDates />
            )}

            {/* Orders */}

            {activeTab ===
              "orders" && (
              <div className="space-y-5">
                <div className="flex justify-end">
                  <OrderCreateModal
                    onCreated={
                      loadCRMOrders
                    }
                  />
                </div>

                <OrdersTable
                  orders={crmOrders}
                  productionOrders={orders}
                  onConfirm={handleConfirmCRMOrder}
                  onSendToProduction={
                    handleSendOrderToProduction
                  }
                  onEdit={() => {
                    window.alert(
                      "CRM order editing is handled through order status and notes."
                    );
                  }}
                  onDelete={handleDeleteCRMOrder}
                  onBulkDelete={
                    handleBulkDeleteCRMOrders
                  }
                />
              </div>
            )}
          </div>
        </section>

        {/* Customer Modal */}

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

        {/* CREATE CRM ORDER FROM CUSTOMER PROFILE */}
        <OrderCreateModal
          open={showOrderModal}
          initialCustomerId={selectedCustomer?.source === "ACCOUNTS" ? selectedCustomer?._id : undefined}
          onClose={() => {
            setShowOrderModal(false);
          }}
          onCreated={async () => {
            await loadCRMOrders();
            setShowOrderModal(false);
          }}
        />

        {/* Note Modal */}

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

            setShowNoteModal(
              false
            );
          }}
        />
      </div>
    </AdminLayout>
  );
};

/*
|--------------------------------------------------------------------------
| ACCOUNT PARTY NORMALIZER
|--------------------------------------------------------------------------
*/

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