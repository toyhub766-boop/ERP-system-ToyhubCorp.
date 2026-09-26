import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
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
  createDispatch,
  getDispatches,
  updateDispatch,
} from "../services/dispatch.service";
import { getProductions } from "../../production/services/production.services";

const getOrdered = (item: any) =>
  Number(item?.quantity ?? item?.orderedQuantity ?? 0);

const getProduced = (item: any) =>
  Number(item?.actualQuantity ?? item?.producedQuantity ?? 0);

const getExistingStock = (item: any) =>
  Number(item?.existingStockQuantity ?? 0);

const getAvailable = (item: any) =>
  Number(
    item?.availableQuantity ??
      getProduced(item) + getExistingStock(item),
  );

const getReady = (item: any) =>
  Number(
    item?.readyForDispatchQuantity ??
      (item?.readyForDispatch ? getAvailable(item) : 0),
  );

const getItemName = (item: any) =>
  item?.catalogueProduct?.name ||
  item?.product?.name ||
  item?.name ||
  "Product";

const getModel = (item: any) =>
  item?.modelNumber ||
  item?.catalogueProduct?.modelNumber ||
  item?.product?.sku ||
  "";

const getMarka = (item: any) =>
  item?.marka ||
  item?.catalogueProduct?.marka ||
  "";

const getDispatchedForItem = (
  dispatches: any[],
  productionId: string,
  productionItemId: string,
) =>
  dispatches
    .filter(
      (dispatch) =>
        String(dispatch?.production?._id || dispatch?.production) ===
          String(productionId) &&
        String(dispatch?.productionItem) === String(productionItemId) &&
        ["Dispatched", "Delivered"].includes(dispatch?.status),
    )
    .reduce(
      (sum, dispatch) => sum + Number(dispatch?.quantity || 0),
      0,
    );

const getDispatchable = (
  dispatches: any[],
  production: any,
  item: any,
) =>
  Math.max(
    0,
    getReady(item) -
      getDispatchedForItem(dispatches, production?._id, item?._id),
  );

