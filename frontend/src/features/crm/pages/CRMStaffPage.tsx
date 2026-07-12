import { useEffect, useState } from "react";
import CRMStaffLayout from "../../../app/layouts/CRMStaffLayout";
import { getOrdersByCustomer } from "../services/order.service";
import { getPaymentsByCustomer } from "../services/payment.service";
import { getCustomers } from "../services/customer.service";
import { deleteCustomer } from "../services/customer.service";
import { deleteOrder } from "../services/order.service";
import { deletePayment } from "../services/payment.service";

import CRMHeader from "../components/CRMHeader";
import CRMTabs from "../components/CRMTabs";
import CustomerList from "../components/CustomerList";
import CustomerProfile from "../components/CustomerProfile";
import OrdersTable from "../components/OrdersTable";
import PaymentsOverview from "../components/PaymentsOverview";
import CustomerModal from "../components/CustomerModal";
import OrderModal from "../components/OrderModal";
import PaymentModal from "../components/PaymentModal";

const CRMStaffPage = () => {
    const [activeTab, setActiveTab] = useState<
        "customers" | "orders" | "payments"
    >("customers");

    const [selectedCustomer, setSelectedCustomer] =
        useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
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

    const [selectedOrder, setSelectedOrder] =
        useState<any>(null);

    useEffect(() => {
        if (!selectedCustomer?._id) return;

        loadCustomerData();
    }, [selectedCustomer]);

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
        isStaff
        onAddCustomer={() =>
          setShowAddCustomer(true)
        }
      />

      {/* ================= HERO ================= */}

      <div className="rounded-3xl bg-gradient-to-r from-[#172B6B] via-[#25459B] to-[#3458D4] p-8 text-white shadow-lg">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-2xl">

            <h1 className="text-3xl font-bold">
              CRM Staff Workspace
            </h1>

            <p className="mt-3 text-blue-100">
              Manage customers, create orders and record
              payments from one centralized workspace.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/15 backdrop-blur px-6 py-5">

              <p className="text-sm text-blue-100">
                Customers
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {customers.length}
              </h2>

            </div>

            <div className="rounded-2xl bg-white/15 backdrop-blur px-6 py-5">

              <p className="text-sm text-blue-100">
                Orders
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {orders.length}
              </h2>

            </div>

          </div>

        </div>

      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

        <div className="border-b border-slate-200 px-8 py-6">

          <CRMTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

        </div>

        <div className="p-8">

          {activeTab === "customers" && (

            <div className="grid gap-8 xl:grid-cols-[380px_1fr] items-start">

              {/* Customer List */}

              <div className="min-w-0 xl:sticky xl:top-8">

                <CustomerList
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                />

              </div>

              {/* Customer Profile */}

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
                  onRecordPayment={() => {}}
                />

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

                if (
                  !window.confirm(
                    "Delete order?"
                  )
                )
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
          setSelectedOrder(null);
        }}
        onSuccess={async () => {
          await loadCustomerData();
          setSelectedOrder(null);
        }}
      />

    </div>

  </CRMStaffLayout>
);
};

export default CRMStaffPage;