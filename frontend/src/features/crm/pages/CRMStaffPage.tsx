import { useEffect, useState } from "react";
import CRMStaffLayout from "../../../app/layouts/CRMStaffLayout";
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
                                onEdit={(customer) => {
                                    setEditingCustomer(customer);
                                    setShowAddCustomer(true);
                                }}
                                onDelete={async (customer) => {
                                    if (!window.confirm("Delete customer?")) return;

                                    await deleteCustomer(customer._id);

                                    await loadCustomers();

                                    setSelectedCustomer(null);
                                }}
                                onCreateOrder={() => {
                                    setEditingOrder(null);
                                    setShowOrderModal(true);
                                }}
                                onRecordPayment={() => { }}
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
                            if (!window.confirm("Delete order?")) return;

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
                            if (!window.confirm("Delete payment?")) return;

                            await deletePayment(payment._id);

                            loadCustomerData();
                        }}
                    />
                )}

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