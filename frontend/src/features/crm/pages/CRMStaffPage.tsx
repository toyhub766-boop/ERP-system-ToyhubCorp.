import { useEffect, useState } from "react";
import CRMStaffLayout from "../components/CRMStaffLayout";

import { getOrdersByCustomer } from "../services/order.service";
import { getPaymentsByCustomer } from "../services/payment.service";
import { getCustomers } from "../services/customer.service";
import { deleteCustomer } from "../services/customer.service";
import { deleteOrder } from "../services/order.service";
import { deletePayment } from "../services/payment.service";

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

import type { Customer } from "../types/customer.types";

const CRMPage = () => {
  const [activeTab, setActiveTab] = useState<
    "customers" | "orders" | "payments"
  >("customers");

  const [selectedCustomer, setSelectedCustomer] =
    useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] =
    useState<Customer[]>([]);
  const [showAddCustomer, setShowAddCustomer] =
    useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<any>(null);
  const [showOrderModal, setShowOrderModal] =
    useState(false);

  const [editingOrder, setEditingOrder] =
    useState<any>(null);

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [editingPayment, setEditingPayment] =
    useState<any>(null);

    const [search, setSearch] = useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<any>(null);

  const [showNoteModal, setShowNoteModal] =
    useState(false);

  useEffect(() => {
    if (!selectedCustomer?._id) return;

    loadCustomerData();
  }, [selectedCustomer]);

  const today = new Date();

today.setHours(0, 0, 0, 0);

const overdueReminders = customers.filter((customer) =>
  customer.specialNotes?.some(
    (note: any) =>
      note.reminderDate &&
      !note.completed &&
      new Date(note.reminderDate) < today
  )
);

const todayReminders = customers.filter((customer) =>
  customer.specialNotes?.some((note: any) => {
    if (!note.reminderDate || note.completed) return false;

    const reminder = new Date(note.reminderDate);
    reminder.setHours(0, 0, 0, 0);

    return reminder.getTime() === today.getTime();
  })
);

const upcomingReminders = customers.filter((customer) =>
  customer.specialNotes?.some(
    (note: any) =>
      note.reminderDate &&
      !note.completed &&
      new Date(note.reminderDate) > today
  )
);



  const loadCustomerData = async () => {
    if (!selectedCustomer?._id) return;

    try {
      const [ordersData, paymentsData] = await Promise.all([
        getOrdersByCustomer(selectedCustomer._id),
        getPaymentsByCustomer(selectedCustomer._id),
      ]);

      setOrders(ordersData);
      setPayments(paymentsData);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCustomers = async () => {
    const data = await getCustomers();

    setCustomers(data);

    if (data.length) {
      setSelectedCustomer(data[0]);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <CRMStaffLayout>

      <div className="mx-auto w-full max-w-[1450px] space-y-8">

        {/* ================= HEADER ================= */}

        <CRMHeader
          onAddCustomer={() =>
            setShowAddCustomer(true)
          }
        />

        <div className="grid gap-5 md:grid-cols-3">

  <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

    <p className="text-sm font-medium text-red-500">
      Overdue Follow-ups
    </p>

    <h2 className="mt-3 text-4xl font-bold text-red-700">
      {overdueReminders.length}
    </h2>

  </div>

  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">

    <p className="text-sm font-medium text-amber-600">
      Due Today
    </p>

    <h2 className="mt-3 text-4xl font-bold text-amber-700">
      {todayReminders.length}
    </h2>

  </div>

  <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

    <p className="text-sm font-medium text-green-600">
      Upcoming
    </p>

    <h2 className="mt-3 text-4xl font-bold text-green-700">
      {upcomingReminders.length}
    </h2>

  </div>

</div>


        {/* ================= STATS ================= */}

        <CRMStats
          customers={customers}
          orders={orders}
          payments={payments}
        />

        {/* ================= TABS ================= */}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-4">

            <CRMTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

          </div>

          <div className="p-6">

            {activeTab === "customers" && (

              <div className="grid gap-8 xl:grid-cols-[360px_1fr]">

                {/* LEFT */}

                <div className="min-w-0">

                  <CustomerList
  search={search}
  setSearch={setSearch}
  customers={customers}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                  />

                </div>

                {/* RIGHT */}

                <div className="min-w-0">

                  <CustomerProfile
                    customer={selectedCustomer}
                    orders={orders}
                    onEdit={(customer) => {
                      setEditingCustomer(customer);
                      setShowAddCustomer(true);
                    }}
                    onDelete={async (customer) => {

                      if (
                        !window.confirm(
                          "Delete customer?"
                        )
                      )
                        return;

                      await deleteCustomer(customer._id);

                      await loadCustomers();

                      setSelectedCustomer(null);

                    }}
                    onCreateOrder={() => {
                      setEditingOrder(null);
                      setShowOrderModal(true);
                    }}
                    onAddNote={() => {
                      setShowNoteModal(true);
                    }}

                    onRecordPayment={() => { }} />

                </div>

              </div>

            )}

            {activeTab === "orders" && (

              <OrdersTable
                orders={orders}
                onEdit={(order) => {
                  setEditingOrder(order);
                  setShowOrderModal(true);
                }}
                onDelete={async (order) => {
                  if (!window.confirm("Delete order?"))
                    return;

                  await deleteOrder(order._id);

                  loadCustomerData();
                }}
                onRecordPayment={(order) => {
                  setSelectedOrder(order);
                  setEditingPayment(null);
                  setShowPaymentModal(true);
                }}
              />
            )}

            {activeTab === "payments" && (

              <PaymentsOverview
                payments={payments}
                onEdit={(payment) => {
                  setEditingPayment(payment);
                  setShowPaymentModal(true);
                }}
                onDelete={async (payment) => {

                  if (
                    !window.confirm(
                      "Delete payment?"
                    )
                  )
                    return;

                  await deletePayment(payment._id);

                  loadCustomerData();

                }}
              />

            )}

          </div>

        </div>

        {/* ================= MODALS ================= */}

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

        <OrderModal
          open={showOrderModal}
          customer={selectedCustomer}
          order={editingOrder}
          onClose={() => {
            setShowOrderModal(false);
            setEditingOrder(null);
          }}
          onSuccess={loadCustomerData}
        />

        <PaymentModal
          open={showPaymentModal}
          order={selectedOrder}
          payment={editingPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setEditingPayment(null);
          }}
          onSuccess={loadCustomerData}
        />

        <AddNoteModal
  open={showNoteModal}
  customerId={selectedCustomer?._id}
  onClose={() => setShowNoteModal(false)}
  onSuccess={async () => {
    await loadCustomers();
    await loadCustomerData();
    setShowNoteModal(false);
  }}
/>

      </div>

    </CRMStaffLayout>
  );
};

export default CRMPage;