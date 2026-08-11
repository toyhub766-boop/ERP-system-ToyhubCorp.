import { useEffect, useState } from "react";

import CRMStaffLayout from "../components/CRMStaffLayout";

import {
  getOrdersByCustomer,
} from "../services/order.service";

import {
  getPaymentsByCustomer,
} from "../services/payment.service";

import {
  getCustomers,
  deleteCustomer,
} from "../services/customer.service";

import {
  deleteOrder,
} from "../services/order.service";

import {
  deletePayment,
} from "../services/payment.service";

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

import type {
  Customer,
} from "../types/customer.types";

type CRMTab =
  | "customers"
  | "pipeline"
  | "dues"
  | "orders"
  | "payments";

const CRMStaffPage = () => {

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

  const [search, setSearch] =
    useState("");


  // =========================================================
  // ORDERS / PAYMENTS
  // =========================================================

  const [orders, setOrders] =
    useState<any[]>([]);

  const [payments, setPayments] =
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
  // LOAD CUSTOMER ORDERS + PAYMENTS
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

      setOrders(
        ordersData || []
      );

      setPayments(
        paymentsData || []
      );

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

      const data =
        await getCustomers();

      setCustomers(
        data || []
      );

      /*
       * Preserve the currently selected customer
       * whenever possible.
       */
      setSelectedCustomer(
        (current: any) => {

          if (!data?.length) {
            return null;
          }

          if (!current?._id) {
            return data[0];
          }

          const updatedCustomer =
            data.find(
              (customer: any) =>
                customer._id ===
                current._id
            );

          return (
            updatedCustomer ||
            data[0]
          );
        }
      );

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
  // REMINDER SUMMARY
  // =========================================================

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const overdueReminders =
    customers.filter(
      (customer: any) =>
        customer.specialNotes?.some(
          (note: any) => {

            if (
              !note.reminderDate ||
              note.completed
            ) {
              return false;
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

            return reminder < today;
          }
        )
    );


  const todayReminders =
    customers.filter(
      (customer: any) =>
        customer.specialNotes?.some(
          (note: any) => {

            if (
              !note.reminderDate ||
              note.completed
            ) {
              return false;
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

            return (
              reminder.getTime() ===
              today.getTime()
            );
          }
        )
    );


  const upcomingReminders =
    customers.filter(
      (customer: any) =>
        customer.specialNotes?.some(
          (note: any) => {

            if (
              !note.reminderDate ||
              note.completed
            ) {
              return false;
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

            return reminder > today;
          }
        )
    );


  // =========================================================
  // DELETE CUSTOMER
  // =========================================================

  const handleDeleteCustomer =
    async (
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

        /*
         * Clear selected customer first
         * so the old customer doesn't flash.
         */
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
  // DELETE PAYMENT
  // =========================================================

  const handleDeletePayment =
    async (
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
    <CRMStaffLayout>

      <div className="mx-auto w-full max-w-[1450px] space-y-8">


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
            FOLLOW-UP SUMMARY
        ===================================================== */}

        <div className="grid gap-5 md:grid-cols-3">


          {/* OVERDUE */}

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <p className="text-sm font-medium text-red-500">
              Overdue Follow-ups
            </p>

            <h2 className="mt-3 text-4xl font-bold text-red-700">
              {
                overdueReminders.length
              }
            </h2>

          </div>


          {/* TODAY */}

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">

            <p className="text-sm font-medium text-amber-600">
              Due Today
            </p>

            <h2 className="mt-3 text-4xl font-bold text-amber-700">
              {
                todayReminders.length
              }
            </h2>

          </div>


          {/* UPCOMING */}

          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

            <p className="text-sm font-medium text-green-600">
              Upcoming
            </p>

            <h2 className="mt-3 text-4xl font-bold text-green-700">
              {
                upcomingReminders.length
              }
            </h2>

          </div>

        </div>


        {/* =====================================================
            EXISTING CRM STATS
        ===================================================== */}

        <CRMStats
          customers={customers}
          orders={orders}
          payments={payments}
        />


        {/* =====================================================
            MAIN CRM CONTAINER
        ===================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">


          {/* ===================================================
              TABS
          =================================================== */}

          <div className="border-b border-slate-200 px-6 py-4">

            <CRMTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

          </div>


          {/* ===================================================
              TAB CONTENT
          =================================================== */}

          <div className="p-6">


            {/* =================================================
                CUSTOMERS
            ================================================= */}

            {activeTab === "customers" && (

              <div className="grid gap-8 xl:grid-cols-[360px_1fr]">


                {/* CUSTOMER LIST */}

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

                      setEditingOrder(
                        null
                      );

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

                      /*
                       * Existing profile payment
                       * functionality is preserved.
                       *
                       * Payment recording from an
                       * individual order remains
                       * available through Orders.
                       */

                    }}

                  />

                </div>

              </div>

            )}


            {/* =================================================
                SALES PIPELINE
            ================================================= */}

            {activeTab === "pipeline" && (

              <SalesPipeline />

            )}


            {/* =================================================
                CUSTOMER DUE MANAGEMENT
            ================================================= */}

            {activeTab === "dues" && (

              <CRMDueDates />

            )}


            {/* =================================================
                ORDERS
            ================================================= */}

            {activeTab === "orders" && (

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


                onRecordPayment={(
                  order
                ) => {

                  setSelectedOrder(
                    order
                  );

                  setEditingPayment(
                    null
                  );

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

                payments={
                  payments
                }


                onEdit={(
                  payment
                ) => {

                  setEditingPayment(
                    payment
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

        </div>


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
            PAYMENT MODAL
        ===================================================== */}

        <PaymentModal

          open={
            showPaymentModal
          }

          order={
            selectedOrder
          }

          payment={
            editingPayment
          }

          onClose={() => {

            setShowPaymentModal(
              false
            );

            setEditingPayment(
              null
            );

            setSelectedOrder(
              null
            );

          }}

          onSuccess={async () => {

            await loadCustomerData();

            setShowPaymentModal(
              false
            );

            setEditingPayment(
              null
            );

            setSelectedOrder(
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
            selectedCustomer?._id
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

export default CRMStaffPage;