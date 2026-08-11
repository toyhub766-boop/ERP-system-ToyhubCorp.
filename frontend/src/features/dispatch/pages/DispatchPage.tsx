import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiPackage,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiTruck,
  FiX,
  FiZap,
} from "react-icons/fi";

import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getDispatches,
  createDispatch,
  updateDispatch,
} from "../services/dispatch.service";

import { getProductions } from "../../production/services/production.services";

const DispatchPage = () => {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [completedProductions, setCompletedProductions] = useState<any[]>(
    [],
  );

  const [selectedProduction, setSelectedProduction] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [destination, setDestination] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadDispatches = async () => {
    try {
      setLoading(true);

      const [dispatchData, productionData] = await Promise.all([
        getDispatches(),
        getProductions(),
      ]);

      setDispatches(dispatchData || []);

      setCompletedProductions(
        (productionData || []).filter(
          (production: any) => production.status === "Completed",
        ),
      );

      setSelectedDispatch((current: any) => {
        if (!dispatchData?.length) return null;

        if (current?._id) {
          const stillExists = dispatchData.find(
            (item: any) => item._id === current._id,
          );

          if (stillExists) return stillExists;
        }

        return dispatchData[0];
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
  }, []);

  const resetForm = () => {
    setSelectedProduction("");
    setQuantity(1);
    setDestination("");
    setVehicleNumber("");
    setNotes("");
  };

  const handleCreateDispatch = async () => {
    if (!selectedProduction) {
      alert("Select a production order");
      return;
    }

    if (!destination.trim()) {
      alert("Enter destination");
      return;
    }

    if (quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {
      await createDispatch({
        production: selectedProduction,
        quantity,
        destination,
        vehicleNumber,
        notes,
      });

      setShowModal(false);
      resetForm();

      await loadDispatches();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkDelivered = async (dispatch: any) => {
    if (!dispatch?._id) return;

    try {
      await updateDispatch(dispatch._id, {
        ...dispatch,
        status: "Delivered",
      });

      await loadDispatches();
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * ============================================================
   * PREMIUM PRINT CHALLAN
   * ============================================================
   *
   * This intentionally uses a dedicated print document so the
   * challan looks like a proper business document when the user
   * selects "Save as PDF" from the browser print dialog.
   */
  const handlePrintChallan = (dispatch: any) => {
    if (!dispatch) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    const productName =
      dispatch.production?.items?.[0]?.product?.name || "Finished Product";

    const productionOrder =
      dispatch.production?.orderNumber ||
      dispatch.production?.productionNumber ||
      "-";

    const createdDate = dispatch.createdAt
      ? new Date(dispatch.createdAt)
      : new Date();

    const dispatchedDate = dispatch.dispatchedAt
      ? new Date(dispatch.dispatchedAt)
      : null;

    const statusClass =
      dispatch.status === "Delivered"
        ? "delivered"
        : dispatch.status === "Dispatched"
          ? "dispatched"
          : "pending";

    const statusLabel = dispatch.status || "Pending";

    const escapeHtml = (value: any) =>
      String(value ?? "-")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

        <head>

          <meta charset="UTF-8" />

          <title>Dispatch Challan - ${escapeHtml(productName)}</title>

          <style>

            * {
              box-sizing: border-box;
            }

            @page {
              size: A4;
              margin: 0;
            }

            body {
              margin: 0;
              background: #eef2f7;
              color: #172033;
              font-family:
                Inter,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Arial,
                sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .page {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              background: white;
              position: relative;
              overflow: hidden;
            }

            .top-accent {
              height: 9px;
              background:
                linear-gradient(
                  90deg,
                  #172b6b 0%,
                  #2563eb 52%,
                  #22c55e 100%
                );
            }

            .content {
              padding: 42px 46px 38px;
            }

            .brand-row {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 30px;
            }

            .brand {
              display: flex;
              align-items: center;
              gap: 14px;
            }

            .brand-mark {
              width: 48px;
              height: 48px;
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #172b6b;
              color: white;
              font-size: 20px;
              font-weight: 800;
            }

            .brand-name {
              font-size: 22px;
              line-height: 1;
              font-weight: 800;
              color: #172b6b;
              letter-spacing: -0.5px;
            }

            .brand-subtitle {
              margin-top: 6px;
              font-size: 11px;
              color: #718096;
              letter-spacing: 1.5px;
              text-transform: uppercase;
            }

            .document-meta {
              text-align: right;
            }

            .document-label {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 2px;
              color: #718096;
              text-transform: uppercase;
            }

            .document-title {
              margin-top: 6px;
              font-size: 30px;
              line-height: 1;
              font-weight: 800;
              color: #111827;
              letter-spacing: -1px;
            }

            .document-number {
              margin-top: 9px;
              font-size: 12px;
              color: #64748b;
            }

            .hero {
              margin-top: 42px;
              border-radius: 20px;
              background: #f7f9fc;
              border: 1px solid #e5eaf1;
              padding: 24px;
              display: flex;
              justify-content: space-between;
              gap: 30px;
            }

            .hero-label {
              color: #718096;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.4px;
            }

            .hero-product {
              margin-top: 8px;
              font-size: 23px;
              line-height: 1.25;
              font-weight: 800;
              color: #172033;
            }

            .hero-production {
              margin-top: 7px;
              font-size: 12px;
              color: #64748b;
            }

            .status {
              align-self: flex-start;
              padding: 9px 14px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.3px;
            }

            .status.pending {
              background: #fef3c7;
              color: #92400e;
            }

            .status.dispatched {
              background: #dbeafe;
              color: #1d4ed8;
            }

            .status.delivered {
              background: #dcfce7;
              color: #15803d;
            }

            .section {
              margin-top: 30px;
            }

            .section-title {
              margin-bottom: 12px;
              font-size: 11px;
              font-weight: 800;
              color: #172b6b;
              text-transform: uppercase;
              letter-spacing: 1.6px;
            }

            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              border: 1px solid #e5eaf1;
              border-radius: 16px;
              overflow: hidden;
            }

            .detail {
              padding: 18px 20px;
              border-bottom: 1px solid #e5eaf1;
            }

            .detail:nth-child(odd) {
              border-right: 1px solid #e5eaf1;
            }

            .detail:nth-last-child(-n+2) {
              border-bottom: none;
            }

            .detail-label {
              font-size: 10px;
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .detail-value {
              margin-top: 7px;
              font-size: 14px;
              font-weight: 700;
              color: #1e293b;
            }

            .shipment-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e5eaf1;
              border-radius: 16px;
              overflow: hidden;
            }

            .shipment-table th {
              padding: 14px 16px;
              background: #f8fafc;
              color: #64748b;
              font-size: 10px;
              font-weight: 800;
              text-align: left;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid #e5eaf1;
            }

            .shipment-table td {
              padding: 18px 16px;
              font-size: 13px;
              color: #334155;
              border-bottom: 1px solid #edf1f5;
            }

            .shipment-table tr:last-child td {
              border-bottom: none;
            }

            .quantity {
              font-size: 18px;
              font-weight: 800;
              color: #172b6b;
            }

            .notes {
              padding: 18px 20px;
              border-radius: 16px;
              border: 1px solid #e5eaf1;
              background: #fafbfc;
              font-size: 13px;
              line-height: 1.7;
              color: #475569;
              min-height: 70px;
            }

            .timeline {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
            }

            .timeline-item {
              padding: 16px;
              border: 1px solid #e5eaf1;
              border-radius: 14px;
            }

            .timeline-dot {
              width: 9px;
              height: 9px;
              border-radius: 50%;
              background: #2563eb;
              margin-bottom: 10px;
            }

            .timeline-dot.green {
              background: #22c55e;
            }

            .timeline-dot.gray {
              background: #cbd5e1;
            }

            .timeline-title {
              font-size: 11px;
              font-weight: 800;
              color: #334155;
            }

            .timeline-date {
              margin-top: 5px;
              font-size: 10px;
              line-height: 1.5;
              color: #94a3b8;
            }

            .signature-area {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 70px;
              margin-top: 72px;
            }

            .signature {
              padding-top: 12px;
              border-top: 1px solid #94a3b8;
              font-size: 11px;
              color: #64748b;
            }

            .footer {
              margin-top: 48px;
              padding-top: 18px;
              border-top: 1px solid #e5eaf1;
              display: flex;
              justify-content: space-between;
              gap: 20px;
              color: #94a3b8;
              font-size: 9px;
            }

            @media print {

              body {
                background: white;
              }

              .page {
                margin: 0;
                width: 210mm;
                min-height: 297mm;
              }

            }

          </style>

        </head>

        <body>

          <div class="page">

            <div class="top-accent"></div>

            <div class="content">

              <div class="brand-row">

                <div class="brand">

                  <div class="brand-mark">
                    TH
                  </div>

                  <div>

                    <div class="brand-name">
                      TOY HUB
                    </div>

                    <div class="brand-subtitle">
                      Corporation
                    </div>

                  </div>

                </div>

                <div class="document-meta">

                  <div class="document-label">
                    Logistics Document
                  </div>

                  <div class="document-title">
                    DISPATCH CHALLAN
                  </div>

                  <div class="document-number">
                    Dispatch ID: ${escapeHtml(dispatch._id)}
                  </div>

                </div>

              </div>

              <div class="hero">

                <div>

                  <div class="hero-label">
                    Shipment
                  </div>

                  <div class="hero-product">
                    ${escapeHtml(productName)}
                  </div>

                  <div class="hero-production">
                    Production Order: ${escapeHtml(productionOrder)}
                  </div>

                </div>

                <div class="status ${statusClass}">
                  ${escapeHtml(statusLabel)}
                </div>

              </div>

              <div class="section">

                <div class="section-title">
                  Dispatch Information
                </div>

                <div class="details">

                  <div class="detail">

                    <div class="detail-label">
                      Destination
                    </div>

                    <div class="detail-value">
                      ${escapeHtml(dispatch.destination)}
                    </div>

                  </div>

                  <div class="detail">

                    <div class="detail-label">
                      Vehicle Number
                    </div>

                    <div class="detail-value">
                      ${escapeHtml(dispatch.vehicleNumber || "-")}
                    </div>

                  </div>

                  <div class="detail">

                    <div class="detail-label">
                      Dispatch Date
                    </div>

                    <div class="detail-value">
                      ${createdDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                  </div>

                  <div class="detail">

                    <div class="detail-label">
                      Dispatch Status
                    </div>

                    <div class="detail-value">
                      ${escapeHtml(statusLabel)}
                    </div>

                  </div>

                </div>

              </div>

              <div class="section">

                <div class="section-title">
                  Shipment Summary
                </div>

                <table class="shipment-table">

                  <thead>

                    <tr>
                      <th>Product</th>
                      <th>Production Order</th>
                      <th>Quantity</th>
                      <th>Destination</th>
                    </tr>

                  </thead>

                  <tbody>

                    <tr>

                      <td>
                        <strong>
                          ${escapeHtml(productName)}
                        </strong>
                      </td>

                      <td>
                        ${escapeHtml(productionOrder)}
                      </td>

                      <td>
                        <span class="quantity">
                          ${escapeHtml(dispatch.quantity)}
                        </span>
                        units
                      </td>

                      <td>
                        ${escapeHtml(dispatch.destination)}
                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

              ${
                dispatch.notes
                  ? `
                    <div class="section">

                      <div class="section-title">
                        Dispatch Notes
                      </div>

                      <div class="notes">
                        ${escapeHtml(dispatch.notes)}
                      </div>

                    </div>
                  `
                  : ""
              }

              <div class="section">

                <div class="section-title">
                  Shipment Timeline
                </div>

                <div class="timeline">

                  <div class="timeline-item">

                    <div class="timeline-dot"></div>

                    <div class="timeline-title">
                      Dispatch Created
                    </div>

                    <div class="timeline-date">
                      ${createdDate.toLocaleString("en-IN")}
                    </div>

                  </div>

                  <div class="timeline-item">

                    <div class="timeline-dot ${
                      dispatchedDate ? "" : "gray"
                    }"></div>

                    <div class="timeline-title">
                      Dispatched
                    </div>

                    <div class="timeline-date">
                      ${
                        dispatchedDate
                          ? dispatchedDate.toLocaleString("en-IN")
                          : "Awaiting dispatch"
                      }
                    </div>

                  </div>

                  <div class="timeline-item">

                    <div class="timeline-dot ${
                      dispatch.status === "Delivered"
                        ? "green"
                        : "gray"
                    }"></div>

                    <div class="timeline-title">
                      Delivered
                    </div>

                    <div class="timeline-date">
                      ${
                        dispatch.status === "Delivered"
                          ? "Shipment completed"
                          : "Awaiting delivery"
                      }
                    </div>

                  </div>

                </div>

              </div>

              <div class="signature-area">

                <div class="signature">
                  Authorized Signature
                </div>

                <div class="signature">
                  Receiver Signature
                </div>

              </div>

              <div class="footer">

                <span>
                  TOY HUB Corporation · Dispatch Management
                </span>

                <span>
                  Generated ${new Date().toLocaleString("en-IN")}
                </span>

              </div>

            </div>

          </div>

          <script>

            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 350);
            };

          </script>

        </body>

      </html>
    `);

    printWindow.document.close();
  };

  const filteredDispatches = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return dispatches.filter((dispatch: any) => {
      const productName =
        dispatch.production?.items?.[0]?.product?.name.toLowerCase() || "";

      const destinationText =
        dispatch.destination?.toLowerCase() || "";

      const vehicle =
        dispatch.vehicleNumber?.toLowerCase() || "";

      const status =
        dispatch.status?.toLowerCase() || "";

      const matchesSearch =
        !keyword ||
        productName.includes(keyword) ||
        destinationText.includes(keyword) ||
        vehicle.includes(keyword) ||
        status.includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        dispatch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [dispatches, search, statusFilter]);

  const totalDispatches = dispatches.length;

  const pendingDispatches = dispatches.filter(
    (dispatch: any) => dispatch.status === "Pending",
  ).length;

  const dispatchedDispatches = dispatches.filter(
    (dispatch: any) => dispatch.status === "Dispatched",
  ).length;

  const deliveredDispatches = dispatches.filter(
    (dispatch: any) => dispatch.status === "Delivered",
  ).length;

  const totalUnits = dispatches.reduce(
    (sum: number, dispatch: any) =>
      sum + Number(dispatch.quantity || 0),
    0,
  );

  const todaysDispatches = dispatches.filter((dispatch: any) => {
    if (!dispatch.createdAt) return false;

    return (
      new Date(dispatch.createdAt).toDateString() ===
      new Date().toDateString()
    );
  }).length;

  const deliveryRate =
    totalDispatches > 0
      ? Math.round((deliveredDispatches / totalDispatches) * 100)
      : 0;

  const statusStats = [
    {
      label: "Pending",
      value: pendingDispatches,
      color: "bg-amber-500",
      track: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: "Dispatched",
      value: dispatchedDispatches,
      color: "bg-blue-600",
      track: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      label: "Delivered",
      value: deliveredDispatches,
      color: "bg-emerald-500",
      track: "bg-emerald-50",
      text: "text-emerald-700",
    },
  ];

  return (
    <AdminLayout>
      <div className="min-h-full bg-slate-50">
        <div className="mx-auto w-full max-w-[1550px] space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* =========================================================
              HERO
          ========================================================= */}

          <section className="relative overflow-hidden rounded-[28px] bg-[#111f55] px-6 py-8 text-white shadow-xl shadow-blue-950/10 sm:px-8 lg:px-10 lg:py-10">

            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

              <div className="max-w-3xl">

                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">

                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,0.12)]" />

                  Logistics Command Center

                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Dispatch Management
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100/80 sm:text-base">
                  Coordinate completed production, shipment movement,
                  destinations and delivery progress from one operational
                  workspace.
                </p>

              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={loadDispatches}
                  className="
                    inline-flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-white/15
                    bg-white/10
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-white/15
                  "
                >
                  <FiRefreshCw size={17} />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="
                    inline-flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-6
                    text-sm
                    font-bold
                    text-[#172B6B]
                    shadow-lg
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-xl
                    active:scale-[0.98]
                  "
                >
                  <FiZap size={17} />
                  New Dispatch
                </button>

              </div>

            </div>

          </section>

          {/* =========================================================
              KPI GRID
          ========================================================= */}

          <section>

            <div className="mb-4 flex items-end justify-between">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Operations Snapshot
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  Shipment health
                </h2>
              </div>

              <span className="hidden text-xs font-medium text-slate-400 sm:block">
                Live dispatch metrics
              </span>

            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">

              {[
                {
                  label: "Total Dispatches",
                  value: totalDispatches,
                  description: "All shipment records",
                  icon: FiPackage,
                  iconBg: "bg-blue-50",
                  iconColor: "text-blue-600",
                  valueColor: "text-slate-900",
                },
                {
                  label: "Pending",
                  value: pendingDispatches,
                  description: "Awaiting movement",
                  icon: FiClock,
                  iconBg: "bg-amber-50",
                  iconColor: "text-amber-600",
                  valueColor: "text-amber-600",
                },
                {
                  label: "Dispatched",
                  value: dispatchedDispatches,
                  description: "Currently in transit",
                  icon: FiTruck,
                  iconBg: "bg-indigo-50",
                  iconColor: "text-indigo-600",
                  valueColor: "text-indigo-600",
                },
                {
                  label: "Delivered",
                  value: deliveredDispatches,
                  description: "Successfully completed",
                  icon: FiCheckCircle,
                  iconBg: "bg-emerald-50",
                  iconColor: "text-emerald-600",
                  valueColor: "text-emerald-600",
                },
                {
                  label: "Units Moved",
                  value: totalUnits.toLocaleString(),
                  description: "Total quantity dispatched",
                  icon: FiPackage,
                  iconBg: "bg-violet-50",
                  iconColor: "text-violet-600",
                  valueColor: "text-violet-600",
                },
                {
                  label: "Today",
                  value: todaysDispatches,
                  description: `${deliveryRate}% delivery rate`,
                  icon: FiCalendar,
                  iconBg: "bg-rose-50",
                  iconColor: "text-rose-600",
                  valueColor: "text-rose-600",
                },
              ].map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="
                      group
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-5
                      shadow-sm
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:shadow-md
                    "
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          {card.label}
                        </p>

                        <p
                          className={`mt-3 text-3xl font-bold tracking-tight ${card.valueColor}`}
                        >
                          {card.value}
                        </p>

                      </div>

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}
                      >
                        <Icon size={20} />
                      </div>

                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      {card.description}
                    </p>

                  </div>
                );
              })}

            </div>

          </section>

          {/* =========================================================
              ANALYTICS
          ========================================================= */}

          <section className="grid gap-5 xl:grid-cols-5">

            <div className="xl:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Shipment Distribution
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Dispatch status
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current movement across the logistics pipeline.
                  </p>

                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <FiTruck size={20} />
                </div>

              </div>

              <div className="mt-8 space-y-5">

                {statusStats.map((item) => {

                  const percentage =
                    totalDispatches === 0
                      ? 0
                      : Math.round(
                          (item.value / totalDispatches) * 100,
                        );

                  return (
                    <div key={item.label}>

                      <div className="mb-2 flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <span
                            className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                          />

                          <span className="text-sm font-semibold text-slate-700">
                            {item.label}
                          </span>

                        </div>

                        <span className={`text-sm font-bold ${item.text}`}>
                          {item.value}
                          <span className="ml-1 text-xs font-medium text-slate-400">
                            ({percentage}%)
                          </span>
                        </span>

                      </div>

                      <div
                        className={`h-3 overflow-hidden rounded-full ${item.track}`}
                      >
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-700`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

            <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div>

                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Operational Signal
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Delivery performance
                </h2>

              </div>

              <div className="mt-7 flex items-center gap-6">

                <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">

                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        #22c55e ${deliveryRate * 3.6}deg,
                        #e2e8f0 ${deliveryRate * 3.6}deg
                      )`,
                    }}
                  />

                  <div className="absolute inset-[11px] flex flex-col items-center justify-center rounded-full bg-white">

                    <span className="text-3xl font-bold text-slate-900">
                      {deliveryRate}%
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Delivered
                    </span>

                  </div>

                </div>

                <div className="min-w-0 space-y-4">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Completed
                    </p>

                    <p className="mt-1 text-xl font-bold text-emerald-600">
                      {deliveredDispatches}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Remaining
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-700">
                      {Math.max(totalDispatches - deliveredDispatches, 0)}
                    </p>

                  </div>

                </div>

              </div>

              <div className="mt-7 rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <FiCheckCircle size={17} />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-800">
                      Logistics overview
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Based on the current dispatch records.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =========================================================
              SEARCH / FILTER
          ========================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div className="relative flex-1 xl:max-w-xl">

                <FiSearch
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  placeholder="Search product, destination, vehicle or status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-11
                    pr-4
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#17357A]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />

              </div>

              <div className="flex flex-wrap gap-2">

                {["All", "Pending", "Dispatched", "Delivered"].map(
                  (status) => {

                    const active =
                      statusFilter === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`
                          rounded-xl
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          transition
                          ${
                            active
                              ? "bg-[#172B6B] text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }
                        `}
                      >
                        {status}
                      </button>
                    );
                  },
                )}

              </div>

            </div>

          </section>

          {/* =========================================================
              MAIN WORKSPACE
          ========================================================= */}

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">

            {/* =======================================================
                RECORD LIST
            ======================================================= */}

            <div className="xl:col-span-7">

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <div className="flex items-center gap-2">

                        <h2 className="text-xl font-bold text-slate-900">
                          Dispatch Records
                        </h2>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                          {filteredDispatches.length}
                        </span>

                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        Select a shipment to inspect its operational details.
                      </p>

                    </div>

                    <FiArrowRight
                      size={20}
                      className="hidden text-slate-300 sm:block"
                    />

                  </div>

                </div>

                <div className="max-h-[720px] overflow-y-auto p-4 sm:p-5">

                  {loading ? (

                    <div className="flex min-h-[420px] flex-col items-center justify-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                        <FiRefreshCw
                          size={21}
                          className="animate-spin"
                        />

                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        Loading dispatch records
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Syncing logistics data...
                      </p>

                    </div>

                  ) : filteredDispatches.length === 0 ? (

                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">

                        <FiPackage size={27} />

                      </div>

                      <h3 className="mt-5 text-lg font-bold text-slate-800">
                        No dispatches found
                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        Try changing your search or status filter, or create
                        your first dispatch from completed production.
                      </p>

                    </div>

                  ) : (

                    <div className="space-y-3">

                      {filteredDispatches.map(
                        (dispatch: any) => {

                          const selected =
                            selectedDispatch?._id ===
                            dispatch._id;

                          const statusColor =
                            dispatch.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : dispatch.status === "Dispatched"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100";

                          return (
                            <div
                              key={dispatch._id}
                              onClick={() =>
                                setSelectedDispatch(dispatch)
                              }
                              className={`
                                group
                                cursor-pointer
                                rounded-2xl
                                border
                                p-5
                                transition-all
                                duration-200
                                ${
                                  selected
                                    ? "border-[#17357A]/30 bg-blue-50/60 shadow-sm ring-1 ring-[#17357A]/10"
                                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                }
                              `}
                            >

                              <div className="flex items-start justify-between gap-4">

                                <div className="flex min-w-0 gap-4">

                                  <div
                                    className={`
                                      flex
                                      h-12
                                      w-12
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-xl
                                      ${
                                        selected
                                          ? "bg-[#17357A] text-white"
                                          : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                                      }
                                    `}
                                  >
                                    <FiPackage size={20} />
                                  </div>

                                  <div className="min-w-0">

                                    <h3 className="truncate font-bold text-slate-900">
                                      {dispatch.production?.items?.[0]?.product?.name ||
                                        "Finished Product"}
                                    </h3>

                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">

                                      <span>
                                        {dispatch.production?.orderNumber ||
                                          "Production Order"}
                                      </span>

                                      <span className="text-slate-300">
                                        •
                                      </span>

                                      <span className="flex items-center gap-1">
                                        <FiMapPin size={12} />
                                        {dispatch.destination}
                                      </span>

                                    </div>

                                  </div>

                                </div>

                                <span
                                  className={`
                                    shrink-0
                                    rounded-full
                                    border
                                    px-3
                                    py-1.5
                                    text-[11px]
                                    font-bold
                                    ${statusColor}
                                  `}
                                >
                                  {dispatch.status}
                                </span>

                              </div>

                              <div className="mt-5 grid grid-cols-3 gap-3">

                                <div className="rounded-xl bg-slate-50 p-3">

                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Quantity
                                  </p>

                                  <p className="mt-1 font-bold text-slate-800">
                                    {dispatch.quantity}
                                    <span className="ml-1 text-xs font-medium text-slate-400">
                                      units
                                    </span>
                                  </p>

                                </div>

                                <div className="rounded-xl bg-slate-50 p-3">

                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Vehicle
                                  </p>

                                  <p className="mt-1 truncate font-bold text-slate-800">
                                    {dispatch.vehicleNumber || "—"}
                                  </p>

                                </div>

                                <div className="rounded-xl bg-slate-50 p-3">

                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Created
                                  </p>

                                  <p className="mt-1 font-bold text-slate-800">
                                    {dispatch.createdAt
                                      ? new Date(
                                          dispatch.createdAt,
                                        ).toLocaleDateString()
                                      : "—"}
                                  </p>

                                </div>

                              </div>

                              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">

                                <div className="flex items-center gap-2 text-xs text-slate-400">

                                  <FiClock size={13} />

                                  {dispatch.createdAt
                                    ? new Date(
                                        dispatch.createdAt,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "—"}

                                </div>

                                <div className="flex gap-2">

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrintChallan(dispatch);
                                    }}
                                    className="
                                      inline-flex
                                      items-center
                                      gap-1.5
                                      rounded-lg
                                      border
                                      border-slate-200
                                      bg-white
                                      px-3
                                      py-2
                                      text-xs
                                      font-bold
                                      text-slate-600
                                      transition
                                      hover:border-slate-300
                                      hover:bg-slate-50
                                      hover:text-slate-900
                                    "
                                  >
                                    <FiPrinter size={14} />
                                    Challan
                                  </button>

                                  {dispatch.status ===
                                    "Dispatched" && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkDelivered(
                                          dispatch,
                                        );
                                      }}
                                      className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        bg-emerald-600
                                        px-3
                                        py-2
                                        text-xs
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-emerald-700
                                      "
                                    >
                                      <FiCheckCircle size={14} />
                                      Deliver
                                    </button>
                                  )}

                                </div>

                              </div>

                            </div>
                          );
                        },
                      )}

                    </div>

                  )}

                </div>

              </div>

            </div>

            {/* =======================================================
                DETAIL PANEL
            ======================================================= */}

            <div className="xl:col-span-5">

              <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                {!selectedDispatch ? (

                  <div className="flex min-h-[650px] flex-col items-center justify-center px-8 text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                      <FiTruck size={27} />

                    </div>

                    <h3 className="mt-5 text-lg font-bold text-slate-800">
                      No shipment selected
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Select a dispatch record from the list to inspect
                      shipment details and progress.
                    </p>

                  </div>

                ) : (

                  <>

                    <div className="border-b border-slate-200 p-6">

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <div className="mb-3 flex items-center gap-2">

                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                              Shipment
                            </span>

                            <span className="text-xs text-slate-400">
                              #{selectedDispatch._id?.slice(-6)}
                            </span>

                          </div>

                          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            {selectedDispatch.production?.finishedProduct?.name ||
                              "Finished Product"}
                          </h2>

                          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                            <FiMapPin size={14} />
                            {selectedDispatch.destination}
                          </p>

                        </div>

                        <span
                          className={`
                            shrink-0
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            ${
                              selectedDispatch.status === "Pending"
                                ? "bg-amber-50 text-amber-700"
                                : selectedDispatch.status ===
                                    "Dispatched"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-emerald-50 text-emerald-700"
                            }
                          `}
                        >
                          {selectedDispatch.status}
                        </span>

                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handlePrintChallan(
                              selectedDispatch,
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-slate-700
                            transition
                            hover:bg-slate-50
                          "
                        >
                          <FiPrinter size={16} />
                          Print Challan
                        </button>

                        {selectedDispatch.status ===
                          "Dispatched" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkDelivered(
                                selectedDispatch,
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              bg-emerald-600
                              px-4
                              py-2.5
                              text-sm
                              font-semibold
                              text-white
                              shadow-sm
                              transition
                              hover:bg-emerald-700
                            "
                          >
                            <FiCheckCircle size={16} />
                            Mark Delivered
                          </button>
                        )}

                      </div>

                    </div>

                    <div className="space-y-7 p-6">

                      {/* Summary */}

                      <div>

                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Shipment Summary
                        </p>

                        <div className="grid grid-cols-2 gap-3">

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                            <p className="text-xs font-medium text-slate-400">
                              Quantity
                            </p>

                            <p className="mt-2 text-xl font-bold text-slate-900">
                              {selectedDispatch.quantity}
                              <span className="ml-1 text-xs font-semibold text-slate-400">
                                units
                              </span>
                            </p>

                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                            <p className="text-xs font-medium text-slate-400">
                              Vehicle
                            </p>

                            <p className="mt-2 truncate text-lg font-bold text-slate-900">
                              {selectedDispatch.vehicleNumber ||
                                "Not assigned"}
                            </p>

                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                            <p className="text-xs font-medium text-slate-400">
                              Production
                            </p>

                            <p className="mt-2 truncate text-sm font-bold text-slate-900">
                              {selectedDispatch.production
                                ?.orderNumber || "—"}
                            </p>

                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                            <p className="text-xs font-medium text-slate-400">
                              Dispatch Date
                            </p>

                            <p className="mt-2 text-sm font-bold text-slate-900">
                              {selectedDispatch.createdAt
                                ? new Date(
                                    selectedDispatch.createdAt,
                                  ).toLocaleDateString()
                                : "—"}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* Destination */}

                      <div>

                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Destination
                        </p>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <FiMapPin size={18} />
                          </div>

                          <div className="min-w-0">

                            <p className="text-xs font-medium text-slate-400">
                              Delivery location
                            </p>

                            <p className="mt-1 truncate text-sm font-bold text-slate-800">
                              {selectedDispatch.destination}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* Notes */}

                      {selectedDispatch.notes && (

                        <div>

                          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                            Dispatch Notes
                          </p>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                            {selectedDispatch.notes}
                          </div>

                        </div>

                      )}

                      {/* Timeline */}

                      <div>

                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Shipment Timeline
                        </p>

                        <div className="relative space-y-5">

                          <div className="absolute left-[9px] top-3 h-[calc(100%-25px)] w-px bg-slate-200" />

                          <div className="relative flex gap-4">

                            <div className="z-10 mt-1 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-blue-100">

                              <span className="h-2 w-2 rounded-full bg-blue-600" />

                            </div>

                            <div className="flex-1">

                              <p className="text-sm font-bold text-slate-800">
                                Dispatch Created
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {selectedDispatch.createdAt
                                  ? new Date(
                                      selectedDispatch.createdAt,
                                    ).toLocaleString()
                                  : "—"}
                              </p>

                            </div>

                          </div>

                          <div className="relative flex gap-4">

                            <div
                              className={`
                                z-10
                                mt-1
                                flex
                                h-[19px]
                                w-[19px]
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                ${
                                  selectedDispatch.status ===
                                    "Pending"
                                    ? "bg-slate-100"
                                    : "bg-orange-100"
                                }
                              `}
                            >

                              <span
                                className={`
                                  h-2
                                  w-2
                                  rounded-full
                                  ${
                                    selectedDispatch.status ===
                                      "Pending"
                                      ? "bg-slate-300"
                                      : "bg-orange-500"
                                  }
                                `}
                              />

                            </div>

                            <div className="flex-1">

                              <p className="text-sm font-bold text-slate-800">
                                Dispatched
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {selectedDispatch.dispatchedAt
                                  ? new Date(
                                      selectedDispatch.dispatchedAt,
                                    ).toLocaleString()
                                  : selectedDispatch.status ===
                                      "Pending"
                                    ? "Waiting for dispatch"
                                    : "Dispatch timestamp unavailable"}
                              </p>

                            </div>

                          </div>

                          <div className="relative flex gap-4">

                            <div
                              className={`
                                z-10
                                mt-1
                                flex
                                h-[19px]
                                w-[19px]
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                ${
                                  selectedDispatch.status ===
                                    "Delivered"
                                    ? "bg-emerald-100"
                                    : "bg-slate-100"
                                }
                              `}
                            >

                              <span
                                className={`
                                  h-2
                                  w-2
                                  rounded-full
                                  ${
                                    selectedDispatch.status ===
                                      "Delivered"
                                      ? "bg-emerald-500"
                                      : "bg-slate-300"
                                  }
                                `}
                              />

                            </div>

                            <div className="flex-1">

                              <p className="text-sm font-bold text-slate-800">
                                Delivered
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {selectedDispatch.status ===
                                  "Delivered"
                                  ? "Shipment successfully completed"
                                  : "Waiting for delivery"}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </>

                )}

              </div>

            </div>

          </section>

        </div>

        {/* =========================================================
            CREATE DISPATCH MODAL
        ========================================================= */}

        {showModal && (
  <div
    className="
      fixed inset-0 z-[100]
      flex items-center justify-center
      bg-slate-950/55
      p-4
      backdrop-blur-sm
      sm:p-6
    "
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) {
        setShowModal(false);
      }
    }}
  >
    <div
      className="
        flex
        w-full
        max-w-2xl
        flex-col
        overflow-hidden
        rounded-[28px]
        border
        border-white/60
        bg-white
        shadow-[0_24px_80px_rgba(15,23,42,0.25)]
        max-h-[calc(100vh-2rem)]
        sm:max-h-[calc(100vh-3rem)]
      "
    >

      {/* HEADER */}

      <div className="relative shrink-0 overflow-hidden bg-[#111f55] px-6 py-6 text-white sm:px-8">

        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative flex items-start justify-between gap-5">

          <div className="min-w-0">

            <div className="
              mb-3
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/10
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-blue-100
            ">
              <FiTruck size={13} />
              Logistics
            </div>

            <h2 className="text-2xl font-bold tracking-tight">
              Create Dispatch
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100/75">
              Create a shipment from completed production and capture its
              destination, vehicle and dispatch details.
            </p>

          </div>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white/10
              text-white
              transition
              hover:bg-white/15
            "
            aria-label="Close"
          >
            <FiX size={19} />
          </button>

        </div>
      </div>

      {/* SCROLLABLE BODY */}

      <div className="min-h-0 flex-1 overflow-y-auto">

        <div className="px-6 py-6 sm:px-8">

          <div className="space-y-5">

            {/* Production */}

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Completed Production
              </label>

              <div className="relative">

                <FiPackage
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <select
                  value={selectedProduction}
                  onChange={(e) =>
                    setSelectedProduction(e.target.value)
                  }
                  className="
                    h-12
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-10
                    pr-10
                    text-sm
                    font-medium
                    text-slate-800
                    outline-none
                    transition
                    focus:border-[#17357A]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                  "
                >
                  <option value="">
                    Select completed production
                  </option>

                  {completedProductions.map((production: any) => (
                    <option
                      key={production._id}
                      value={production._id}
                    >
                      {production.orderNumber} —{" "}
                      {production.finishedProduct?.name || "Product"}
                    </option>
                  ))}
                </select>

                <span className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  text-slate-400
                ">
                  ▼
                </span>

              </div>

              {!completedProductions.length && (
                <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  No completed production orders are currently available.
                </div>
              )}

            </div>

            {/* Quantity / Vehicle */}

            <div className="grid gap-5 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Dispatch Quantity
                </label>

                <div className="relative">

                  <FiPackage
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Number(e.target.value))
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      pl-10
                      pr-4
                      text-sm
                      font-semibold
                      text-slate-800
                      outline-none
                      transition
                      focus:border-[#17357A]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Vehicle Number
                </label>

                <div className="relative">

                  <FiTruck
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) =>
                      setVehicleNumber(e.target.value)
                    }
                    placeholder="MH12 AB1234"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      pl-10
                      pr-4
                      text-sm
                      font-semibold
                      uppercase
                      text-slate-800
                      outline-none
                      transition
                      placeholder:normal-case
                      placeholder:text-slate-400
                      focus:border-[#17357A]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                </div>

              </div>

            </div>

            {/* Destination */}

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Destination
              </label>

              <div className="relative">

                <FiMapPin
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  value={destination}
                  onChange={(e) =>
                    setDestination(e.target.value)
                  }
                  placeholder="Customer / Warehouse"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-10
                    pr-4
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#17357A]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />

              </div>

            </div>

            {/* Notes */}

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Dispatch Notes
              </label>

              <textarea
                rows={5}
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="Additional dispatch instructions or notes..."
                className="
                  min-h-[130px]
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-[#17357A]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-100
                "
              />

            </div>

          </div>

        </div>

      </div>

      {/* FIXED FOOTER */}

      <div className="
        shrink-0
        flex
        flex-col-reverse
        gap-3
        border-t
        border-slate-200
        bg-slate-50/90
        px-6
        py-4
        sm:flex-row
        sm:justify-end
        sm:px-8
      ">

        <button
          type="button"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
          className="
            h-11
            rounded-xl
            border
            border-slate-200
            bg-white
            px-6
            text-sm
            font-bold
            text-slate-600
            transition
            hover:bg-slate-50
            hover:text-slate-900
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCreateDispatch}
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#172B6B]
            px-7
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-[#20398F]
            hover:shadow-md
            active:scale-[0.98]
          "
        >
          <FiCheckCircle size={17} />
          Create Dispatch
          <FiChevronRight size={16} />
        </button>

      </div>

    </div>
  </div>
)}
      </div>
    </AdminLayout>
  );
};

export default DispatchPage;