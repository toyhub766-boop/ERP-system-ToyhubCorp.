import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";

import { getBOMs } from "../../bom/services/bom.service";

import {
  getProductions,
  calculateProduction,
  getMaterialConsumption,
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
  FiClock,
  FiImage,
  FiInfo,
  FiLayers,
  FiMaximize2,
  FiPackage,
  FiTruck,
  FiX,
} from "react-icons/fi";

const ProductionPage = () => {
  const [productions, setProductions] =
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

  const [, setMaterialConsumption] =
    useState<any[]>([]);

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        productionData,
        bomData,
      ] = await Promise.all([
        getProductions(),
        getBOMs(),
      ]);

      const safeProductions =
        Array.isArray(productionData)
          ? productionData
          : [];

      const safeBOMs =
        Array.isArray(bomData)
          ? bomData
          : [];

      setProductions(
        safeProductions
      );

      setBoms(
        safeBOMs
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
  };

  useEffect(() => {
    loadData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | MATERIAL CONSUMPTION
  |--------------------------------------------------------------------------
  */

  const loadConsumption = async (
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
  };

  useEffect(() => {
    if (
      !selectedProduction?._id
    ) {
      setMaterialConsumption([]);

      return;
    }

    loadConsumption(
      selectedProduction._id
    );
  }, [
    selectedProduction?._id,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SELECTED PRODUCT
  |--------------------------------------------------------------------------
  */

  const selectedItem =
    selectedProduction?.items?.[
      selectedItemIndex
    ] || null;

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
      item?.product?.image ||
      ""
    );
  };

  const getItemName = (
    item: any,
    index = 0
  ) => {
    return (
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
      item?.product?.marka ||
      item?.product?.brand ||
      ""
    );
  };

  const getItemSku = (
    item: any
  ) => {
    return (
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

    calculate();
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

  const refreshSelectedProduction =
    async () => {
      await loadData();
    };

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

  const getItemProgress = (
    item: any
  ) => {
    const quantity =
      Number(
        item?.quantity
      ) || 0;

    const actual =
      Number(
        item?.actualQuantity
      ) || 0;

    if (
      item?.completed
    ) {
      return 100;
    }

    if (
      quantity <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (actual /
          quantity) *
          100
      )
    );
  };

  const selectedProgress =
    getItemProgress(
      selectedItem
    );

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

        {/* STATS */}

        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total Orders
              </p>

              <FiLayers
                size={16}
                className="text-slate-400"
              />
            </div>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Active
              </p>

              <FiClock
                size={16}
                className="text-blue-600"
              />
            </div>

            <p className="mt-2 text-3xl font-bold text-blue-700">
              {stats.active}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Completed
              </p>

              <FiCheckCircle
                size={16}
                className="text-emerald-600"
              />
            </div>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {stats.completed}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Draft Orders
              </p>

              <FiClock
                size={16}
                className="text-orange-500"
              />
            </div>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {stats.drafts}
            </p>
          </div>

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

                                  <span className="shrink-0 text-xs font-semibold text-slate-600">
                                    Qty{" "}
                                    {
                                      item.quantity
                                    }
                                  </span>

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

            {/* PRODUCT DETAILS */}

            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {!selectedItem ? (
                <div className="flex min-h-[550px] items-center justify-center p-6 text-sm text-slate-500">
                  Select a product.
                </div>
              ) : (
                <>

                  {/* PRODUCT HERO */}

                  <div className="border-b border-slate-100">

                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">

                      {getItemImage(
                        selectedItem
                      ) ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage(
                              getItemImage(
                                selectedItem
                              )
                            )
                          }
                          className="group relative h-full w-full"
                        >

                          <img
                            src={getItemImage(
                              selectedItem
                            )}
                            alt={getItemName(
                              selectedItem
                            )}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                          />

                          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent p-4 pt-12">

                            <div className="text-left text-white">

                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                                Selected Product
                              </p>

                              <p className="mt-1 text-lg font-bold">
                                {
                                  getItemName(
                                    selectedItem
                                  )
                                }
                              </p>

                            </div>

                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm backdrop-blur">
                              <FiMaximize2
                                size={16}
                              />
                            </span>

                          </div>

                        </button>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-slate-300">

                          <FiImage
                            size={42}
                          />

                          <p className="mt-3 text-xs font-medium text-slate-400">
                            No product photo available
                          </p>

                        </div>
                      )}

                    </div>

                    {/* PRODUCT INFO */}

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <p className="text-xs font-semibold uppercase tracking-wide text-[#17357A]">
                            Product
                          </p>

                          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                            {
                              getItemName(
                                selectedItem
                              )
                            }
                          </h2>

                          {getItemMarka(
                            selectedItem
                          ) && (
                            <p className="mt-1 text-sm text-slate-500">
                              Marka:{" "}
                              <span className="font-medium text-slate-700">
                                {
                                  getItemMarka(
                                    selectedItem
                                  )
                                }
                              </span>
                            </p>
                          )}

                        </div>

                        <div className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-right">

                          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-500">
                            Quantity
                          </p>

                          <p className="text-xl font-bold text-[#17357A]">
                            {
                              selectedItem.quantity
                            }
                          </p>

                        </div>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">

                        {getItemSku(
                          selectedItem
                        ) && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                              SKU
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                              {
                                getItemSku(
                                  selectedItem
                                )
                              }
                            </p>

                          </div>
                        )}

                        {getItemCategory(
                          selectedItem
                        ) && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                              Category
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                              {
                                getItemCategory(
                                  selectedItem
                                )
                              }
                            </p>

                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div className="border-b border-slate-100 p-5">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Production Progress
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {
                            selectedItem.actualQuantity ??
                            0
                          }{" "}
                          of{" "}
                          {
                            selectedItem.quantity
                          }{" "}
                          completed
                        </p>
                      </div>

                      <p className="text-2xl font-bold text-[#17357A]">
                        {
                          selectedProgress
                        }%
                      </p>

                    </div>

                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-[#17357A] transition-all duration-500"
                        style={{
                          width: `${selectedProgress}%`,
                        }}
                      />

                    </div>

                    <div className="mt-2 flex justify-between text-[10px] text-slate-400">

                      <span>
                        Started
                      </span>

                      <span>
                        {selectedItem.completed
                          ? "Completed"
                          : selectedItem.readyForDispatch
                            ? "Ready for dispatch"
                            : "In production"}
                      </span>

                    </div>

                  </div>

                  {/* BOM */}

                  <div className="space-y-4 p-5">

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#17357A] shadow-sm">
                          <FiLayers
                            size={15}
                          />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Bill of Materials
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-slate-800">
                            {selectedItem.bom
                              ?.finishedProduct
                              ?.name ||
                              "Assigned BOM"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* CAPACITY */}

                    <div className="rounded-xl border border-slate-200 p-4">

                      <div className="flex items-start justify-between">

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Production Capacity
                          </p>

                          <p className="mt-1 text-3xl font-bold text-slate-900">
                            {selectedAvailability
                              ?.maximumProducible ??
                              "-"}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            maximum producible
                          </p>
                        </div>

                        <FiBox
                          size={20}
                          className="text-slate-300"
                        />

                      </div>

                      {selectedAvailability
                        ?.bottleneck && (
                        <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-3">

                          <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">
                            Bottleneck
                          </p>

                          <p className="mt-1 text-sm font-bold text-orange-800">
                            {
                              selectedAvailability.bottleneck
                            }
                          </p>

                        </div>
                      )}

                    </div>

                    {/* MATERIALS */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <p className="font-semibold text-slate-900">
                          Material Availability
                        </p>

                        <FiInfo
                          size={14}
                          className="text-slate-300"
                        />

                      </div>

                      <div className="space-y-2">

                        {selectedAvailability
                          ?.materials
                          ?.map(
                            (
                              material: any,
                              index: number
                            ) => (
                              <div
                                key={
                                  index
                                }
                                className="rounded-xl border border-slate-200 p-3"
                              >

                                <div className="flex items-center justify-between gap-3">

                                  <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                                    {
                                      material.product
                                    }
                                  </span>

                                  <span
                                    className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${
                                      material.sufficient
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-red-50 text-red-700"
                                    }`}
                                  >
                                    {material.sufficient
                                      ? "Available"
                                      : "Short"}
                                  </span>

                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-2">

                                  <div>
                                    <p className="text-[9px] uppercase tracking-wide text-slate-400">
                                      Required
                                    </p>

                                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                                      {
                                        material.required
                                      }
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[9px] uppercase tracking-wide text-slate-400">
                                      Available
                                    </p>

                                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                                      {
                                        material.available
                                      }
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[9px] uppercase tracking-wide text-slate-400">
                                      Short
                                    </p>

                                    <p className="mt-0.5 text-xs font-semibold text-red-600">
                                      {
                                        material.shortage
                                      }
                                    </p>
                                  </div>

                                </div>

                              </div>
                            )
                          ) || (
                          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                            No material calculation available.
                          </div>
                        )}

                      </div>

                    </div>

                    {/* CHECKLIST */}

                    <div>

                      <p className="mb-2 font-semibold text-slate-900">
                        Production Checklist
                      </p>

                      <div className="rounded-xl border border-slate-200 p-4">

                        <div className="flex gap-3">

                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#17357A]">
                            <FiCheckCircle
                              size={14}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Preparing
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {selectedItem
                                .checklist
                                ?.preparing
                                ?.join(
                                  ", "
                                ) ||
                                "Nothing recorded"}
                            </p>

                          </div>

                        </div>

                        <div className="my-4 border-t border-slate-100" />

                        <div className="flex gap-3">

                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <FiTruck
                              size={14}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Leaving
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {selectedItem
                                .checklist
                                ?.leaving
                                ?.join(
                                  ", "
                                ) ||
                                "Nothing recorded"}
                            </p>

                          </div>

                        </div>

                        {selectedItem
                          .checklist
                          ?.reason && (
                          <>
                            <div className="my-4 border-t border-slate-100" />

                            <div className="rounded-lg bg-orange-50 p-3">

                              <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">
                                Reason
                              </p>

                              <p className="mt-1 text-xs leading-5 text-orange-800">
                                {
                                  selectedItem
                                    .checklist
                                    .reason
                                }
                              </p>

                            </div>
                          </>
                        )}

                      </div>

                    </div>

                    {/* COMPLETION */}

                    <div className="rounded-xl bg-slate-50 p-4">

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Actual Quantity
                        </span>

                        <strong className="text-slate-900">
                          {selectedItem
                            .actualQuantity ??
                            0}
                        </strong>

                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Ready for Dispatch
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            selectedItem.readyForDispatch
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {selectedItem
                            .readyForDispatch
                            ? "Ready"
                            : "Not Ready"}
                        </span>

                      </div>

                    </div>

                  </div>

                </>
              )}

            </div>

          </div>
        )}

        {/* CALCULATOR */}

        {activeTab ===
          "calculator" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#17357A]">
                <FiLayers
                  size={18}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Material Capacity Calculator
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Calculate how much can actually be produced from current stock.
                </p>
              </div>

            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_auto]">

              <select
                value={
                  calculatorBOM
                }
                onChange={(e) =>
                  setCalculatorBOM(
                    e.target.value
                  )
                }
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#17357A]"
              >
                <option value="">
                  Select BOM
                </option>

                {boms.map(
                  (bom: any) => (
                    <option
                      key={
                        bom._id
                      }
                      value={
                        bom._id
                      }
                    >
                      {bom.finishedProduct
                        ?.name ||
                        "BOM"}
                    </option>
                  )
                )}

              </select>

              <input
                type="number"
                min="1"
                value={
                  calculatorQuantity
                }
                onChange={(e) =>
                  setCalculatorQuantity(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#17357A]"
              />

              <button
                type="button"
                onClick={
                  handleCalculate
                }
                className="rounded-xl bg-[#17357A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#23458f]"
              >
                Calculate
              </button>

            </div>

            {calculatorResult && (
              <div className="mt-6">

                <div className="grid gap-3 md:grid-cols-2">

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Maximum Producible
                    </p>

                    <p className="mt-1 text-3xl font-bold text-slate-900">
                      {
                        calculatorResult.maximumProducible
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                      Bottleneck
                    </p>

                    <p className="mt-1 text-xl font-bold text-orange-800">
                      {
                        calculatorResult.bottleneck ||
                        "None"
                      }
                    </p>

                  </div>

                </div>

                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">

                  <table className="w-full text-sm">

                    <thead className="bg-slate-50">

                      <tr>

                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                          Material
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                          Required
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                          Available
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                          Shortage
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">
                          Status
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {calculatorResult.materials?.map(
                        (
                          material: any,
                          index: number
                        ) => (
                          <tr
                            key={
                              index
                            }
                            className="border-t border-slate-100"
                          >

                            <td className="px-4 py-3 font-medium text-slate-700">
                              {
                                material.product
                              }
                            </td>

                            <td className="px-4 py-3 text-right text-slate-600">
                              {
                                material.required
                              }
                            </td>

                            <td className="px-4 py-3 text-right text-slate-600">
                              {
                                material.available
                              }
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-red-600">
                              {
                                material.shortage
                              }
                            </td>

                            <td className="px-4 py-3 text-center">

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                  material.sufficient
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {material.sufficient
                                  ? "Sufficient"
                                  : "Shortage"}
                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                <div className="mt-5 flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={
                      handleExportExcel
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Export Excel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleExportPdf
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
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