import { useEffect, useMemo, useState } from "react";

import { getBOMs } from "../../bom/services/bom.service";

import {
  getProductions,
  createProduction,
  updateProduction,
  calculateProduction,
  getMaterialConsumption,
} from "../../production/services/production.services";

import {
  getProductionClients,
  createProductionClient,
} from "../../production/services/productionClient.service";

import api from "../../../services/api/axios";

import ProductionCreateModal from "../../production/components/ProductionCreateModal";
import ProductionProgressModal from "../../production/components/ProductionProgressModal";
import ProductionCompletionModal from "../../production/components/ProductionCompletionModal";
import ProductionEditModal from "../../production/components/ProductionEditModal";

const ProductionStaffProductionPage = () => {
  const [productions, setProductions] =
    useState<any[]>([]);

  const [clients, setClients] =
    useState<any[]>([]);

  const [accountCustomers, setAccountCustomers] =
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

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showProgressModal, setShowProgressModal] =
    useState(false);

  const [showCompletionModal, setShowCompletionModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedAvailability, setSelectedAvailability] =
    useState<any>(null);

  const [materialConsumption, setMaterialConsumption] =
    useState<any[]>([]);

  const [calculatorBOM, setCalculatorBOM] =
    useState("");

  const [calculatorQuantity, setCalculatorQuantity] =
    useState(1);

  const [calculatorResult, setCalculatorResult] =
    useState<any>(null);

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
        clientData,
        accountCustomerResponse,
      ] = await Promise.all([
        getProductions(),
        getBOMs(),
        getProductionClients(),
        api.get("/accounts/party"),
      ]);

      setProductions(
        productionData || []
      );

      setBoms(
        bomData || []
      );

      setClients(
        clientData || []
      );

      setAccountCustomers(
        (
          accountCustomerResponse.data ||
          []
        ).filter(
          (party: any) =>
            party.partyType === "CUSTOMER" &&
            party.status === "Active"
        )
      );

      if (
        productionData?.length > 0
      ) {
        setSelectedProduction(
          (current: any) => {
            if (!current) {
              return productionData[0];
            }

            return (
              productionData.find(
                (item: any) =>
                  item._id ===
                  current._id
              ) ||
              productionData[0]
            );
          }
        );
      } else {
        setSelectedProduction(
          null
        );
      }
    } catch (error) {
      console.error(
        "Failed to load production data:",
        error
      );

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
        data || []
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
  | SELECTED ITEM
  |--------------------------------------------------------------------------
  */

  const selectedItem =
    selectedProduction?.items?.[
      selectedItemIndex
    ] || null;

  /*
  |--------------------------------------------------------------------------
  | SELECTED ITEM CAPACITY
  |--------------------------------------------------------------------------
  */

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
              selectedItem.bom?._id ||
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
  | CREATE PRODUCTION
  |--------------------------------------------------------------------------
  */

  const handleCreate = async (
    data: any
  ) => {
    await createProduction(
      data
    );

    await loadData();
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE NEW PRODUCTION CLIENT
  |--------------------------------------------------------------------------
  |
  | Existing ProductionClient creation
  | remains available.
  |
  | Account customers are selected
  | separately from Accounts.
  */

  const handleCreateClient = async (
    data: any
  ) => {
    const created =
      await createProductionClient(
        data
      );

    setClients(
      (current) => [
        created,
        ...current,
      ]
    );

    return created;
  };

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

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";

      case "Started":
      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Approved":
        return "bg-purple-100 text-purple-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE STATUS
  |--------------------------------------------------------------------------
  */

  const handleStatusUpdate = async (
    status: string
  ) => {
    if (
      !selectedProduction
    ) {
      return;
    }

    try {
      await updateProduction(
        selectedProduction._id,
        {
          client:
            selectedProduction
              .client?._id ||
            selectedProduction.client,

          clientModel:
            selectedProduction
              .clientModel ||
            "ProductionClient",

          items:
            selectedProduction.items,

          team:
            selectedProduction.team,

          status,

          targetDate:
            selectedProduction.targetDate,

          transport:
            selectedProduction.transport,

          notes:
            selectedProduction.notes,
        }
      );

      await refreshSelectedProduction();
    } catch (error) {
      console.error(
        "Failed to update production status:",
        error
      );

      alert(
        "Failed to update production status."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RAW PRODUCTS
  |--------------------------------------------------------------------------
  */

  const rawProducts =
    useMemo(() => {
      return boms.flatMap(
        (bom: any) =>
          (
            bom.materials ||
            []
          )
            .map(
              (material: any) =>
                material.product
            )
            .filter(Boolean)
      );
    }, [boms]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#17357A]">
              Production Staff
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Production Management
            </h1>

            <p className="mt-1 text-slate-500">
              Orders, production planning,
              capacity and completion tracking
            </p>
          </div>

          <button
            onClick={() =>
              setShowCreateModal(
                true
              )
            }
            className="rounded-xl bg-[#17357A] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#102b68]"
          >
            + New Production Order
          </button>

        </div>

        {/* TABS */}

        <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

          <button
            onClick={() =>
              setActiveTab(
                "orders"
              )
            }
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
              activeTab ===
              "orders"
                ? "bg-[#17357A] text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Production Orders
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "calculator"
              )
            }
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
              activeTab ===
              "calculator"
                ? "bg-[#17357A] text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Capacity Calculator
          </button>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-700">
              {stats.active}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.completed}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Draft Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {stats.drafts}
            </p>
          </div>

        </div>

        {/* ================================================================= */}
        {/* ORDERS */}
        {/* ================================================================= */}

        {activeTab ===
        "orders" && (

          <div className="grid gap-5 xl:grid-cols-[280px_1fr_360px]">

            {/* ORDER LIST */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-4">

                <div className="flex items-center justify-between">

                  <h2 className="font-bold">
                    Orders
                  </h2>

                  <span className="text-xs text-slate-500">
                    {
                      productions.length
                    }
                  </span>

                </div>

              </div>

              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">

                {loading ? (

                  <div className="p-6 text-sm text-slate-500">
                    Loading...
                  </div>

                ) : productions.length ===
                  0 ? (

                  <div className="p-6 text-sm text-slate-500">
                    No production orders.
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

                      return (
                        <button
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
                          className={`w-full border-b border-slate-100 p-4 text-left transition ${
                            isSelected
                              ? "bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-2">

                            <div>

                              <p className="font-bold text-slate-900">
                                {
                                  production.orderNumber
                                }
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                {client?.name ||
                                  client?.companyName ||
                                  client?.firmName ||
                                  "No client"}
                              </p>

                            </div>

                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClass(
                                production.status
                              )}`}
                            >
                              {
                                production.status
                              }
                            </span>

                          </div>

                          <div className="mt-3 flex justify-between text-xs text-slate-500">

                            <span>
                              {
                                production
                                  .items
                                  ?.length
                              }{" "}
                              product
                              {production
                                .items
                                ?.length ===
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

                        </button>
                      );
                    }
                  )

                )}

              </div>

            </div>

            {/* ORDER INFORMATION */}

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">

              {!selectedProduction ? (

                <div className="flex min-h-[500px] items-center justify-center p-8 text-slate-500">
                  Select an order.
                </div>

              ) : (

                <>

                  <div className="border-b border-slate-200 p-5">

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div>

                        <p className="text-xs uppercase tracking-wider text-slate-400">
                          Production Order
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                          {
                            selectedProduction.orderNumber
                          }
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
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
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                          selectedProduction.status
                        )}`}
                      >
                        {
                          selectedProduction.status
                        }
                      </span>

                    </div>

                  </div>

                  {/* BASIC INFO */}

                  <div className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-2">

                    <div>

                      <p className="text-xs text-slate-400">
                        Client
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          selectedProduction
                            .client?.name ||
                          selectedProduction
                            .client?.companyName ||
                          selectedProduction
                            .client?.firmName ||
                          "-"
                        }
                      </p>

                      {selectedProduction
                        .client
                        ?.contactPerson && (

                        <p className="text-sm text-slate-500">
                          {
                            selectedProduction
                              .client
                              .contactPerson
                          }
                        </p>

                      )}

                      {(
                        selectedProduction
                          .client?.phone ||
                        selectedProduction
                          .client
                          ?.transportPhone
                      ) && (

                        <p className="text-sm text-slate-500">
                          {
                            selectedProduction
                              .client?.phone ||
                            selectedProduction
                              .client
                              ?.transportPhone
                          }
                        </p>

                      )}

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Production Team
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          selectedProduction.team ||
                          "Unassigned"
                        }
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Target Date
                      </p>

                      <p className="mt-1 font-semibold">
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

                      <p className="text-xs text-slate-400">
                        Transport
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          selectedProduction.transport ||
                          "-"
                        }
                      </p>

                    </div>

                  </div>

                  {/* ITEMS */}

                  <div className="p-5">

                    <h3 className="mb-3 font-bold">
                      Order Summary
                    </h3>

                    <div className="space-y-2">

                      {selectedProduction.items?.map(
                        (
                          item: any,
                          index: number
                        ) => (

                          <button
                            key={
                              item._id ||
                              index
                            }
                            onClick={() =>
                              setSelectedItemIndex(
                                index
                              )
                            }
                            className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
                              selectedItemIndex ===
                              index
                                ? "border-blue-300 bg-blue-50"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >

                            <div>

                              <p className="font-semibold">
                                {item.product
                                  ?.name ||
                                  `Product ${
                                    index +
                                    1
                                  }`}
                              </p>

                              <p className="text-xs text-slate-500">
                                Qty:{" "}
                                {
                                  item.quantity
                                }
                              </p>

                            </div>

                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                item.completed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.completed
                                ? "Completed"
                                : "Pending"}
                            </span>

                          </button>

                        )
                      )}

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 p-4">

                    {selectedProduction
                      .status !==
                      "In Progress" &&
                      selectedProduction
                        .status !==
                        "Completed" &&
                      selectedProduction
                        .status !==
                        "Cancelled" && (

                      <button
                        onClick={() =>
                          setShowProgressModal(
                            true
                          )
                        }
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Update Progress
                      </button>

                    )}

                    {selectedProduction
                      .status ===
                      "In Progress" && (

                      <button
                        onClick={() =>
                          setShowCompletionModal(
                            true
                          )
                        }
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Complete Production
                      </button>

                    )}

                    {selectedProduction
                      .status ===
                      "Draft" && (

                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            "Approved"
                          )
                        }
                        className="rounded-lg bg-[#17357A] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Approve
                      </button>

                    )}

                    {selectedProduction
                      .status ===
                      "Approved" && (

                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            "Started"
                          )
                        }
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Start Production
                      </button>

                    )}

                    <button
                      onClick={() =>
                        setShowEditModal(
                          true
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
                    >
                      Edit
                    </button>

                  </div>

                </>

              )}

            </div>

            {/* PRODUCT DETAILS */}

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">

              {!selectedItem ? (

                <div className="p-6 text-sm text-slate-500">
                  Select a product.
                </div>

              ) : (

                <>

                  <div className="border-b border-slate-200 p-5">

                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Selected Product
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {
                        selectedItem
                          .product?.name
                      }
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Quantity:{" "}
                      {
                        selectedItem.quantity
                      }
                    </p>

                  </div>

                  <div className="space-y-4 p-5">

                    {/* BOM */}

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs text-slate-400">
                        BOM
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          selectedItem
                            .bom
                            ?.finishedProduct
                            ?.name ||
                          "Assigned BOM"
                        }
                      </p>

                    </div>

                    {/* CAPACITY */}

                    <div className="rounded-xl border border-slate-200 p-4">

                      <p className="text-xs text-slate-400">
                        Production Capacity
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {
                          selectedAvailability
                            ?.maximumProducible ??
                          "-"
                        }
                      </p>

                      <p className="text-xs text-slate-500">
                        maximum producible
                      </p>

                      {selectedAvailability
                        ?.bottleneck && (

                        <div className="mt-3 rounded-lg bg-orange-50 p-3">

                          <p className="text-xs text-orange-600">
                            Bottleneck
                          </p>

                          <p className="font-semibold text-orange-800">
                            {
                              selectedAvailability
                                .bottleneck
                            }
                          </p>

                        </div>

                      )}

                    </div>

                    {/* MATERIALS */}

                    <div>

                      <p className="mb-2 font-semibold">
                        Material Availability
                      </p>

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
                                className="rounded-lg border border-slate-200 p-3"
                              >

                                <div className="flex items-center justify-between gap-3">

                                  <span className="text-sm font-medium">
                                    {
                                      material.product
                                    }
                                  </span>

                                  <span
                                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                      material.sufficient
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {material.sufficient
                                      ? "Available"
                                      : "Short"}
                                  </span>

                                </div>

                                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500">

                                  <span>
                                    Required{" "}
                                    <strong className="text-slate-800">
                                      {
                                        material.required
                                      }
                                    </strong>
                                  </span>

                                  <span>
                                    Available{" "}
                                    <strong className="text-slate-800">
                                      {
                                        material.available
                                      }
                                    </strong>
                                  </span>

                                  <span>
                                    Short{" "}
                                    <strong className="text-red-600">
                                      {
                                        material.shortage
                                      }
                                    </strong>
                                  </span>

                                </div>

                              </div>

                            )
                          ) || (

                          <p className="text-sm text-slate-500">
                            No calculation available.
                          </p>

                        )}

                      </div>

                    </div>

                    {/* CHECKLIST */}

                    <div>

                      <p className="mb-2 font-semibold">
                        Production Checklist
                      </p>

                      <div className="rounded-xl border border-slate-200 p-3 text-sm">

                        <p>
                          Preparing:{" "}
                          <span className="text-slate-500">
                            {selectedItem
                              .checklist
                              ?.preparing
                              ?.join(
                                ", "
                              ) ||
                              "Nothing recorded"}
                          </span>
                        </p>

                        <p className="mt-2">
                          Leaving:{" "}
                          <span className="text-slate-500">
                            {selectedItem
                              .checklist
                              ?.leaving
                              ?.join(
                                ", "
                              ) ||
                              "Nothing recorded"}
                          </span>
                        </p>

                        {selectedItem
                          .checklist
                          ?.reason && (

                          <p className="mt-2 text-xs text-orange-600">
                            Reason:{" "}
                            {
                              selectedItem
                                .checklist
                                .reason
                            }
                          </p>

                        )}

                      </div>

                    </div>

                    {/* COMPLETION */}

                    <div className="rounded-xl bg-slate-50 p-4">

                      <div className="flex justify-between text-sm">

                        <span>
                          Actual Quantity
                        </span>

                        <strong>
                          {selectedItem
                            .actualQuantity ??
                            "-"}
                        </strong>

                      </div>

                      <div className="mt-2 flex justify-between text-sm">

                        <span>
                          Ready for Dispatch
                        </span>

                        <strong>
                          {selectedItem
                            .readyForDispatch
                            ? "Yes"
                            : "No"}
                        </strong>

                      </div>

                    </div>

                    {/* CONSUMPTION */}

                    {materialConsumption.length >
                      0 && (

                      <div>

                        <p className="mb-2 font-semibold">
                          Material Consumption
                        </p>

                        <div className="space-y-2">

                          {materialConsumption.map(
                            (
                              material: any
                            ) => (

                              <div
                                key={
                                  material._id
                                }
                                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                              >

                                <span className="text-sm">
                                  {
                                    material
                                      .material
                                      ?.name
                                  }
                                </span>

                                <span className="font-semibold">
                                  {
                                    material.requiredQuantity
                                  }
                                </span>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}

                  </div>

                </>

              )}

            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* CALCULATOR */}
        {/* ================================================================= */}

        {activeTab ===
          "calculator" && (

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-2xl font-bold">
              Material Capacity Calculator
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Calculate production feasibility
              using current material availability.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_180px_auto]">

              <select
                value={
                  calculatorBOM
                }
                onChange={(e) =>
                  setCalculatorBOM(
                    e.target.value
                  )
                }
                className="rounded-xl border border-slate-300 px-3 py-3"
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
                      {
                        bom
                          .finishedProduct
                          ?.name ||
                        "BOM"
                      }
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
                className="rounded-xl border border-slate-300 px-3 py-3"
              />

              <button
                onClick={
                  handleCalculate
                }
                className="rounded-xl bg-[#17357A] px-5 py-3 font-semibold text-white"
              >
                Calculate
              </button>

            </div>

            {calculatorResult && (

              <div className="mt-6">

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                    <p className="text-sm text-slate-500">
                      Maximum Producible
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {
                        calculatorResult.maximumProducible
                      }
                    </p>

                  </div>

                  <div className="rounded-xl bg-orange-50 p-5">

                    <p className="text-sm text-orange-600">
                      Bottleneck
                    </p>

                    <p className="mt-2 text-xl font-bold text-orange-800">
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

                        <th className="px-4 py-3 text-left">
                          Material
                        </th>

                        <th className="px-4 py-3 text-right">
                          Required
                        </th>

                        <th className="px-4 py-3 text-right">
                          Available
                        </th>

                        <th className="px-4 py-3 text-right">
                          Shortage
                        </th>

                        <th className="px-4 py-3 text-center">
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

                            <td className="px-4 py-3">
                              {
                                material.product
                              }
                            </td>

                            <td className="px-4 py-3 text-right">
                              {
                                material.required
                              }
                            </td>

                            <td className="px-4 py-3 text-right">
                              {
                                material.available
                              }
                            </td>

                            <td className="px-4 py-3 text-right">
                              {
                                material.shortage
                              }
                            </td>

                            <td className="px-4 py-3 text-center">

                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  material.sufficient
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
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

              </div>

            )}

          </div>

        )}

        {/* ================================================================= */}
        {/* MODALS */}
        {/* ================================================================= */}

        <ProductionCreateModal
          open={
            showCreateModal
          }
          clients={
            clients
          }
          accountCustomers={
            accountCustomers
          }
          boms={
            boms
          }
          rawProducts={
            rawProducts
          }
          onClose={() =>
            setShowCreateModal(
              false
            )
          }
          onCreate={
            handleCreate
          }
          onCreateClient={
            handleCreateClient
          }
        />

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

        <ProductionEditModal
          open={
            showEditModal
          }
          production={
            selectedProduction
          }
          clients={
            clients
          }
          boms={
            boms
          }
          rawProducts={
            rawProducts
          }
          onClose={() =>
            setShowEditModal(
              false
            )
          }
          onSave={async (
            data
          ) => {
            await updateProduction(
              selectedProduction._id,
              data
            );

            setShowEditModal(
              false
            );

            await loadData();
          }}
        />

      </div>
    </div>
  );
};

export default ProductionStaffProductionPage;