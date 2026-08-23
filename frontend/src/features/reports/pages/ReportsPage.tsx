import { useEffect, useState } from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";
import ReportCard from "../components/ReportCard";

import {
  getProducts,
  getAttendance,
  getProduction,
  getDispatch,
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

  const [, setProduction] = useState<any[]>([]);
  const [, setDispatch] = useState<any[]>([]);
  const [, setCustomers] = useState<any[]>([]);
  const [, setOrders] = useState<any[]>([]);
  const [, setPayments] = useState<any[]>([]);

  // =========================================================
  // LOAD REPORT DATA
  // =========================================================

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [
          productsData,
          attendanceData,
          productionData,
          dispatchData,
          customersData,
          ordersData,
          paymentsData,
        ] = await Promise.all([
          getProducts(),
          getAttendance(),
          getProduction(),
          getDispatch(),
          getCustomers(),
          getOrders(),
          getPayments(),
        ]);

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : []
        );

        setAttendance(
          Array.isArray(attendanceData)
            ? attendanceData
            : []
        );

        setProduction(
          Array.isArray(productionData)
            ? productionData
            : []
        );

        setDispatch(
          Array.isArray(dispatchData)
            ? dispatchData
            : []
        );

        setCustomers(
          Array.isArray(customersData)
            ? customersData
            : []
        );

        setOrders(
          Array.isArray(ordersData)
            ? ordersData
            : []
        );

        setPayments(
          Array.isArray(paymentsData)
            ? paymentsData
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load reports:",
          error
        );
      }
    };

    loadReports();
  }, []);

  // =========================================================
  // UI
  // =========================================================

  return (
    <AdminLayout>
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          space-y-6
          px-4
          py-5
          sm:space-y-7
          sm:px-6
          sm:py-6
          lg:space-y-8
          lg:px-8
          lg:py-8
        "
      >
        {/* HEADER */}

        <div>
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-[#17357A]
              sm:text-xs
              sm:tracking-wide
            "
          >
            Reporting Center
          </p>

          <h1
            className="
              mt-1.5
              text-2xl
              font-bold
              text-slate-900
              sm:mt-2
              sm:text-3xl
              lg:text-4xl
            "
          >
            Reports
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-5
              text-slate-500
              sm:mt-3
              sm:leading-6
            "
          >
            Generate PDF and Excel reports across
            every department of the ERP system.
            Export clean business records for
            analysis, audits and sharing.
          </p>
        </div>

        {/* REPORT CARDS */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:gap-5
            md:grid-cols-2
            md:gap-6
            xl:grid-cols-3
            xl:gap-7
          "
        >
          {/* INVENTORY */}

          <ReportCard
            title="Inventory Report"
            description="Products, stock levels, warehouse information and inventory records."
            onPdf={() =>
              exportPdf(
                products,
                "Inventory Report"
              )
            }
            onExcel={() =>
              exportExcel(
                products,
                "Inventory Report"
              )
            }
          />

          {/* ATTENDANCE */}

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
                "Attendance Report"
              )
            }
          />

          {/* PRODUCTION */}

          <ReportCard
            title="Production Report"
            description="Production orders, material consumption and manufacturing records."
            onPdf={() => {}}
            onExcel={() => {}}
          />

          {/* DISPATCH */}

          <ReportCard
            title="Dispatch Report"
            description="Dispatch history, shipments and delivery information."
            onPdf={() => {}}
            onExcel={() => {}}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;