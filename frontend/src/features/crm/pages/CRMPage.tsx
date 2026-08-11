import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getOrdersByCustomer,
  deleteOrder,
} from "../services/order.service";

import {
  getPaymentsByCustomer,
  deletePayment,
} from "../services/payment.service";

import {
  getCustomers,
  deleteCustomer,
} from "../services/customer.service";

import CRMHeader from "../components/CRMHeader";
import CRMStats from "../components/CRMStats";
import CRMTabs from "../components/CRMTabs";

import CustomerList from "../components/CustomerList";
import CustomerProfile from "../components/CustomerProfile";

import OrdersTable from "../components/OrdersTable";
import PaymentsOverview from "../components/PaymentsOverview";

import CustomerModal from "../components/CustomerModal";
import OrderModal from "../components/OrderModal";
import PaymentModal from "../components/PaymentModal";
import AddNoteModal from "../components/AddNoteModal";

import SalesPipeline from "../components/SalesPipeline";
import CRMDueDates from "../components/CRMDueDates";

import {
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

import type { Customer } from "../types/customer.types";

type CRMTab =
  | "customers"
  | "pipeline"
  | "dues"
  | "orders"
  | "payments";

const CRMPage = () => {
  // =========================================================
  // TAB
  // =========================================================

  const [activeTab, setActiveTab] =
    useState<CRMTab>("customers");

  // =========================================================
  // CUSTOMER DATA
  // =========================================================

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState<any>(null);

  const [search, setSearch] = useState("");

  // =========================================================
  // ORDERS / PAYMENTS
  // =========================================================

  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

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
  // PAYMENT MODAL
  // =========================================================

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [editingPayment, setEditingPayment] =
    useState<any>(null);

  const [selectedOrder, setSelectedOrder] =
    useState<any>(null);

  // =========================================================
  // NOTES
  // =========================================================

  const [showNoteModal, setShowNoteModal] =
    useState(false);

  // =========================================================
  // LOAD CUSTOMER DATA
  // =========================================================

  const loadCustomerData = async (
    customerId?: string
  ) => {
    const id =
      customerId ||
      selectedCustomer?._id;

    if (!id) {
      setOrders([]);
      setPayments([]);
      return;
    }

    try {
      const [
        ordersData,
        paymentsData,
      ] = await Promise.all([
        getOrdersByCustomer(id),
        getPaymentsByCustomer(id),
      ]);

      setOrders(ordersData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error(
        "Failed to load customer data:",
        error
      );
    }
  };

  // =========================================================
  // LOAD CUSTOMERS
  // =========================================================

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();

      setCustomers(data || []);

      setSelectedCustomer((current: any) => {
        if (!data?.length) {
          return null;
        }

        if (!current?._id) {
          return data[0];
        }

        const updatedCustomer =
          data.find(
            (customer: any) =>
              customer._id === current._id
          );

        return (
          updatedCustomer ||
          data[0]
        );
      });
    } catch (error) {
      console.error(
        "Failed to load customers:",
        error
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCustomers();
  }, []);

  // =========================================================
  // LOAD SELECTED CUSTOMER DATA
  // =========================================================

  useEffect(() => {
    if (!selectedCustomer?._id) {
      setOrders([]);
      setPayments([]);
      return;
    }

    loadCustomerData(
      selectedCustomer._id
    );
  }, [selectedCustomer?._id]);

  // =========================================================
  // REMINDER DATA
  // =========================================================

  const reminderStats = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    let overdue = 0;
    let todayCount = 0;
    let upcoming = 0;

    customers.forEach((customer: any) => {
      customer.specialNotes?.forEach(
        (note: any) => {
          if (
            !note.reminderDate ||
            note.completed
          ) {
            return;
          }

          const reminder =
            new Date(note.reminderDate);

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
          } else if (reminder < today) {
            overdue++;
          } else {
            upcoming++;
          }
        }
      );
    });

    return {
      overdue,
      today: todayCount,
      upcoming,
    };
  }, [customers]);

  // =========================================================
  // DELETE CUSTOMER
  // =========================================================

  const handleDeleteCustomer = async (
    customer: any
  ) => {
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

      setSelectedCustomer(null);
      setOrders([]);
      setPayments([]);

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

  const handleDeleteOrder = async (
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
      await deleteOrder(order._id);

      await loadCustomerData();
    } catch (error) {
      console.error(
        "Failed to delete order:",
        error
      );
    }
  };

  // =========================================================
  // DELETE PAYMENT
  // =========================================================

  const handleDeletePayment = async (
    payment: any
  ) => {
    if (
      !window.confirm(
        "Delete payment?"
      )
    ) {
      return;
    }

    try {
      await deletePayment(
        payment._id
      );

      await loadCustomerData();
    } catch (error) {
      console.error(
        "Failed to delete payment:",
        error
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <CRMHeader
          onAddCustomer={() => {
            setEditingCustomer(null);
            setShowAddCustomer(true);
          }}
        />

        {/* =====================================================
            CRM OVERVIEW
        ===================================================== */}

        <section className="grid gap-4 lg:grid-cols-[1fr_auto]">

          {/* Reminder Command Center */}

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
            <div
              className="
                flex
                flex-col
                gap-5
                p-5
                sm:p-6
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="
                      h-2
                      w-2
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

                <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                  Stay ahead of customer conversations
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track overdue, today's and upcoming
                  customer activities.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">

                {/* OVERDUE */}

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("dues")
                  }
                  className="
                    group
                    min-w-[90px]
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
                  <div className="flex items-center justify-between">
                    <FiAlertCircle
                      size={15}
                      className="text-red-500"
                    />

                    <FiArrowUpRight
                      size={13}
                      className="text-red-300 transition group-hover:text-red-500"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-red-600">
                    {reminderStats.overdue}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                    Overdue
                  </p>
                </button>

                {/* TODAY */}

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("dues")
                  }
                  className="
                    group
                    min-w-[90px]
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
                  <div className="flex items-center justify-between">
                    <FiClock
                      size={15}
                      className="text-amber-600"
                    />

                    <FiArrowUpRight
                      size={13}
                      className="text-amber-300 transition group-hover:text-amber-600"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-amber-700">
                    {reminderStats.today}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                    Today
                  </p>
                </button>

                {/* UPCOMING */}

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("dues")
                  }
                  className="
                    group
                    min-w-[90px]
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
                  <div className="flex items-center justify-between">
                    <FiCalendar
                      size={15}
                      className="text-green-600"
                    />

                    <FiArrowUpRight
                      size={13}
                      className="text-green-300 transition group-hover:text-green-600"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-green-700">
                    {reminderStats.upcoming}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-600">
                    Upcoming
                  </p>
                </button>

              </div>
            </div>
          </div>

          {/* Quick status */}

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
              <FiCheckCircle size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                CRM Status
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Workspace Active
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {customers.length} customers managed
              </p>
            </div>
          </div>

        </section>

        {/* =====================================================
            CORE CRM STATS
        ===================================================== */}

        <CRMStats
          customers={customers}
          orders={orders}
          payments={payments}
        />

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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* CONTENT */}

          <div className="p-4 sm:p-5 lg:p-6">

            {/* =================================================
                CUSTOMERS
            ================================================= */}

            {activeTab === "customers" && (
              <div
                className="
                  grid
                  gap-5
                  xl:grid-cols-[360px_minmax(0,1fr)]
                "
              >

                <div className="min-w-0">
                  <CustomerList
                    search={search}
                    setSearch={setSearch}
                    customers={customers}
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
                    orders={orders}
                    onEdit={(customer) => {
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
                    onCreateOrder={() => {
                      setEditingOrder(null);
                      setShowOrderModal(
                        true
                      );
                    }}
                    onAddNote={() => {
                      setShowNoteModal(
                        true
                      );
                    }}
                    onRecordPayment={() => {
                      // Payment recording is handled
                      // from the selected order.
                    }}
                  />
                </div>

              </div>
            )}

            {/* =================================================
                PIPELINE
            ================================================= */}

            {activeTab === "pipeline" && (
              <SalesPipeline />
            )}

            {/* =================================================
                DUE DATES
            ================================================= */}

            {activeTab === "dues" && (
              <CRMDueDates />
            )}

            {/* =================================================
                ORDERS
            ================================================= */}

            {activeTab === "orders" && (
              <OrdersTable
                orders={orders}
                onEdit={(order) => {
                  setEditingOrder(order);
                  setShowOrderModal(
                    true
                  );
                }}
                onDelete={
                  handleDeleteOrder
                }
                onRecordPayment={(
                  order
                ) => {
                  setSelectedOrder(order);
                  setEditingPayment(null);
                  setShowPaymentModal(
                    true
                  );
                }}
              />
            )}

            {/* =================================================
                PAYMENTS
            ================================================= */}

            {activeTab === "payments" && (
              <PaymentsOverview
                payments={payments}
                onEdit={(payment) => {
                  setEditingPayment(
                    payment
                  );

                  setSelectedOrder(
                    payment.order
                  );

                  setShowPaymentModal(
                    true
                  );
                }}
                onDelete={
                  handleDeletePayment
                }
              />
            )}

          </div>
        </section>

        {/* =====================================================
            CUSTOMER MODAL
        ===================================================== */}

        <CustomerModal
          open={showAddCustomer}
          customer={editingCustomer}
          onClose={() => {
            setShowAddCustomer(false);
            setEditingCustomer(null);
          }}
          onSuccess={async () => {
            await loadCustomers();

            setShowAddCustomer(false);
            setEditingCustomer(null);
          }}
        />

        {/* =====================================================
            ORDER MODAL
        ===================================================== */}

        <OrderModal
          open={showOrderModal}
          customer={selectedCustomer}
          order={editingOrder}
          onClose={() => {
            setShowOrderModal(false);
            setEditingOrder(null);
          }}
          onSuccess={async () => {
            await loadCustomerData();

            setShowOrderModal(false);
            setEditingOrder(null);
          }}
        />

        {/* =====================================================
            PAYMENT MODAL
        ===================================================== */}

        <PaymentModal
          open={showPaymentModal}
          order={selectedOrder}
          payment={editingPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setEditingPayment(null);
            setSelectedOrder(null);
          }}
          onSuccess={async () => {
            await loadCustomerData();

            setShowPaymentModal(false);
            setEditingPayment(null);
            setSelectedOrder(null);
          }}
        />

        {/* =====================================================
            NOTE MODAL
        ===================================================== */}

        <AddNoteModal
          open={showNoteModal}
          customerId={
            selectedCustomer?._id
          }
          onClose={() =>
            setShowNoteModal(false)
          }
          onSuccess={async () => {
            await loadCustomers();
            await loadCustomerData();

            setShowNoteModal(false);
          }}
        />

      </div>
    </AdminLayout>
  );
};

export default CRMPage;