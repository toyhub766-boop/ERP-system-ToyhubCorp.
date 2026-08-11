import { useEffect, useMemo, useState } from "react";

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

        setAccounts(
          Array.isArray(accountsData)
            ? accountsData
            : accountsData?.data || []
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
  // ACCOUNT REPORT TRANSFORMATION
  // =========================================================

  const accountExportRows = useMemo(() => {
    return accounts.map((row: any) => ({
      date:
        row.date ||
        row.createdAt ||
        "",

      partyCode:
        row.party?.partyCode ||
        row.partyCode ||
        "--",

      partyName:
        row.party?.companyName ||
        row.partyName ||
        "--",

      partyType:
        row.party?.partyType ||
        row.partyType ||
        "--",

      contactPerson:
        row.party?.contactPerson ||
        row.contactPerson ||
        "--",

      transactionType:
        row.transactionType === "MONEY_IN"
          ? "Money In"
          : row.transactionType === "MONEY_OUT"
          ? "Money Out"
          : row.transactionType || "--",

      paymentMethod:
        row.paymentMethod ||
        "--",

      amount:
        Number(row.amount || 0),

      balance:
        Number(
          row.balanceAfterTransaction ??
          row.balance ??
          0
        ),

      remarks:
        row.remarks ||
        "--",
    }));
  }, [accounts]);

  // =========================================================
  // ACCOUNT SUMMARY
  // =========================================================

  const accountSummary = useMemo(() => {
    const parties = new Map<string, any>();

    accounts.forEach((row: any) => {
      const party =
        row.party || {};

      const partyId =
        party._id ||
        row.partyId ||
        party.partyCode ||
        party.companyName;

      if (!partyId) return;

      parties.set(
        partyId,
        party
      );
    });

    const partyList =
      Array.from(parties.values());

    const customers =
      partyList.filter(
        (party: any) =>
          party.partyType === "CUSTOMER"
      );

    const suppliers =
      partyList.filter(
        (party: any) =>
          party.partyType === "SUPPLIER"
      );

    const companyExpenses =
      partyList.filter(
        (party: any) =>
          party.partyType ===
          "COMPANY_EXPENSE"
      );

    const youllGet =
      partyList
        .filter(
          (party: any) =>
            Number(
              party.currentBalance || 0
            ) > 0
        )
        .reduce(
          (
            total: number,
            party: any
          ) =>
            total +
            Number(
              party.currentBalance || 0
            ),
          0
        );

    const youllGive =
      partyList
        .filter(
          (party: any) =>
            Number(
              party.currentBalance || 0
            ) < 0
        )
        .reduce(
          (
            total: number,
            party: any
          ) =>
            total +
            Math.abs(
              Number(
                party.currentBalance || 0
              )
            ),
          0
        );

    return {
      totalParties:
        partyList.length,

      customers:
        customers.length,

      suppliers:
        suppliers.length,

      companyExpenses:
        companyExpenses.length,

      youllGet,

      youllGive,
    };
  }, [accounts]);

  // =========================================================
  // ACCOUNT EXPORT HANDLERS
  // =========================================================

  const handleAccountsPdf = async () => {
    try {
      await exportAccountsPdf(
        accountExportRows,
        accountSummary,
        "Accounts Report"
      );
    } catch (error) {
      console.error(
        "Accounts PDF export failed:",
        error
      );
    }
  };

  const handleAccountsExcel = async () => {
    try {
      await exportAccountsExcel(
        accountExportRows,
        accountSummary,
        "Accounts Report"
      );
    } catch (error) {
      console.error(
        "Accounts Excel export failed:",
        error
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <AdminLayout>

      <div className="mx-auto max-w-7xl px-8 py-8 space-y-8">

        {/* HEADER */}

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[#17357A]">
            Reporting Center
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Generate PDF and Excel reports across
            every department of the ERP system.
            Export clean business records for
            analysis, audits and sharing.
          </p>
        </div>

        {/* REPORT CARDS */}

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">

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

          {/* ACCOUNTS */}

          <ReportCard
            title="Accounts Report"
            description="Customer ledger, balances and complete transaction history."
            onPdf={handleAccountsPdf}
            onExcel={handleAccountsExcel}
          />

        </div>

      </div>

    </AdminLayout>
  );
};

export default ReportsPage;