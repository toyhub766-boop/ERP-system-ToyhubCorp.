import { useEffect, useState } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";

import { getOrdersByCustomer } from "../services/order.service";
import { getPaymentsByCustomer } from "../services/payment.service";
import { getCustomers } from "../services/customer.service";

import CRMHeader from "../components/CRMHeader";
import CRMStats from "../components/CRMStats";
import CRMTabs from "../components/CRMTabs";
import CustomerList from "../components/CustomerList";
import CustomerProfile from "../components/CustomerProfile";
import OrdersTable from "../components/OrdersTable";
import PaymentsOverview from "../components/PaymentsOverview";
import AddCustomerModal from "../components/CustomerModal";

const CRMPage = () => {
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

useEffect(() => {
  if (!selectedCustomer?._id) return;

  loadCustomerData();
}, [selectedCustomer]);

const loadCustomerData = async () => {
  const [ordersData, paymentsData] =
    await Promise.all([
      getOrdersByCustomer(
        selectedCustomer._id
      ),
      getPaymentsByCustomer(
        selectedCustomer._id
      ),
    ]);

  setOrders(ordersData);
  setPayments(paymentsData);
};

useEffect(() => {
  loadCustomers();
}, []);

const loadCustomers = async () => {
  const data = await getCustomers();

  setCustomers(data);

  if (data.length) {
    setSelectedCustomer(data[0]);
  }
};

  return (
    <AdminLayout>
    <div className="p-6 space-y-6">

     <CRMHeader
  onAddCustomer={() =>
    setShowAddCustomer(true)
  }
/>

      <CRMStats
  customers={customers}
  orders={orders}
  payments={payments}
/>

      <CRMTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "customers" && (
        <div className="grid grid-cols-12 gap-6">

          <div className="col-span-7">

            <CustomerList
  customers={customers}
  selectedCustomer={selectedCustomer}
  setSelectedCustomer={setSelectedCustomer}
/>

          </div>

          <div className="col-span-5">

            <CustomerProfile
  customer={selectedCustomer}
  orders={orders}
/>

          </div>

        </div>
      )}

      {activeTab === "orders" && (
       <OrdersTable
  orders={orders}
/>
      )}

      {activeTab === "payments" && (
        <PaymentsOverview
  payments={payments}
/>
      )}

      <AddCustomerModal
  open={showAddCustomer}
  onClose={() => setShowAddCustomer(false)}
  onSuccess={loadCustomers}
/>
    </div>
    </AdminLayout>
  );
};

export default CRMPage;