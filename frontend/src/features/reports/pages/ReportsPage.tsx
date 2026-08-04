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

import { exportAccountsPdf } from "../../../utils/exportAccountsPdf";
import { exportAccountsExcel } from "../../../utils/exportAccountsExcel";

import { exportAttendancePdf } from "../../../utils/exportAttendancePdf";
import { exportAttendanceExcel } from "../../../utils/exportAttendanceExcel";


const ReportsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [, setProduction] = useState<any[]>([]);
  const [, setDispatch] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [, setCustomers] = useState<any[]>([]);
  const [, setOrders] = useState<any[]>([]);
  const [, setPayments] = useState<any[]>([]);

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

      <div className="mx-auto max-w-7xl px-8 py-8 space-y-8">

        {/* Header */}

        <div className="flex items-end justify-between">

          <div>

            <p className="text-sm font-medium uppercase tracking-wide text-[#17357A]">
              Reporting Center
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Reports
            </h1>

            <p className="mt-3 max-w-2xl text-slate-500">
              Generate PDF and Excel reports across every department of the ERP
              system. Export clean business records for analysis, audits and
              sharing.
            </p>

          </div>

        </div>

        {/* Report Categories */}

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">

          <ReportCard
            title="Inventory Report"
            description="Products, stock levels, warehouse information and inventory records."
            onPdf={() => exportPdf(products, "inventory")}
            onExcel={() => exportExcel(products, "inventory")}
          />

          <ReportCard
            title="Attendance Report"
            description="Employee attendance, work hours, shifts and attendance logs."
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

          <ReportCard
            title="Production Report"
            description="Production orders, material consumption and manufacturing records."
            onPdf={() => { }}
            onExcel={() => { }}
          />

          <ReportCard
            title="Dispatch Report"
            description="Dispatch history, shipments and delivery information."
            onPdf={() => { }}
            onExcel={() => { }}
          />

          <ReportCard
            title="Accounts Report"
            description="Customer ledger, balances and transaction history."
            onPdf={() =>
              exportAccountsPdf(
                accounts,
                "Accounts Report"
              )
            }
            onExcel={() =>
              exportAccountsExcel(
                accounts,
                "Accounts Report"
              )
            }
          />

        </div>

      </div>

    </AdminLayout>
  );
}
export default ReportsPage;