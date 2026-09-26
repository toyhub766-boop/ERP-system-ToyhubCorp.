import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";

import { getBOMs } from "../../bom/services/bom.service";

import {
  getProductions,
  getCRMOrders,
  calculateProduction,
  getMaterialConsumption,
  updateProductionItem,
} from "../services/production.services";

import ProductionProgressModal from "../components/ProductionProgressModal";
import ProductionCompletionModal from "../components/ProductionCompletionModal";

import { exportCapacityExcel } from "../../../utils/exportCapacityExcel";
import { exportCapacityPdf } from "../../../utils/exportCapacityPdf";
import { exportProductionReceiptPdf } from "../../../utils/exportProductionReceiptPdf";

import {
  FiBox,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiImage,
  FiInfo,
  FiLayers,
  FiMaximize2,
  FiPackage,
  FiTruck,
  FiX,
} from "react-icons/fi";

const PRODUCTION_CHECKLIST = [
  "Assembly",
  "Packaging",
];

const ProductionPage = () => {
  const [productions, setProductions] =
    useState<any[]>([]);

  const [crmOrders, setCrmOrders] =
    useState<any[]>([]);

  const [boms, setBoms] =
    useState<any[]>([]);

  const [selectedProduction, setSelectedProduction] =
    useState<any>(null);

  const [selectedItemIndex, setSelectedItemIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<"orders" | "calculator">(
      "orders"
    );

  const [showProgressModal, setShowProgressModal] =
    useState(false);

  const [showCompletionModal, setShowCompletionModal] =
    useState(false);

  const [calculatorBOM, setCalculatorBOM] =
    useState("");

  const [calculatorQuantity, setCalculatorQuantity] =
    useState(1);

  const [calculatorResult, setCalculatorResult] =
    useState<any>(null);

  const [actualQuantityDraft, setActualQuantityDraft] = useState(0);
  const [existingStockDraft, setExistingStockDraft] = useState(0);
  const [readyQuantityDraft, setReadyQuantityDraft] = useState(0);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: false,
    fulfilment: false,
    productInformation: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const [, setMaterialConsumption] =
    useState<any[]>([]);

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  const [savingItem, setSavingItem] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        productionData,
        bomData,
        crmOrderData,
      ] = await Promise.all([
        getProductions(),
        getBOMs(),
        getCRMOrders(),
      ]);

      const safeProductions =
        Array.isArray(productionData)
          ? productionData
          : [];

      const safeBOMs =
        Array.isArray(bomData)
          ? bomData
          : [];

      const safeCRMOrders =
        Array.isArray(crmOrderData)
          ? crmOrderData
          : [];

      setProductions(
        safeProductions
      );

      setBoms(
        safeBOMs
      );

      setCrmOrders(
        safeCRMOrders
      );

      if (
        safeProductions.length > 0
      ) {
        setSelectedProduction(
          (current: any) => {
            if (!current) {
              return safeProductions[0];
            }

            return (
              safeProductions.find(
                (item: any) =>
                  item._id ===
                  current._id
              ) ||
              safeProductions[0]
            );
          }
        );
      } else {
        setSelectedProduction(
          null
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load production data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /*
  |--------------------------------------------------------------------------
  | MATERIAL CONSUMPTION
  |--------------------------------------------------------------------------
  */

  const loadConsumption = useCallback(async (
    productionId: string
  ) => {
    try {
      const data =
        await getMaterialConsumption(
          productionId
        );

      setMaterialConsumption(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      setMaterialConsumption([]);
    }
  }, []);

  useEffect(() => {
    if (
      !selectedProduction?._id
    ) {
      setMaterialConsumption([]);

      return;
    }

    void loadConsumption(selectedProduction._id);
  }, [loadConsumption, selectedProduction?._id]);

  /*
  |--------------------------------------------------------------------------
  | SELECTED PRODUCT
  |--------------------------------------------------------------------------
  */

  const selectedItem =
    selectedProduction?.items?.[
      selectedItemIndex
    ] || null;

  useEffect(() => {
    if (!selectedItem) {
      setActualQuantityDraft(0);
      setExistingStockDraft(0);
      setReadyQuantityDraft(0);
      return;
    }

    setActualQuantityDraft(Math.max(0, Number(selectedItem.actualQuantity) || 0));
    setExistingStockDraft(Math.max(0, Number(selectedItem.existingStockQuantity) || 0));
    setReadyQuantityDraft(Math.max(0, Number(selectedItem.readyForDispatchQuantity) || 0));
  }, [selectedItem?._id]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCT IMAGE
  |--------------------------------------------------------------------------
  |
  | Production order stores an image snapshot.
  | Fallback to populated product.image if available.
  |
  */

  const getItemImage = (
    item: any
  ) => {
    return (
      item?.image ||
      item?.catalogueProduct?.image ||
      item?.product?.image ||
      ""
    );
  };

  const getItemName = (
    item: any,
    index = 0
  ) => {
    return (
      item?.catalogueProduct?.name ||
      item?.product?.name ||
      item?.productName ||
      `Product ${index + 1}`
    );
  };

  const getItemMarka = (
    item: any
  ) => {
    return (
      item?.marka ||
      item?.catalogueProduct?.marka ||
      item?.product?.marka ||
      item?.product?.brand ||
      ""
    );
  };

  const getItemSku = (
    item: any
  ) => {
    return (
      item?.catalogueProduct?.modelNumber ||
      item?.product?.sku ||
      item?.sku ||
      ""
    );
  };

  const getItemCategory = (
    item: any
  ) => {
    const category =
      item?.category ||
      item?.catalogueProduct?.category ||
      item?.product?.category;

    if (
      typeof category ===
      "object"
    ) {
      return (
        category?.name ||
        ""
      );
    }

    return category || "";
  };

  /*
  |--------------------------------------------------------------------------
  | PRODUCTION AVAILABILITY
  |--------------------------------------------------------------------------
  */

  const [
    selectedAvailability,
    setSelectedAvailability,
  ] = useState<any>(null);

  useEffect(() => {
    const calculate = async () => {
      if (
        isTradingItem(selectedItem) ||
        !selectedItem?.bom ||
        !selectedItem?.quantity
      ) {
        setSelectedAvailability(
          null
        );

        return;
      }

      try {
        const result =
          await calculateProduction({
            bom:
              selectedItem.bom._id ||
              selectedItem.bom,

            quantity:
              Number(
                selectedItem.quantity
              ),

            materialSelections:
              selectedItem.materialSelections ||
              [],
          });

        setSelectedAvailability(
          result
        );
      } catch (error) {
        console.error(error);

        setSelectedAvailability(
          null
        );
      }
    };

    void calculate();
  }, [
    selectedProduction?._id,
    selectedItemIndex,
    selectedItem?.bom,
    selectedItem?.quantity,
    selectedItem?.materialSelections,
  ]);

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const refreshSelectedProduction = useCallback(async () => {
    await loadData();
  }, [loadData]);

  /*
  |--------------------------------------------------------------------------
  | CALCULATOR
  |--------------------------------------------------------------------------
  */

  const handleCalculate =
    async () => {
      if (!calculatorBOM) {
        alert(
          "Select a BOM."
        );

        return;
      }

      if (
        !calculatorQuantity ||
        calculatorQuantity <= 0
      ) {
        alert(
          "Enter a valid quantity."
        );

        return;
      }

      try {
        const result =
          await calculateProduction({
            bom:
              calculatorBOM,

            quantity:
              Number(
                calculatorQuantity
              ),
          });

        setCalculatorResult(
          result
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to calculate production capacity."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | EXPORTS
  |--------------------------------------------------------------------------
  */

  const handleExportExcel =
    () => {
      if (!calculatorResult) {
        alert(
          "Calculate capacity first."
        );

        return;
      }

      const selectedBOM =
        boms.find(
          (bom: any) =>
            bom._id ===
            calculatorBOM
        );

      exportCapacityExcel(
        calculatorResult,

        selectedBOM
          ?.finishedProduct
          ?.name ||
          "Production",

        Number(
          calculatorQuantity
        ),

        "Production_Capacity"
      );
    };

  const handleExportPdf =
    () => {
      if (!calculatorResult) {
        alert(
          "Calculate capacity first."
        );

        return;
      }

      const selectedBOM =
        boms.find(
          (bom: any) =>
            bom._id ===
            calculatorBOM
        );

      exportCapacityPdf(
        calculatorResult,

        selectedBOM
          ?.finishedProduct
          ?.name ||
          "Production",

        Number(
          calculatorQuantity
        ),

        "Production Capacity Report"
      );
    };

  const handleExportReceipt =
    () => {
      if (!selectedProduction) {
        alert(
          "Select a production order first."
        );

        return;
      }

      exportProductionReceiptPdf(
        selectedProduction
      );
    };

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(
    () => ({
      total:
        productions.length,

      active:
        productions.filter(
          (production) =>
            production.status ===
              "Started" ||
            production.status ===
              "In Progress"
        ).length,

      completed:
        productions.filter(
          (production) =>
            production.status ===
            "Completed"
        ).length,

      drafts:
        productions.filter(
          (production) =>
            production.status ===
            "Draft"
        ).length,

      ready:
        productions.filter((production) =>
          production.items?.some(
            (item: any) =>
              Boolean(item?.readyForDispatch) ||
              Math.max(
                0,
                Number(item?.readyForDispatchQuantity) || 0
              ) > 0
          )
        ).length,
    }),
    [productions]
  );

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  const getStatusClass =
    (
      status: string
    ) => {
      switch (status) {
        case "Completed":
          return "bg-emerald-50 text-emerald-700 border-emerald-100";

        case "In Progress":
        case "Started":
          return "bg-blue-50 text-blue-700 border-blue-100";

        case "Approved":
          return "bg-purple-50 text-purple-700 border-purple-100";

        case "Cancelled":
          return "bg-red-50 text-red-700 border-red-100";

        default:
          return "bg-orange-50 text-orange-700 border-orange-100";
      }
    };

  /*
  |--------------------------------------------------------------------------
  | PROGRESS
  |--------------------------------------------------------------------------
  */

  const getOrderedQuantity = (item: any) =>
    Math.max(0, Number(item?.quantity) || 0);

  const getActualQuantity = (item: any) =>
    Math.max(0, Number(item?.actualQuantity) || 0);

  const getExistingStockQuantity = (item: any) =>
    Math.max(
      0,
      Number(item?.existingStockQuantity) || 0
    );

  const getTotalAvailableQuantity = (item: any) => {
    return (
      getActualQuantity(item) +
      getExistingStockQuantity(item)
    );
  };

  const getFulfilledQuantity = (item: any) => {
    return Math.min(
      getOrderedQuantity(item),
      getTotalAvailableQuantity(item)
    );
  };

  const getRemainingQuantity = (item: any) => {
    return Math.max(
      0,
      getOrderedQuantity(item) -
        getFulfilledQuantity(item)
    );
  };

  const getReadyForDispatchQuantity = (item: any) =>
    Math.max(
      0,
      Number(item?.readyForDispatchQuantity) || 0
    );

  const getItemProgress = (item: any) => {
    const quantity = getOrderedQuantity(item);
    const fulfilled = getFulfilledQuantity(item);

    if (item?.completed && quantity > 0) {
      return 100;
    }

    if (quantity <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((fulfilled / quantity) * 100)
    );
  };

  const getProductType = (item: any) => {
    const type =
      item?.catalogueProduct?.productType;

    if (type === "TRADING") {
      return "TRADING";
    }

    if (type === "MANUFACTURING") {
      return "MANUFACTURING";
    }

    return item?.bom ? "MANUFACTURING" : "TRADING";
  };

  const isTradingItem = (item: any) =>
    getProductType(item) === "TRADING";

  const getBomName = (item: any) => {
    if (!item?.bom) {
      return isTradingItem(item)
        ? "No BOM — Trading Product"
        : "No BOM assigned";
    }

    return (
      item.bom?.name ||
      item.bom?.finishedProduct?.name ||
      item.bom?.finishedProduct?.modelNumber ||
      "Assigned BOM"
    );
  };

  const getBomMaterials = (item: any) => {
    if (!item?.bom) {
      return [];
    }

    return Array.isArray(item.bom?.materials)
      ? item.bom.materials
      : [];
  };

  /*
   * CRM ORDER RESOLUTION
   *
   * Do not rely only on production.crmOrder being populated.
   * Production records are linked in both directions:
   *
   *   Production.crmOrder -> Order._id
   *   Order.production   -> Production._id
   *
   * The Production page therefore resolves the complete CRM Order
   * from the separately fetched /orders response as a fallback.
   */
  const getCrmOrder = (production: any) => {
    if (!production) {
      return null;
    }

    const linkedCrmOrder =
      production.crmOrder;

    // Best case: backend already populated crmOrder.
    if (
      linkedCrmOrder &&
      typeof linkedCrmOrder === "object"
    ) {
      return linkedCrmOrder;
    }

    const crmOrderId =
      typeof linkedCrmOrder === "string"
        ? linkedCrmOrder
        : linkedCrmOrder?._id;

    // Match through Production.crmOrder -> Order._id.
    if (crmOrderId) {
      const byId = crmOrders.find(
        (order: any) =>
          String(order?._id) ===
          String(crmOrderId)
      );

      if (byId) {
        return byId;
      }
    }

    // Match through Order.production -> Production._id.
    const byProduction = crmOrders.find(
      (order: any) => {
        const productionId =
          typeof order?.production === "object"
            ? order.production?._id
            : order?.production;

        return (
          productionId &&
          String(productionId) ===
            String(production._id)
        );
      }
    );

    return byProduction || null;
  };

  const getCrmOrderNumber = (production: any) => {
    const order = getCrmOrder(production);

    return (
      order?.orderNumber ||
      production?.orderNumber ||
      "-"
    );
  };

  const getCrmOrderValue = (production: any) => {
    const value = Number(
      getCrmOrder(production)?.totalAmount
    );

    return Number.isFinite(value) ? value : null;
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) {
      return "-";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSaveItemQuantities = async (
    item: any,
    patch: {
      actualQuantity?: number;
      existingStockQuantity?: number;
      readyForDispatchQuantity?: number;
      readyForDispatch?: boolean;
    }
  ) => {
    if (!selectedProduction?._id || !item?._id) {
      return;
    }

    try {
      setSavingItem(true);

      await updateProductionItem(
        selectedProduction._id,
        item._id,
        patch
      );

      await refreshSelectedProduction();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to update production item."
      );
    } finally {
      setSavingItem(false);
    }
  };

  const handleChecklistToggle = async (
    item: any,
    step: string
  ) => {
    if (
      !selectedProduction?._id ||
      !item?._id
    ) {
      return;
    }

    const currentPreparing =
      Array.isArray(
        item?.checklist?.preparing
      )
        ? item.checklist.preparing
        : [];

    const completed =
      currentPreparing.includes(step);

    const nextPreparing = completed
      ? currentPreparing.filter(
          (value: string) =>
            value !== step
        )
      : [
          ...currentPreparing,
          step,
        ];

    try {
      setSavingItem(true);

      await updateProductionItem(
        selectedProduction._id,
        item._id,
        {
          checklist: {
            preparing:
              nextPreparing,
            leaving:
              Array.isArray(
                item?.checklist?.leaving
              )
                ? item.checklist.leaving
                : [],
            reason:
              item?.checklist?.reason ||
              "",
          },
        }
      );

      await refreshSelectedProduction();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to update checklist."
      );
    } finally {
      setSavingItem(false);
    }
  };


  const selectedOrdered =
    getOrderedQuantity(selectedItem);

  const selectedActual =
    getActualQuantity(selectedItem);

  const selectedExistingStock =
    getExistingStockQuantity(selectedItem);

  const selectedAvailable =
    getTotalAvailableQuantity(selectedItem);

  const selectedFulfilled =
    getFulfilledQuantity(selectedItem);

  const selectedRemaining =
    getRemainingQuantity(selectedItem);

  const selectedReady =
    getReadyForDispatchQuantity(selectedItem);

  const selectedBomMaterials =
    getBomMaterials(selectedItem);

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#17357A]">
              Admin / Production
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Production Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Production execution, progress and completion tracking
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
            <FiPackage size={14} />

            <span>
              {productions.length} production{" "}
              {productions.length === 1
                ? "order"
                : "orders"}
            </span>
          </div>

        </div>

        {/* TABS */}

        <div className="mb-5 flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "orders"
              )
            }
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
              activeTab ===
              "orders"
                ? "bg-[#17357A] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Production Orders
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "calculator"
              )
            }
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
              activeTab ===
              "calculator"
                ? "bg-[#17357A] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Capacity Calculator
          </button>

        </div>

        {/* PRODUCTION OVERVIEW — COLLAPSED BY DEFAULT */}

        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("overview")}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
            aria-expanded={expandedSections.overview}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#17357A]"><FiLayers size={15} /></div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">Production Overview</p>
                <p className="truncate text-[10px] text-slate-400">{stats.total} orders · {stats.active} active · {stats.completed} completed · {stats.ready} ready</p>
              </div>
            </div>
            {expandedSections.overview ? <FiChevronUp size={16} className="shrink-0 text-slate-400" /> : <FiChevronDown size={16} className="shrink-0 text-slate-400" />}
          </button>

          {expandedSections.overview && (
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Orders</p><FiLayers size={16} className="text-slate-400" /></div><p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Active</p><FiClock size={16} className="text-blue-600" /></div><p className="mt-2 text-3xl font-bold text-blue-700">{stats.active}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Completed</p><FiCheckCircle size={16} className="text-emerald-600" /></div><p className="mt-2 text-3xl font-bold text-emerald-600">{stats.completed}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Draft Orders</p><FiClock size={16} className="text-orange-500" /></div><p className="mt-2 text-3xl font-bold text-orange-600">{stats.drafts}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ready</p><FiTruck size={16} className="text-emerald-600" /></div><p className="mt-2 text-3xl font-bold text-emerald-600">{stats.ready}</p></div>
            </div>
          )}
        </div>

        {/* ORDERS */}

        {activeTab ===
          "orders" && (
          <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_390px]">

            {/* ORDER LIST */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="font-bold text-slate-900">
                      Production Orders
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Select an order to inspect
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {productions.length}
                  </span>

                </div>

              </div>

              <div className="max-h-[calc(100vh-320px)] overflow-y-auto">

                {loading ? (
                  <div className="p-6 text-sm text-slate-500">
                    Loading production orders...
                  </div>
                ) : productions.length ===
                  0 ? (
                  <div className="p-8 text-center">

                    <FiPackage
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No production orders
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Orders created from CRM will appear here.
                    </p>

                  </div>
                ) : (
                  productions.map(
                    (
                      production
                    ) => {
                      const isSelected =
                        selectedProduction?._id ===
                        production._id;

                      const client =
                        production.client;

                      const firstItem =
                        production.items?.[0];

                      const image =
                        getItemImage(
                          firstItem
                        );

                      const itemCount =
                        production
                          .items
                          ?.length ||
                        0;

                      return (
                        <button
                          type="button"
                          key={
                            production._id
                          }
                          onClick={() => {
                            setSelectedProduction(
                              production
                            );

                            setSelectedItemIndex(
                              0
                            );
                          }}
                          className={`group w-full border-b border-slate-100 p-3 text-left transition ${
                            isSelected
                              ? "bg-blue-50/70"
                              : "hover:bg-slate-50"
                          }`}
                        >

                          <div className="flex gap-3">

                            {/* THUMBNAIL */}

                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">

                              {image ? (
                                <img
                                  src={
                                    image
                                  }
                                  alt={getItemName(
                                    firstItem
                                  )}
                                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-300">
                                  <FiImage
                                    size={20}
                                  />
                                </div>
                              )}

                            </div>

                            {/* ORDER INFO */}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-bold text-slate-900">
                                    {
                                      production.orderNumber
                                    }
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-slate-500">
                                    {client?.name ||
                                      client?.companyName ||
                                      client?.firmName ||
                                      "No client"}
                                  </p>

                                </div>

                                <span
                                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${getStatusClass(
                                    production.status
                                  )}`}
                                >
                                  {
                                    production.status
                                  }
                                </span>

                              </div>

                              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">

                                <span>
                                  {itemCount}{" "}
                                  product
                                  {itemCount ===
                                  1
                                    ? ""
                                    : "s"}
                                </span>

                                <span>
                                  {production.targetDate
                                    ? new Date(
                                        production.targetDate
                                      ).toLocaleDateString(
                                        "en-IN"
                                      )
                                    : "-"}
                                </span>

                              </div>

                            </div>

                          </div>

                        </button>
                      );
                    }
                  )
                )}

              </div>

            </div>

            {/* ORDER INFORMATION */}

            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {!selectedProduction ? (
                <div className="flex min-h-[550px] flex-col items-center justify-center p-8 text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#17357A]">
                    <FiPackage
                      size={28}
                    />
                  </div>

                  <p className="mt-4 font-semibold text-slate-800">
                    Select a production order
                  </p>

                  <p className="mt-1 max-w-xs text-sm text-slate-400">
                    Product information, photographs and production details will appear here.
                  </p>

                </div>
              ) : (
                <>

                  {/* ORDER HEADER */}

                  <div className="border-b border-slate-100 p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#17357A]">
                          Production Order
                        </p>

                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                          {
                            selectedProduction.orderNumber
                          }
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                          Created{" "}
                          {selectedProduction.createdAt
                            ? new Date(
                                selectedProduction.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </p>

                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                          selectedProduction.status
                        )}`}
                      >
                        {
                          selectedProduction.status
                        }
                      </span>

                    </div>

                  </div>

                  {/* CLIENT / SCHEDULE */}

                  <div className="grid gap-4 border-b border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Client
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          selectedProduction
                            .client?.name ||
                          selectedProduction
                            .client
                            ?.companyName ||
                          selectedProduction
                            .client?.firmName ||
                          "-"
                        }
                      </p>

                      {selectedProduction
                        .client
                        ?.contactPerson && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {
                            selectedProduction
                              .client
                              .contactPerson
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Production Team
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          selectedProduction.team ||
                          "Unassigned"
                        }
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        <FiCalendar
                          size={11}
                        />
                        Target Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedProduction.targetDate
                          ? new Date(
                              selectedProduction.targetDate
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        <FiTruck
                          size={11}
                        />
                        Transport
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          selectedProduction.transport ||
                          "-"
                        }
                      </p>
                    </div>

                  </div>

                  {/* SOURCE CRM ORDER */}

                  <div className="border-b border-slate-100 p-5">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
                            Source CRM Order
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {getCrmOrderNumber(
                              selectedProduction
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Complete originating CRM order loaded from CRM.
                          </p>
                        </div>

                        <div className="rounded-lg bg-white px-3 py-2 text-right shadow-sm">
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                            Order Value
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {formatCurrency(
                              getCrmOrderValue(
                                selectedProduction
                              )
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                        <span className="rounded-full border border-blue-100 bg-white px-2.5 py-1 font-semibold text-slate-600">
                          {selectedProduction.items?.length || 0} items
                        </span>

                        {getCrmOrder(
                          selectedProduction
                        )?.status && (
                          <span className="rounded-full border border-blue-100 bg-white px-2.5 py-1 font-semibold text-slate-600">
                            CRM:{" "}
                            {
                              getCrmOrder(
                                selectedProduction
                              ).status
                            }
                          </span>
                        )}

                        {getCrmOrder(
                          selectedProduction
                        )?.customer && (
                          <span className="rounded-full border border-blue-100 bg-white px-2.5 py-1 font-semibold text-slate-600">
                            Customer:{" "}
                            {typeof getCrmOrder(
                              selectedProduction
                            ).customer === "object"
                              ? getCrmOrder(
                                  selectedProduction
                                ).customer?.name ||
                                getCrmOrder(
                                  selectedProduction
                                ).customer?.companyName ||
                                "-"
                              : "-"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ORDER PRODUCTS */}

                  <div className="p-5">

                    <div className="mb-3 flex items-center justify-between">

                      <div>
                        <h3 className="font-bold text-slate-900">
                          Products
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Select a product to inspect its production details
                        </p>
                      </div>

                      <span className="text-xs font-medium text-slate-400">
                        {
                          selectedProduction
                            .items
                            ?.length ||
                          0
                        }
                      </span>

                    </div>

                    <div className="space-y-2">

                      {selectedProduction.items?.map(
                        (
                          item: any,
                          index: number
                        ) => {
                          const image =
                            getItemImage(
                              item
                            );

                          const progress =
                            getItemProgress(
                              item
                            );

                          const name =
                            getItemName(
                              item,
                              index
                            );

                          return (
                            <button
                              type="button"
                              key={
                                item._id ||
                                index
                              }
                              onClick={() =>
                                setSelectedItemIndex(
                                  index
                                )
                              }
                              className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                                selectedItemIndex ===
                                index
                                  ? "border-blue-300 bg-blue-50/70 shadow-sm"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >

                              {/* PRODUCT IMAGE */}

                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">

                                {image ? (
                                  <img
                                    src={
                                      image
                                    }
                                    alt={
                                      name
                                    }
                                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                                    <FiImage
                                      size={20}
                                    />
                                  </div>
                                )}

                              </div>

                              {/* PRODUCT INFO */}

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-3">

                                  <div className="min-w-0">

                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {
                                        name
                                      }
                                    </p>

                                    {getItemMarka(
                                      item
                                    ) && (
                                      <p className="mt-0.5 text-xs text-slate-500">
                                        {
                                          getItemMarka(
                                            item
                                          )
                                        }
                                      </p>
                                    )}

                                  </div>

                                  <div className="shrink-0 text-right">
                                    <p className="text-xs font-semibold text-slate-700">
                                      {getFulfilledQuantity(item)} /{" "}
                                      {getOrderedQuantity(item)}
                                    </p>

                                    <p className="text-[9px] text-slate-400">
                                      fulfilled
                                    </p>
                                  </div>

                                </div>

                                <div className="mt-2 flex items-center gap-3">

                                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">

                                    <div
                                      className="h-full rounded-full bg-[#17357A] transition-all"
                                      style={{
                                        width: `${progress}%`,
                                      }}
                                    />

                                  </div>

                                  <span className="w-9 text-right text-[10px] font-semibold text-slate-500">
                                    {
                                      progress
                                    }
                                    %
                                  </span>

                                </div>

                              </div>

                              <FiChevronRight
                                size={16}
                                className="shrink-0 text-slate-300"
                              />

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 p-4">

                    {selectedProduction.status !==
                      "In Progress" &&
                      selectedProduction.status !==
                        "Completed" && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowProgressModal(
                              true
                            )
                          }
                          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                        >
                          Mark In Progress
                        </button>
                      )}

                    {selectedProduction.status ===
                      "In Progress" && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowCompletionModal(
                            true
                          )
                        }
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Complete Production
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleExportReceipt
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      Export Receipt
                    </button>

                  </div>

                </>
              )}

            </div>

            {/* WORK AREA — WORKING SCREEN FIRST */}

            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {!selectedItem ? (
                <div className="flex min-h-[550px] items-center justify-center p-6 text-sm text-slate-500">
                  Select a product.
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="border-b border-slate-100 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {getItemImage(selectedItem) ? (
                          <img src={getItemImage(selectedItem)} alt={getItemName(selectedItem)} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300"><FiImage size={18} /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#17357A]">Working on</p>
                        <p className="truncate text-base font-bold text-slate-900">{getItemName(selectedItem)}</p>
                        <p className="truncate text-[10px] text-slate-400">
                          {getItemMarka(selectedItem) ? `Marka: ${getItemMarka(selectedItem)}` : getItemSku(selectedItem) ? `Model: ${getItemSku(selectedItem)}` : "Production item"}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-right">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-500">Ordered</p>
                        <p className="text-lg font-bold text-[#17357A]">{selectedOrdered}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    {/* CHECKLIST */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Step 1</p>
                          <h3 className="mt-1 text-base font-bold text-slate-900">Production Checklist</h3>
                          <p className="mt-1 text-xs text-slate-500">Tick each step when it is finished. Changes save automatically.</p>
                        </div>
                        <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700">
                          {PRODUCTION_CHECKLIST.filter((step) => selectedItem?.checklist?.preparing?.includes(step)).length} / {PRODUCTION_CHECKLIST.length} done
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {PRODUCTION_CHECKLIST.map((step) => {
                          const checked = selectedItem?.checklist?.preparing?.includes(step);
                          return (
                            <label key={step} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${checked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`}>
                              <input type="checkbox" checked={Boolean(checked)} disabled={savingItem} onChange={() => handleChecklistToggle(selectedItem, step)} className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                              <div className="min-w-0">
                                <p className={`text-sm font-semibold ${checked ? "text-emerald-800" : "text-slate-800"}`}>{step}</p>
                                <p className="text-[10px] text-slate-400">{checked ? "Completed" : "Not completed yet"}</p>
                              </div>
                              {checked && <FiCheckCircle size={18} className="ml-auto shrink-0 text-emerald-600" />}
                            </label>
                          );
                        })}
                      </div>
                      {selectedItem?.checklist?.leaving?.length > 0 && (
                        <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-3">
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-orange-500">Issues / Left Behind</p>
                          <p className="mt-1 text-xs text-orange-800">{selectedItem.checklist.leaving.join(", ")}</p>
                          {selectedItem?.checklist?.reason && <p className="mt-1 text-[10px] text-orange-700">Reason: {selectedItem.checklist.reason}</p>}
                        </div>
                      )}
                    </div>

                    {/* QUANTITY UPDATE */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Production Quantity Update</p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">Enter actual production and existing finished stock. The original CRM ordered quantity never changes.</p>
                        </div>
                        {savingItem && <span className="text-[10px] font-semibold text-[#17357A]">Saving...</span>}
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Actual Produced</span>
                          <input type="number" min="0" max={selectedOrdered} value={actualQuantityDraft} disabled={savingItem} onChange={(event) => {
                            const raw = event.target.value;
                            const value = raw === "" ? 0 : Math.max(0, Math.min(selectedOrdered, Number(raw) || 0));
                            setActualQuantityDraft(value);
                            const available = Math.min(selectedOrdered, value + existingStockDraft);
                            if (readyQuantityDraft > available) setReadyQuantityDraft(available);
                          }} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#17357A]" />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Existing Finished Stock</span>
                          <input type="number" min="0" max={Math.max(0, selectedOrdered - actualQuantityDraft)} value={existingStockDraft} disabled={savingItem} onChange={(event) => {
                            const raw = event.target.value;
                            const maxStock = Math.max(0, selectedOrdered - actualQuantityDraft);
                            const value = raw === "" ? 0 : Math.max(0, Math.min(maxStock, Number(raw) || 0));
                            setExistingStockDraft(value);
                            const available = Math.min(selectedOrdered, actualQuantityDraft + value);
                            if (readyQuantityDraft > available) setReadyQuantityDraft(available);
                          }} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#17357A]" />
                        </label>
                      </div>

                      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                        <div className="flex items-center justify-between"><span>Total available</span><strong>{Math.min(selectedOrdered, actualQuantityDraft + existingStockDraft)}</strong></div>
                        <div className="mt-1 flex items-center justify-between"><span>Remaining to fulfil</span><strong>{Math.max(0, selectedOrdered - Math.min(selectedOrdered, actualQuantityDraft + existingStockDraft))}</strong></div>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <label className="block">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ready Quantity for Dispatch</span>
                          <input type="number" min="0" max={Math.min(selectedOrdered, actualQuantityDraft + existingStockDraft)} value={readyQuantityDraft} disabled={savingItem} onChange={(event) => {
                            const available = Math.min(selectedOrdered, actualQuantityDraft + existingStockDraft);
                            const raw = event.target.value;
                            const value = raw === "" ? 0 : Math.max(0, Math.min(available, Number(raw) || 0));
                            setReadyQuantityDraft(value);
                          }} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#17357A]" />
                        </label>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" disabled={savingItem} onClick={() => setReadyQuantityDraft(Math.min(selectedOrdered, actualQuantityDraft + existingStockDraft))} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 disabled:opacity-50">Mark All Available Ready</button>
                          <button type="button" disabled={savingItem} onClick={() => {
                            const available = Math.min(selectedOrdered, actualQuantityDraft + existingStockDraft);
                            const ready = Math.min(Math.max(0, readyQuantityDraft), available);
                            void handleSaveItemQuantities(selectedItem, { actualQuantity: actualQuantityDraft, existingStockQuantity: existingStockDraft, readyForDispatchQuantity: ready, readyForDispatch: ready > 0 });
                          }} className="rounded-xl bg-[#17357A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{savingItem ? "Saving..." : "Save Quantity"}</button>
                        </div>
                        <p className="mt-2 text-[10px] leading-4 text-slate-400">Ready quantity is the amount Production hands to Dispatch. It may be less than the total available quantity.</p>
                      </div>
                    </div>
                  </div>

                  {/* COLLAPSIBLE FULFILMENT */}
                  <div className="border-t border-slate-100">
                    <button type="button" onClick={() => toggleSection("fulfilment")} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50" aria-expanded={expandedSections.fulfilment}>
                      <div className="flex min-w-0 items-center gap-3"><FiTruck size={15} className="shrink-0 text-emerald-600" /><div className="min-w-0"><p className="text-xs font-bold text-slate-800">Fulfilment & Dispatch</p><p className="truncate text-[10px] text-slate-400">Ordered {selectedOrdered} · Available {selectedAvailable} · Remaining {selectedRemaining} · Ready {selectedReady}</p></div></div>
                      <div className="flex shrink-0 items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${selectedReady > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{selectedReady > 0 ? "Ready" : "Not Ready"}</span>{expandedSections.fulfilment ? <FiChevronUp size={15} className="text-slate-400" /> : <FiChevronDown size={15} className="text-slate-400" />}</div>
                    </button>
                    {expandedSections.fulfilment && <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 p-4"><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Ordered</p><p className="mt-1 text-sm font-bold">{selectedOrdered}</p></div><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Fulfilled</p><p className="mt-1 text-sm font-bold">{selectedFulfilled}</p></div><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Remaining</p><p className="mt-1 text-sm font-bold text-orange-700">{selectedRemaining}</p></div><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Ready for Dispatch</p><p className="mt-1 text-sm font-bold text-emerald-700">{selectedReady}</p></div></div>}
                  </div>

                  {/* COLLAPSIBLE PRODUCT INFORMATION */}
                  <div className="border-t border-slate-100">
                    <button type="button" onClick={() => toggleSection("productInformation")} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50" aria-expanded={expandedSections.productInformation}>
                      <div className="flex min-w-0 items-center gap-3"><FiInfo size={15} className="shrink-0 text-slate-500" /><div className="min-w-0"><p className="text-xs font-bold text-slate-800">Product Information</p><p className="truncate text-[10px] text-slate-400">Photo, model, category, BOM, capacity and material availability</p></div></div>
                      {expandedSections.productInformation ? <FiChevronUp size={15} className="text-slate-400" /> : <FiChevronDown size={15} className="text-slate-400" />}
                    </button>
                    {expandedSections.productInformation && (
                      <div className="space-y-4 border-t border-slate-100 p-4">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                          {getItemImage(selectedItem) ? <button type="button" onClick={() => setPreviewImage(getItemImage(selectedItem))} className="group relative h-full w-full"><img src={getItemImage(selectedItem)} alt={getItemName(selectedItem)} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/70 to-transparent p-4 pt-12"><div className="text-left text-white"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Selected Product</p><p className="mt-1 text-lg font-bold">{getItemName(selectedItem)}</p></div><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm"><FiMaximize2 size={16} /></span></div></button> : <div className="flex h-full flex-col items-center justify-center text-slate-300"><FiImage size={42} /><p className="mt-3 text-xs font-medium text-slate-400">No product photo available</p></div>}
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#17357A]">Product</p><h3 className="mt-1 text-lg font-bold text-slate-900">{getItemName(selectedItem)}</h3>{getItemMarka(selectedItem) && <p className="mt-1 text-xs text-slate-500">Marka: <span className="font-semibold text-slate-700">{getItemMarka(selectedItem)}</span></p>}</div><div className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-right"><p className="text-[9px] uppercase tracking-wide text-blue-500">Quantity</p><p className="text-xl font-bold text-[#17357A]">{selectedOrdered}</p></div></div>
                          <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg bg-white p-3"><p className="text-[9px] uppercase tracking-wide text-slate-400">Actual Produced</p><p className="mt-1 text-sm font-bold">{selectedActual}</p></div><div className="rounded-lg bg-white p-3"><p className="text-[9px] uppercase tracking-wide text-slate-400">Existing Stock</p><p className="mt-1 text-sm font-bold text-emerald-700">{selectedExistingStock}</p></div><div className="rounded-lg bg-white p-3"><p className="text-[9px] uppercase tracking-wide text-slate-400">Available</p><p className="mt-1 text-sm font-bold text-purple-700">{selectedAvailable}</p></div><div className="rounded-lg bg-white p-3"><p className="text-[9px] uppercase tracking-wide text-slate-400">Remaining</p><p className="mt-1 text-sm font-bold text-orange-700">{selectedRemaining}</p></div>{getItemSku(selectedItem) && <div className="rounded-lg bg-white p-3"><p className="text-[9px] uppercase tracking-wide text-slate-400">Model / SKU</p><p className="mt-1 truncate text-xs font-semibold">{getItemSku(selectedItem)}</p></div>}{getItemCategory(selectedItem) && <div className="rounded-lg bg-white p-3"><p className="text-[9px] uppercase tracking-wide text-slate-400">Category</p><p className="mt-1 truncate text-xs font-semibold">{getItemCategory(selectedItem)}</p></div>}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-[#17357A]"><FiLayers size={15} /></div><div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Product Type</p><p className="text-sm font-semibold text-slate-800">{isTradingItem(selectedItem) ? "Trading Product" : "Manufactured Product"}</p></div></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${isTradingItem(selectedItem) ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-700"}`}>{isTradingItem(selectedItem) ? "TRADING" : "MANUFACTURING"}</span></div>
                          <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Bill of Materials</p><p className="mt-1 text-sm font-semibold text-slate-800">{getBomName(selectedItem)}</p>{!isTradingItem(selectedItem) && selectedBomMaterials.length > 0 && <div className="mt-3 space-y-2">{selectedBomMaterials.map((material: any, index: number) => <div key={material?._id || material?.product?._id || index} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span className="truncate text-xs font-semibold text-slate-700">{material?.product?.name || material?.product?.sku || material?.productName || "Material"}</span><span className="text-xs font-bold text-slate-600">{material?.quantity ?? "-"}</span></div>)}</div>}</div>
                          <div className="mt-4 border-t border-slate-100 pt-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Production Capacity</p>{!selectedItem.bom ? <p className="mt-2 text-xs text-slate-500">Not applicable without a BOM.</p> : <><p className="mt-1 text-2xl font-bold">{selectedAvailability?.maximumProducible ?? "-"}</p><p className="text-[10px] text-slate-400">maximum producible</p></>}</div><FiBox size={18} className="text-slate-300" /></div>{selectedAvailability?.bottleneck && <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">Bottleneck</p><p className="mt-1 text-sm font-bold text-orange-800">{selectedAvailability.bottleneck}</p></div>}</div>
                          <div className="mt-4 border-t border-slate-100 pt-4"><div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Material Availability</p><FiInfo size={14} className="text-slate-300" /></div>{!selectedItem.bom ? <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No material requirements for this Trading product.</div> : selectedAvailability?.materials?.length ? <div className="space-y-2">{selectedAvailability.materials.map((material: any, index: number) => <div key={index} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-medium text-slate-800">{material.product}</span><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${material.sufficient ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{material.sufficient ? "Available" : "Short"}</span></div><div className="mt-3 grid grid-cols-3 gap-2"><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Required</p><p className="mt-0.5 text-xs font-semibold">{material.required}</p></div><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Available</p><p className="mt-0.5 text-xs font-semibold">{material.available}</p></div><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Short</p><p className="mt-0.5 text-xs font-semibold text-red-600">{material.shortage}</p></div></div></div>)}</div> : <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No material calculation available.</div>}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* CAPACITY CALCULATOR */}

        {activeTab === "calculator" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Material Capacity Calculator
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Calculate production feasibility using current material availability.
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
              <select
                value={calculatorBOM}
                onChange={(event) => setCalculatorBOM(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#17357A]"
              >
                <option value="">Select BOM</option>
                {boms.map((bom: any) => (
                  <option key={bom._id} value={bom._id}>
                    {bom.finishedProduct?.name || bom.name || "BOM"}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={calculatorQuantity}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setCalculatorQuantity(
                    Number.isFinite(value) && value > 0 ? value : 1,
                  );
                }}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#17357A]"
                aria-label="Production quantity"
              />

              <button
                type="button"
                onClick={() => void handleCalculate()}
                className="rounded-xl bg-[#17357A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10295f]"
              >
                Calculate
              </button>
            </div>

            {calculatorResult && (
              <div className="mt-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Maximum Producible
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {calculatorResult.maximumProducible ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
                      Bottleneck
                    </p>
                    <p className="mt-2 text-lg font-bold text-orange-800">
                      {calculatorResult.bottleneck || "None"}
                    </p>
                  </div>
                </div>

                {Array.isArray(calculatorResult.materials) &&
                  calculatorResult.materials.length > 0 && (
                    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left">Material</th>
                            <th className="px-4 py-3 text-right">Required</th>
                            <th className="px-4 py-3 text-right">Available</th>
                            <th className="px-4 py-3 text-right">Shortage</th>
                            <th className="px-4 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculatorResult.materials.map(
                            (material: any, index: number) => (
                              <tr
                                key={material?._id || material?.product || index}
                                className="border-t border-slate-100"
                              >
                                <td className="px-4 py-3">
                                  {material?.product || "Material"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {material?.required ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {material?.available ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {material?.shortage ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs ${
                                      material?.sufficient
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {material?.sufficient
                                      ? "Sufficient"
                                      : "Shortage"}
                                  </span>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Export Excel
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* IMAGE PREVIEW */}

        {previewImage && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm md:p-8"
            onClick={() =>
              setPreviewImage(null)
            }
          >

            <button
              type="button"
              onClick={() =>
                setPreviewImage(null)
              }
              aria-label="Close image preview"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-xl transition hover:bg-slate-100 md:right-6 md:top-6"
            >
              <FiX
                size={19}
              />
            </button>

            <div
              className="relative flex max-h-[90vh] max-w-[1100px] items-center justify-center"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <img
                src={
                  previewImage
                }
                alt="Product Preview"
                className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />

            </div>

          </div>
        )}

        {/* PROGRESS MODAL */}

        <ProductionProgressModal
          open={
            showProgressModal
          }
          production={
            selectedProduction
          }
          onClose={() =>
            setShowProgressModal(
              false
            )
          }
          onSaved={
            refreshSelectedProduction
          }
        />

        {/* COMPLETION MODAL */}

        <ProductionCompletionModal
          open={
            showCompletionModal
          }
          production={
            selectedProduction
          }
          onClose={() =>
            setShowCompletionModal(
              false
            )
          }
          onSaved={
            refreshSelectedProduction
          }
        />

      </div>
    </AdminLayout>
  );
};

export default ProductionPage;