const DispatchPage = () => {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [productions, setProductions] = useState<any[]>([]);
  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [selectedProduction, setSelectedProduction] = useState("");
  const [selectedProductionItem, setSelectedProductionItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [destination, setDestination] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [cartonPhotos, setCartonPhotos] = useState<string[]>([]);
  const [challanPhoto, setChallanPhoto] = useState("");

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
      setProductions(productionData || []);

      setSelectedDispatch((current: any) => {
        if (!dispatchData?.length) return null;

        if (current?._id) {
          const existing = dispatchData.find(
            (item: any) => item._id === current._id,
          );
          if (existing) return existing;
        }

        return dispatchData[0];
      });
    } catch (error) {
      console.error("LOAD DISPATCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDispatches();
  }, []);

  const dispatchableProductions = useMemo(() => {
    return (productions || [])
      .map((production: any) => {
        const items = Array.isArray(production?.items)
          ? production.items.filter(
              (item: any) =>
                item?._id &&
                getDispatchable(dispatches, production, item) > 0,
            )
          : [];

        return { ...production, items };
      })
      .filter((production: any) => production.items.length > 0);
  }, [productions, dispatches]);

  const activeProduction = useMemo(
    () =>
      dispatchableProductions.find(
        (production: any) =>
          String(production._id) === String(selectedProduction),
      ) || null,
    [dispatchableProductions, selectedProduction],
  );

  const activeItem = useMemo(
    () =>
      activeProduction?.items?.find(
        (item: any) =>
          String(item._id) === String(selectedProductionItem),
      ) || null,
    [activeProduction, selectedProductionItem],
  );

  const dispatchableQuantity = activeProduction && activeItem
    ? getDispatchable(dispatches, activeProduction, activeItem)
    : 0;

  const resetForm = () => {
    setSelectedProduction("");
    setSelectedProductionItem("");
    setQuantity(1);
    setDestination("");
    setVehicleNumber("");
    setNotes("");
    setCartonPhotos([]);
    setChallanPhoto("");
  };

  const handleProductionChange = (value: string) => {
    setSelectedProduction(value);

    const production = dispatchableProductions.find(
      (item: any) => String(item._id) === String(value),
    );

    const firstItem = production?.items?.[0];

    setSelectedProductionItem(firstItem?._id || "");
    setQuantity(
      firstItem
        ? Math.min(
            1,
            getDispatchable(dispatches, production, firstItem),
          )
        : 1,
    );
  };

  const handleItemChange = (value: string) => {
    setSelectedProductionItem(value);

    const item = activeProduction?.items?.find(
      (entry: any) => String(entry._id) === String(value),
    );

    setQuantity(
      item
        ? Math.min(
            1,
            getDispatchable(dispatches, activeProduction, item),
          )
        : 1,
    );
  };

  const handleCreateDispatch = async () => {
    if (!selectedProduction) {
      alert("Select a production order");
      return;
    }

    if (!selectedProductionItem) {
      alert("Select a production item");
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

    if (quantity > dispatchableQuantity) {
      alert(
        `Only ${dispatchableQuantity} unit(s) are currently available for dispatch.`,
      );
      return;
    }

    try {
      await createDispatch({
        production: selectedProduction,
        productionItem: selectedProductionItem,
        quantity,
        destination: destination.trim(),
        vehicleNumber: vehicleNumber.trim(),
        notes: notes.trim(),
        status: "Dispatched",
        dispatchedAt: new Date().toISOString(),
        cartonPhotos,
        challanPhoto: challanPhoto.trim(),
      });

      setShowModal(false);
      resetForm();
      await loadDispatches();
    } catch (error: any) {
      console.error("CREATE DISPATCH ERROR:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create dispatch.",
      );
    }
  };

  const handleMarkDelivered = async (dispatch: any) => {
    if (!dispatch?._id) return;

    try {
      await updateDispatch(dispatch._id, {
        destination: dispatch.destination,
        vehicleNumber: dispatch.vehicleNumber || "",
        notes: dispatch.notes || "",
        status: "Delivered",
        cartonPhotos: dispatch.cartonPhotos || [],
        challanPhoto: dispatch.challanPhoto || "",
      });

      await loadDispatches();
    } catch (error: any) {
      console.error("MARK DELIVERED ERROR:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to mark dispatch as delivered.",
      );
    }
  };

  const handlePrintChallan = (dispatch: any) => {
    if (!dispatch) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const item =
      dispatch.production?.items?.find(
        (entry: any) =>
          String(entry?._id) === String(dispatch?.productionItem),
      ) ||
      dispatch.production?.items?.[0];

    const productName = getItemName(item);
    const model = getModel(item);
    const marka = getMarka(item);
    const productionOrder =
      dispatch.production?.orderNumber ||
      dispatch.production?.productionNumber ||
      "-";

    const escapeHtml = (value: any) =>
      String(value ?? "-")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const createdDate = dispatch.createdAt
      ? new Date(dispatch.createdAt)
      : new Date();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Dispatch Challan - ${escapeHtml(productName)}</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: A4; margin: 0; }
            body {
              margin: 0;
              background: #eef2f7;
              color: #172033;
              font-family: Inter, -apple-system, BlinkMacSystemFont,
                "Segoe UI", Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              background: white;
            }
            .top { height: 9px; background: linear-gradient(90deg,#172b6b,#2563eb,#22c55e); }
            .content { padding: 42px 46px 38px; }
            .row { display:flex; justify-content:space-between; gap:30px; }
            .brand { display:flex; gap:14px; align-items:center; }
            .mark {
              width:48px;height:48px;border-radius:14px;
              display:flex;align-items:center;justify-content:center;
              background:#172b6b;color:#fff;font-weight:800;
            }
            .brand-name { font-size:22px;font-weight:800;color:#172b6b; }
            .muted { color:#718096;font-size:11px; }
            .meta { text-align:right; }
            .label {
              font-size:10px;font-weight:800;letter-spacing:1.5px;
              text-transform:uppercase;color:#718096;
            }
            h1 { margin:6px 0 0;font-size:30px; }
            .hero {
              margin-top:42px;padding:24px;border:1px solid #e5eaf1;
              border-radius:20px;background:#f7f9fc;
              display:flex;justify-content:space-between;gap:20px;
            }
            .hero-product { margin-top:8px;font-size:23px;font-weight:800; }
            .pill {
              align-self:flex-start;padding:9px 14px;border-radius:999px;
              background:#dbeafe;color:#1d4ed8;font-weight:800;font-size:11px;
            }
            .section { margin-top:30px; }
            .section-title {
              margin-bottom:12px;font-size:11px;font-weight:800;
              color:#172b6b;text-transform:uppercase;letter-spacing:1.6px;
            }
            .grid {
              display:grid;grid-template-columns:1fr 1fr;
              border:1px solid #e5eaf1;border-radius:16px;overflow:hidden;
            }
            .detail { padding:18px 20px;border-bottom:1px solid #e5eaf1; }
            .detail:nth-child(odd) { border-right:1px solid #e5eaf1; }
            .detail-label { font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase; }
            .detail-value { margin-top:7px;font-size:14px;font-weight:700;color:#1e293b; }
            table { width:100%;border-collapse:collapse;border:1px solid #e5eaf1; }
            th { padding:14px 16px;background:#f8fafc;text-align:left;font-size:10px;color:#64748b; }
            td { padding:18px 16px;border-top:1px solid #edf1f5;font-size:13px; }
            .qty { font-size:18px;font-weight:800;color:#172b6b; }
            .notes { padding:18px 20px;border:1px solid #e5eaf1;border-radius:16px;background:#fafbfc; }
            .footer {
              margin-top:48px;padding-top:18px;border-top:1px solid #e5eaf1;
              display:flex;justify-content:space-between;color:#94a3b8;font-size:9px;
            }
            @media print {
              body { background:white; }
              .page { margin:0;width:210mm; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="top"></div>
            <div class="content">
              <div class="row">
                <div class="brand">
                  <div class="mark">TH</div>
                  <div>
                    <div class="brand-name">TOY HUB</div>
                    <div class="muted">Corporation</div>
                  </div>
                </div>
                <div class="meta">
                  <div class="label">Logistics Document</div>
                  <h1>DISPATCH CHALLAN</h1>
                  <div class="muted">Dispatch ID: ${escapeHtml(dispatch._id)}</div>
                </div>
              </div>

              <div class="hero">
                <div>
                  <div class="label">Shipment</div>
                  <div class="hero-product">${escapeHtml(productName)}</div>
                  <div class="muted">
                    Production Order: ${escapeHtml(productionOrder)}
                  </div>
                </div>
                <div class="pill">${escapeHtml(dispatch.status || "Pending")}</div>
              </div>

              <div class="section">
                <div class="section-title">Dispatch Information</div>
                <div class="grid">
                  <div class="detail">
                    <div class="detail-label">Destination</div>
                    <div class="detail-value">${escapeHtml(dispatch.destination)}</div>
                  </div>
                  <div class="detail">
                    <div class="detail-label">Vehicle Number</div>
                    <div class="detail-value">${escapeHtml(dispatch.vehicleNumber || "-")}</div>
                  </div>
                  <div class="detail">
                    <div class="detail-label">Model</div>
                    <div class="detail-value">${escapeHtml(model || "-")}</div>
                  </div>
                  <div class="detail">
                    <div class="detail-label">Marka / Mark</div>
                    <div class="detail-value">${escapeHtml(marka || "-")}</div>
                  </div>
                  <div class="detail">
                    <div class="detail-label">Dispatch Date</div>
                    <div class="detail-value">
                      ${createdDate.toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div class="detail">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">${escapeHtml(dispatch.status)}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Shipment Summary</div>
                <table>
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
                      <td><strong>${escapeHtml(productName)}</strong></td>
                      <td>${escapeHtml(productionOrder)}</td>
                      <td><span class="qty">${escapeHtml(dispatch.quantity)}</span> units</td>
                      <td>${escapeHtml(dispatch.destination)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              ${
                dispatch.notes
                  ? `
                    <div class="section">
                      <div class="section-title">Dispatch Notes</div>
                      <div class="notes">${escapeHtml(dispatch.notes)}</div>
                    </div>
                  `
                  : ""
              }

              <div class="footer">
                <span>TOY HUB Corporation · Dispatch Management</span>
                <span>Generated ${new Date().toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
          <script>
            window.onload = function () {
              setTimeout(function () { window.print(); }, 350);
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
      const item =
        dispatch.production?.items?.find(
          (entry: any) =>
            String(entry?._id) === String(dispatch?.productionItem),
        ) || dispatch.production?.items?.[0];

      const searchable = [
        getItemName(item),
        getModel(item),
        getMarka(item),
        dispatch.production?.orderNumber,
        dispatch.destination,
        dispatch.vehicleNumber,
        dispatch.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !keyword || searchable.includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        dispatch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [dispatches, search, statusFilter]);

  const totalDispatches = dispatches.length;
  const pendingDispatches = dispatches.filter(
    (dispatch) => dispatch.status === "Pending",
  ).length;
  const dispatchedDispatches = dispatches.filter(
    (dispatch) => dispatch.status === "Dispatched",
  ).length;
  const deliveredDispatches = dispatches.filter(
    (dispatch) => dispatch.status === "Delivered",
  ).length;
  const totalUnits = dispatches.reduce(
    (sum, dispatch) => sum + Number(dispatch.quantity || 0),
    0,
  );
  const todaysDispatches = dispatches.filter((dispatch) => {
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

  return (
    <AdminLayout>
      <div className="min-h-full bg-slate-50">
        <div className="mx-auto w-full max-w-[1550px] space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="relative overflow-hidden rounded-[28px] bg-[#111f55] px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Logistics Command Center
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Dispatch Management
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100/80 sm:text-base">
                  Dispatch only the quantities that Production has actually
                  made ready. Partial shipments remain traceable until the
                  order is fulfilled.
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => void loadDispatches()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15"
                >
                  <FiRefreshCw size={17} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#172B6B] shadow-lg hover:-translate-y-0.5"
                >
                  <FiZap size={17} />
                  New Dispatch
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 xl:grid-cols-6">
            {[
              ["Total Dispatches", totalDispatches, "All shipment records"],
              ["Pending", pendingDispatches, "Awaiting movement"],
              ["Dispatched", dispatchedDispatches, "Currently in transit"],
              ["Delivered", deliveredDispatches, "Successfully completed"],
              ["Units Moved", totalUnits.toLocaleString(), "Total quantity"],
              ["Today", todaysDispatches, `${deliveryRate}% delivery rate`],
            ].map(([label, value, description]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  {value}
                </p>
                <p className="mt-3 text-xs text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative flex-1 xl:max-w-xl">
                <FiSearch
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search product, order, destination, vehicle..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {["All", "Pending", "Dispatched", "Delivered"].map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        statusFilter === status
                          ? "bg-[#172B6B] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Dispatch Records
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Every partial dispatch is a separate transaction.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      {filteredDispatches.length}
                    </span>
                  </div>
                </div>

                <div className="max-h-[720px] overflow-y-auto p-4 sm:p-5">
                  {loading ? (
                    <div className="flex min-h-[420px] items-center justify-center">
                      <FiRefreshCw
                        size={25}
                        className="animate-spin text-blue-600"
                      />
                    </div>
                  ) : filteredDispatches.length === 0 ? (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                      <FiPackage size={28} className="text-slate-400" />
                      <h3 className="mt-5 text-lg font-bold text-slate-800">
                        No dispatches found
                      </h3>
                      <p className="mt-2 max-w-sm text-sm text-slate-500">
                        Create a dispatch from a Production item that has
                        ready quantity.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredDispatches.map((dispatch: any) => {
                        const item =
                          dispatch.production?.items?.find(
                            (entry: any) =>
                              String(entry?._id) ===
                              String(dispatch?.productionItem),
                          ) ||
                          dispatch.production?.items?.[0];

                        const selected =
                          selectedDispatch?._id === dispatch._id;

                        const statusColor =
                          dispatch.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : dispatch.status === "Dispatched"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100";

                        return (
                          <div
                            key={dispatch._id}
                            onClick={() => setSelectedDispatch(dispatch)}
                            className={`cursor-pointer rounded-2xl border p-5 transition ${
                              selected
                                ? "border-blue-200 bg-blue-50/60 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="truncate font-bold text-slate-900">
                                  {getItemName(item)}
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-slate-500">
                                  <span>
                                    {dispatch.production?.orderNumber ||
                                      "Production Order"}
                                  </span>
                                  {getModel(item) && (
                                    <>
                                      <span>•</span>
                                      <span>Model {getModel(item)}</span>
                                    </>
                                  )}
                                  {getMarka(item) && (
                                    <>
                                      <span>•</span>
                                      <span>{getMarka(item)}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <span
                                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${statusColor}`}
                              >
                                {dispatch.status}
                              </span>
                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-3">
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                  Quantity
                                </p>
                                <p className="mt-1 font-bold text-slate-800">
                                  {Number(dispatch.quantity || 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                  Destination
                                </p>
                                <p className="mt-1 truncate font-bold text-slate-800">
                                  {dispatch.destination || "—"}
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                  Vehicle
                                </p>
                                <p className="mt-1 truncate font-bold text-slate-800">
                                  {dispatch.vehicleNumber || "—"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                              <span className="flex items-center gap-2 text-xs text-slate-400">
                                <FiClock size={13} />
                                {dispatch.createdAt
                                  ? new Date(
                                      dispatch.createdAt,
                                    ).toLocaleString()
                                  : "—"}
                              </span>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintChallan(dispatch);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                  <FiPrinter size={14} />
                                  Challan
                                </button>

                                {dispatch.status === "Dispatched" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void handleMarkDelivered(dispatch);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                                  >
                                    <FiCheckCircle size={14} />
                                    Deliver
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-5">
              <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {!selectedDispatch ? (
                  <div className="flex min-h-[500px] flex-col items-center justify-center px-8 text-center">
                    <FiTruck size={28} className="text-slate-400" />
                    <h3 className="mt-5 text-lg font-bold text-slate-800">
                      No shipment selected
                    </h3>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const item =
                        selectedDispatch.production?.items?.find(
                          (entry: any) =>
                            String(entry?._id) ===
                            String(selectedDispatch.productionItem),
                        ) ||
                        selectedDispatch.production?.items?.[0];

                      const ordered = getOrdered(item);
                      const ready = getReady(item);
                      const dispatched = getDispatchedForItem(
                        dispatches,
                        selectedDispatch.production?._id,
                        selectedDispatch.productionItem,
                      );
                      const remaining = Math.max(
                        0,
                        ordered - dispatched,
                      );

                      return (
                        <>
                          <div className="border-b border-slate-200 p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                                  Shipment
                                </span>
                                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                                  {getItemName(item)}
                                </h2>
                                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                                  <FiMapPin size={14} />
                                  {selectedDispatch.destination}
                                </p>
                              </div>

                              <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                                {selectedDispatch.status}
                              </span>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handlePrintChallan(selectedDispatch)
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <FiPrinter size={16} />
                                Print Challan
                              </button>

                              {selectedDispatch.status === "Dispatched" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleMarkDelivered(
                                      selectedDispatch,
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                  <FiCheckCircle size={16} />
                                  Mark Delivered
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-7 p-6">
                            <div>
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                  Order Balance
                                </p>
                                {remaining > 0 ? (
                                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                                    Partially fulfilled
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                    Fully fulfilled
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                  ["Ordered", ordered],
                                  ["Available", ready],
                                  ["Dispatched", dispatched],
                                  ["Remaining", remaining],
                                ].map(([label, value]) => (
                                  <div
                                    key={String(label)}
                                    className={`rounded-2xl border p-4 ${
                                      label === "Remaining" && Number(value) > 0
                                        ? "border-amber-200 bg-amber-50"
                                        : "border-slate-200 bg-slate-50"
                                    }`}
                                  >
                                    <p className="text-xs font-medium text-slate-400">
                                      {label}
                                    </p>
                                    <p className={`mt-2 text-xl font-bold ${
                                      label === "Remaining" && Number(value) > 0
                                        ? "text-amber-700"
                                        : "text-slate-900"
                                    }`}>
                                      {Number(value).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {remaining > 0 && (
                                <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                  <FiAlertCircle className="mt-0.5 shrink-0 text-amber-600" size={16} />
                                  <div>
                                    <p className="text-xs font-bold text-amber-800">
                                      {remaining.toLocaleString()} unit{remaining === 1 ? "" : "s"} still remaining on this order
                                    </p>
                                    <p className="mt-1 text-[10px] leading-4 text-amber-700">
                                      This order is not fully dispatched yet. The remaining quantity stays open for the next production-ready dispatch.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                Product Identification
                              </p>
                              <div className="rounded-2xl border border-slate-200 p-4">
                                <p className="font-bold text-slate-900">
                                  {getItemName(item)}
                                </p>
                                {getModel(item) && (
                                  <p className="mt-1 text-sm text-slate-500">
                                    Model: {getModel(item)}
                                  </p>
                                )}
                                {getMarka(item) && (
                                  <p className="mt-1 text-sm text-slate-500">
                                    Marka: {getMarka(item)}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                Dispatch Information
                              </p>
                              <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                                <div className="flex justify-between gap-4 text-sm">
                                  <span className="text-slate-400">
                                    Destination
                                  </span>
                                  <span className="font-bold text-slate-800">
                                    {selectedDispatch.destination}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4 text-sm">
                                  <span className="text-slate-400">
                                    Vehicle
                                  </span>
                                  <span className="font-bold text-slate-800">
                                    {selectedDispatch.vehicleNumber || "—"}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4 text-sm">
                                  <span className="text-slate-400">
                                    Dispatch Quantity
                                  </span>
                                  <span className="font-bold text-slate-800">
                                    {selectedDispatch.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {selectedDispatch.notes && (
                              <div>
                                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                  Notes
                                </p>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                  {selectedDispatch.notes}
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                Shipment Timeline
                              </p>
                              <div className="space-y-5">
                                <div className="flex gap-4">
                                  <FiCheckCircle className="mt-0.5 text-blue-600" />
                                  <div>
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

                                <div className="flex gap-4">
                                  <FiTruck
                                    className={
                                      selectedDispatch.dispatchedAt
                                        ? "mt-0.5 text-blue-600"
                                        : "mt-0.5 text-slate-300"
                                    }
                                  />
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">
                                      Dispatched
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                      {selectedDispatch.dispatchedAt
                                        ? new Date(
                                            selectedDispatch.dispatchedAt,
                                          ).toLocaleString()
                                        : "Waiting for dispatch"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex gap-4">
                                  <FiCheckCircle
                                    className={
                                      selectedDispatch.status ===
                                      "Delivered"
                                        ? "mt-0.5 text-emerald-600"
                                        : "mt-0.5 text-slate-300"
                                    }
                                  />
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">
                                      Delivered
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                      {selectedDispatch.deliveredAt
                                        ? new Date(
                                            selectedDispatch.deliveredAt,
                                          ).toLocaleString()
                                        : "Waiting for delivery"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </section>
        </div>

        {showModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
              <div className="relative shrink-0 bg-[#111f55] px-6 py-6 text-white sm:px-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">
                      <FiTruck size={13} />
                      Logistics
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Create Dispatch
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-blue-100/75">
                      Dispatch only the quantity that Production has marked
                      ready.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/15"
                    aria-label="Close"
                  >
                    <FiX size={19} />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Production Order
                    </label>
                    <select
                      value={selectedProduction}
                      onChange={(e) =>
                        handleProductionChange(e.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">
                        Select production with ready quantity
                      </option>
                      {dispatchableProductions.map((production: any) => (
                        <option
                          key={production._id}
                          value={production._id}
                        >
                          {production.orderNumber ||
                            production.productionNumber ||
                            production._id}
                        </option>
                      ))}
                    </select>

                    {!dispatchableProductions.length && (
                      <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                        No Production items are currently ready for dispatch.
                      </div>
                    )}
                  </div>

                  {activeProduction && (
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Production Item
                      </label>
                      <select
                        value={selectedProductionItem}
                        onChange={(e) =>
                          handleItemChange(e.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Select item</option>
                        {activeProduction.items.map((item: any) => {
                          const available = getDispatchable(
                            dispatches,
                            activeProduction,
                            item,
                          );

                          return (
                            <option key={item._id} value={item._id}>
                              {getItemName(item)}
                              {getModel(item)
                                ? ` · ${getModel(item)}`
                                : ""}{" "}
                              — {available.toLocaleString()} ready
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {activeItem && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                      {(() => {
                        const ordered = getOrdered(activeItem);
                        const ready = getReady(activeItem);
                        const dispatched = getDispatchedForItem(
                          dispatches,
                          activeProduction?._id,
                          activeItem?._id,
                        );
                        const remaining = Math.max(0, ordered - dispatched);

                        return (
                          <>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-bold text-slate-900">
                                  {getItemName(activeItem)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  This item is part of the selected production order.
                                </p>
                              </div>

                              <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Dispatchable now
                                </p>
                                <p className="mt-1 text-xl font-bold text-blue-700">
                                  {dispatchableQuantity.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                              <div className="rounded-xl bg-white px-3 py-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ordered</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{ordered.toLocaleString()}</p>
                              </div>
                              <div className="rounded-xl bg-white px-3 py-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ready</p>
                                <p className="mt-1 text-sm font-bold text-blue-700">{ready.toLocaleString()}</p>
                              </div>
                              <div className="rounded-xl bg-white px-3 py-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Dispatched</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{dispatched.toLocaleString()}</p>
                              </div>
                              <div className={`rounded-xl px-3 py-2.5 ${remaining > 0 ? "bg-amber-100" : "bg-emerald-100"}`}>
                                <p className={`text-[9px] font-bold uppercase tracking-wider ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>Remaining</p>
                                <p className={`mt-1 text-sm font-bold ${remaining > 0 ? "text-amber-700" : "text-emerald-700"}`}>{remaining.toLocaleString()}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Dispatch Quantity
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, dispatchableQuantity)}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number(e.target.value))
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                      {activeItem && (
                        <p className="mt-1 text-xs text-slate-400">
                          Maximum: {dispatchableQuantity.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Vehicle Number
                      </label>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) =>
                          setVehicleNumber(e.target.value)
                        }
                        placeholder="MH12 AB1234"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold uppercase text-slate-800 outline-none placeholder:normal-case placeholder:text-slate-400 focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Destination
                    </label>
                    <div className="relative">
                      <FiMapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) =>
                          setDestination(e.target.value)
                        }
                        placeholder="Customer / Warehouse"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Carton Photo URLs
                    </label>
                    <input
                      type="text"
                      value={cartonPhotos.join(", ")}
                      onChange={(e) =>
                        setCartonPhotos(
                          e.target.value
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="Paste image URLs, separated by commas"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      The backend field is ready for multiple carton photo
                      URLs. Actual file-storage upload can be connected to
                      your existing upload provider separately.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Challan Photo URL
                    </label>
                    <input
                      type="text"
                      value={challanPhoto}
                      onChange={(e) =>
                        setChallanPhoto(e.target.value)
                      }
                      placeholder="Paste challan image URL"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Dispatch Notes
                    </label>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional dispatch instructions or notes..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/90 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleCreateDispatch()}
                  disabled={
                    !activeItem ||
                    dispatchableQuantity <= 0 ||
                    quantity <= 0 ||
                    quantity > dispatchableQuantity
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172B6B] px-7 text-sm font-bold text-white shadow-sm hover:bg-[#20398F] disabled:cursor-not-allowed disabled:opacity-50"
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
