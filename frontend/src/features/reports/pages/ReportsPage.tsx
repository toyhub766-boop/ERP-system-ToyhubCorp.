import { useEffect, useState } from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";

import ReportCard from "../components/ReportCard";

import { getProducts } from "../../dashboard/services/dashboard.service";
import { getAttendance } from "../../dashboard/services/dashboard.service";
import { getProduction } from "../../dashboard/services/dashboard.service";
import { getDispatch } from "../../dashboard/services/dashboard.service";

import { exportExcel } from "../../../utils/exportExcel";
import { exportPdf } from "../../../utils/exportPdf";
import { exportAttendancePdf } from "../../../utils/exportAttendancePdf";
import { exportAttendanceExcel } from "../../../utils/exportAttendanceExcel";

const ReportsPage = () => {
    const [products, setProducts] = useState<any[]>([]);
const [attendance, setAttendance] = useState<any[]>([]);
const [production, setProduction] = useState<any[]>([]);
const [dispatch, setDispatch] = useState<any[]>([]); 

useEffect(() => {
  const loadReports = async () => {
    try {
      const [
        productsData,
        attendanceData,
        productionData,
        dispatchData,
      ] = await Promise.all([
        getProducts(),
        getAttendance(),
        getProduction(),
        getDispatch(),
      ]);

      setProducts(productsData);
      setAttendance(attendanceData);
      setProduction(productionData);
      setDispatch(dispatchData);
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

<h1 className="text-3xl font-bold">
Reports
</h1>

<p className="text-slate-500 mt-2">
Export business reports in PDF or Excel.
</p>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

    <ReportCard
  title="Inventory"
  description="Export inventory report."
  onPdf={() =>
    exportPdf(products, "inventory")
  }
  onExcel={() =>
    exportExcel(products, "inventory")
  }
/>

<ReportCard
  title="Attendance"
  description="Export attendance report."
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
  title="Production"
  description="Production batches."
  onPdf={() =>
    exportPdf(production, "production")
  }
  onExcel={() =>
    exportExcel(production, "production")
  }
/>

<ReportCard
  title="Dispatch"
  description="Dispatch records."
  onPdf={() =>
    exportPdf(dispatch, "dispatch")
  }
  onExcel={() =>
    exportExcel(dispatch, "dispatch")
  }
/>

</div>

</div>

</AdminLayout>
);
}