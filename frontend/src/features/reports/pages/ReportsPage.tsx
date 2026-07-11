import { useEffect, useState } from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";
import ReportCard from "../components/ReportCard";

import {
  getProducts,
  getAttendance,
  getProduction,
  getDispatch,
  getAccounts,
  getCustomers,
  getOrders,
  getPayments,
} from "../services/reports.service";

import { exportPdf } from "../../../utils/exportPdf";
import { exportExcel } from "../../../utils/exportExcel";
import { exportAttendancePdf } from "../../../utils/exportAttendancePdf";
import { exportAttendanceExcel } from "../../../utils/exportAttendanceExcel";


const ReportsPage = () => {
    const [products, setProducts] = useState<any[]>([]);
const [attendance, setAttendance] = useState<any[]>([]);
const [production, setProduction] = useState<any[]>([]);
const [dispatch, setDispatch] = useState<any[]>([]);
const [accounts, setAccounts] = useState<any[]>([]);
const [customers, setCustomers] = useState<any[]>([]);
const [orders, setOrders] = useState<any[]>([]);
const [payments, setPayments] = useState<any[]>([]);

useEffect(() => {
  const loadReports = async () => {
    try {
      const [
  productsData,
  attendanceData,
  productionData,
  dispatchData,
  accountsData,
  customersData,
  ordersData,
  paymentsData,
] = await Promise.all([
  getProducts(),
  getAttendance(),
  getProduction(),
  getDispatch(),
  getAccounts(),
  getCustomers(),
  getOrders(),
  getPayments(),
]);

setProducts(productsData);
setAttendance(attendanceData);
setProduction(productionData);
setDispatch(dispatchData);
setAccounts(accountsData);
setCustomers(customersData);
setOrders(ordersData);
setPayments(paymentsData);
    } catch (err) {
      console.error(err);
    }
  };

  loadReports();
}, []);

  return (
  <AdminLayout>
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Reports
        </h1>

        <p className="text-slate-500 mt-2">
          Export business reports in PDF or Excel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Inventory */}

        <ReportCard
          title="Inventory Report"
          description="Export inventory records."
          onPdf={() => exportPdf(products, "inventory")}
          onExcel={() => exportExcel(products, "inventory")}
        />

        {/* Attendance */}

        <ReportCard
          title="Attendance Report"
          description="Export attendance records."
          onPdf={() =>
            exportAttendancePdf(
              attendance,
              "Attendance Report"
            )
          }
          onExcel={() =>
            exportAttendanceExcel(
              attendance,
              "attendance"
            )
          }
        />

        {/* Production */}

        <ReportCard
          title="Production Report"
          description="Export production records."
          onPdf={() => {}}
          onExcel={() => {}}
        />

        {/* Dispatch */}

        <ReportCard
          title="Dispatch Report"
          description="Export dispatch records."
          onPdf={() => {}}
          onExcel={() => {}}
        />

        {/* Accounts */}

        <ReportCard
          title="Accounts Report"
          description="Export accounts records."
          onPdf={() => {}}
          onExcel={() => {}}
        />

        {/* CRM */}

        <ReportCard
          title="CRM Report"
          description="Export customers, orders and payments."
          onPdf={() => {}}
          onExcel={() => {}}
        />

      </div>

    </div>
  </AdminLayout>
);
}
export default ReportsPage;