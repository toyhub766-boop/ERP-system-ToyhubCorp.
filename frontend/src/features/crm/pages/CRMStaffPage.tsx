import {
  useEffect,
  useMemo,
  useState,
} from "react";

import CRMStaffLayout from "../components/CRMStaffLayout";

import {
  getCustomers,
  deleteCustomer,
} from "../services/customer.service";

import {
  getParties,
} from "../../accounts/services/accountParty.service";

import {
  getProductions,
  createProduction,
  updateProduction,
  deleteProduction,
} from "../../production/services/production.services";

import {
  getBOMs,
} from "../../bom/services/bom.service";

import CRMHeader from "../components/CRMHeader";
import CRMStats from "../components/CRMStats";
import CRMTabs from "../components/CRMTabs";

import CustomerList from "../components/CustomerList";
import CustomerProfile from "../components/CustomerProfile";
import OrdersTable from "../components/OrdersTable";
import Catalogue from "../components/Catalogue";

import CustomerModal from "../components/CustomerModal";
import AddNoteModal from "../components/AddNoteModal";

import SalesPipeline from "../components/SalesPipeline";
import CRMDueDates from "../components/CRMDueDates";

import ProductionCreateModal from "../../production/components/ProductionCreateModal";
import ProductionEditModal from "../../production/components/ProductionEditModal";

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

const CRMStaffPage = () => {
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
  | PRODUCTION ORDERS
  |--------------------------------------------------------------------------
  */

  const [orders, setOrders] =
    useState<any[]>([]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCTION FORM DATA
  |--------------------------------------------------------------------------
  */

  const [productionBOMs, setProductionBOMs] =
    useState<any[]>([]);

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
  | PRODUCTION ORDER MODALS
  |--------------------------------------------------------------------------
  */

  const [showOrderModal, setShowOrderModal] =
    useState(false);

  const [editingOrder, setEditingOrder] =
    useState<any>(null);

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

  /*
  |--------------------------------------------------------------------------
  | LOAD PRODUCTION FORM DATA
  |--------------------------------------------------------------------------
  |
  | Only BOM data is required by the CRM
  | production-order modal.
  |
  */

  const loadProductionFormData =
    async () => {
      try {
        const bomData =
          await getBOMs();

        setProductionBOMs(
          Array.isArray(bomData)
            ? bomData
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load production form data:",
          error
        );

        setProductionBOMs([]);
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
    loadProductionFormData();
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

      return orders.filter(
        (order: any) => {
          const clientId =
            order?.client?._id ||
            order?.client;

          return (
            clientId &&
            String(
              clientId
            ) === selectedId
          );
        }
      );
    }, [
      orders,
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

  const handleCreateOrder =
    () => {
      if (!selectedCustomer?._id) {
        window.alert(
          "Open a customer profile before creating an order."
        );

        return;
      }

      if (
        selectedCustomer.source !==
        "ACCOUNTS"
      ) {
        window.alert(
          "Convert this CRM lead into an Account customer before creating a production order."
        );

        return;
      }

      setEditingOrder(null);
      setShowOrderModal(true);
    };

  /*
  |--------------------------------------------------------------------------
  | CREATE PRODUCTION ORDER
  |--------------------------------------------------------------------------
  */

  const handleCreateProductionOrder =
    async (
      data: any
    ) => {
      if (!selectedCustomer?._id) {
        throw new Error(
          "Customer context is missing."
        );
      }

      /*
       * Production orders can only belong to
       * real AccountParty customers.
       *
       * CRM leads/customers must first be
       * converted into an Account Party.
       */

      if (
        selectedCustomer.source !==
        "ACCOUNTS"
      ) {
        window.alert(
          "This CRM record must be converted to an Account customer before a production order can be created."
        );

        throw new Error(
          "Production order requires an AccountParty customer."
        );
      }

      try {
        await createProduction({
          ...data,

          client:
            selectedCustomer._id,

          clientModel:
            "AccountParty",
        });

        await loadProductionOrders();

        setShowOrderModal(false);
        setEditingOrder(null);
      } catch (error: any) {
        console.error(
          "Failed to create production order:",
          error
        );

        window.alert(
          error?.response?.data?.message ||
            "Failed to create production order."
        );

        throw error;
      }
    };

  /*
  |--------------------------------------------------------------------------
  | EDIT PRODUCTION ORDER
  |--------------------------------------------------------------------------
  */

  const handleEditOrder =
    (order: any) => {
      setEditingOrder(
        order
      );

      setShowOrderModal(
        true
      );
    };

  /*
  |--------------------------------------------------------------------------
  | DELETE PRODUCTION ORDER
  |--------------------------------------------------------------------------
  */

  const handleDeleteOrder =
    async (
      order: any
    ) => {
      if (!order?._id) {
        return;
      }

      const orderNumber =
        order.orderNumber ||
        "this production order";

      if (
        !window.confirm(
          `Delete ${orderNumber}?`
        )
      ) {
        return;
      }

      try {
        await deleteProduction(
          order._id
        );

        await loadProductionOrders();
      } catch (error) {
        console.error(
          "Failed to delete production order:",
          error
        );

        window.alert(
          "Failed to delete production order."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | RAW PRODUCTS
  |--------------------------------------------------------------------------
  */

  const rawProducts =
    useMemo(() => {
      const products =
        productionBOMs.flatMap(
          (bom: any) =>
            (
              bom.materials ||
              []
            )
              .map(
                (material: any) =>
                  material.product
              )
              .filter(Boolean)
        );

      const unique =
        new Map();

      products.forEach(
        (product: any) => {
          if (
            product?._id
          ) {
            unique.set(
              String(
                product._id
              ),
              product
            );
          }
        }
      );

      return Array.from(
        unique.values()
      );
    }, [
      productionBOMs,
    ]);

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

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
              <OrdersTable
                orders={
                  orders
                }
                onEdit={
                  handleEditOrder
                }
                onDelete={
                  handleDeleteOrder
                }
              />
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

        {/* CREATE ORDER */}

        <ProductionCreateModal
          open={
            showOrderModal &&
            !editingOrder
          }
          customer={
            selectedCustomer
          }
          boms={
            productionBOMs
          }
          rawProducts={
            rawProducts
          }
          onClose={() => {
            setShowOrderModal(
              false
            );

            setEditingOrder(
              null
            );
          }}
          onCreate={
            handleCreateProductionOrder
          }
        />

        {/* EDIT ORDER */}

        <ProductionEditModal
          open={
            showOrderModal &&
            !!editingOrder
          }
          production={
            editingOrder
          }
          customer={
            editingOrder?.client
          }
          boms={
            productionBOMs
          }
          rawProducts={
            rawProducts
          }
          onClose={() => {
            setShowOrderModal(
              false
            );

            setEditingOrder(
              null
            );
          }}
          onSave={async (
            data
          ) => {
            if (
              !editingOrder?._id
            ) {
              return;
            }

            /*
             * IMPORTANT:
             * Do not send a new customer.
             * Editing does not transfer
             * ownership of the order.
             */

            await updateProduction(
              editingOrder._id,
              data
            );

            await loadProductionOrders();

            setShowOrderModal(
              false
            );

            setEditingOrder(
              null
            );
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
    </CRMStaffLayout>
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

export default CRMStaffPage;