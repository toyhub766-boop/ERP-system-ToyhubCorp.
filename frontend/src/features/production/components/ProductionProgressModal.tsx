import { useEffect, useMemo, useState } from "react";

import {
  updateProductionItem,
} from "../services/production.services";

interface Props {
  open: boolean;
  production: any;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

interface ProgressItem {
  itemId: string;
  source: any;
  actualQuantity: number;
  existingStockQuantity: number;
  readyForDispatchQuantity: number;
}

const orderedQty = (item: any) =>
  Math.max(0, Number(item?.quantity) || 0);

const actualQty = (item: any) =>
  Math.max(0, Number(item?.actualQuantity) || 0);

const stockQty = (item: any) =>
  Math.max(
    0,
    Number(item?.existingStockQuantity) || 0
  );

const productName = (item: any) =>
  item?.catalogueProduct?.name ||
  item?.product?.name ||
  item?.productName ||
  "Product";

const productImage = (item: any) =>
  item?.image ||
  item?.catalogueProduct?.image ||
  item?.product?.image ||
  "";

const productModel = (item: any) =>
  item?.catalogueProduct?.modelNumber ||
  item?.modelNumber ||
  item?.product?.modelNumber ||
  item?.product?.sku ||
  item?.sku ||
  "-";

const productMarka = (item: any) =>
  item?.marka ||
  item?.catalogueProduct?.marka ||
  item?.product?.marka ||
  item?.product?.brand ||
  "-";

export default function ProductionProgressModal({
  open,
  production,
  onClose,
  onSaved,
}: Props) {
  const [items, setItems] =
    useState<ProgressItem[]>([]);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!open || !production) {
      return;
    }

    setItems(
      (production.items || []).map(
        (item: any) => ({
          itemId: String(
            item?._id || ""
          ),
          source: item,
          actualQuantity:
            actualQty(item),
          existingStockQuantity:
            stockQty(item),
          readyForDispatchQuantity:
            Math.max(
              0,
              Number(
                item?.readyForDispatchQuantity
              ) || 0
            ),
        })
      )
    );
  }, [open, production]);

  const updateItem = (
    index: number,
    field:
      | "actualQuantity"
      | "existingStockQuantity"
      | "readyForDispatchQuantity",
    value: number
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const ordered =
          orderedQty(item.source);

        let actual =
          item.actualQuantity;

        let stock =
          item.existingStockQuantity;

        let ready =
          item.readyForDispatchQuantity;

        if (
          field ===
          "actualQuantity"
        ) {
          actual = Math.max(
            0,
            Math.min(
              ordered,
              Number(value) || 0
            )
          );

          stock = Math.min(
            stock,
            Math.max(
              0,
              ordered - actual
            )
          );
        }

        if (
          field ===
          "existingStockQuantity"
        ) {
          stock = Math.max(
            0,
            Math.min(
              Math.max(
                0,
                ordered - actual
              ),
              Number(value) || 0
            )
          );
        }

        const available =
          actual + stock;

        ready = Math.max(
          0,
          Math.min(
            available,
            Number(
              field ===
                "readyForDispatchQuantity"
                ? value
                : ready
            ) || 0
          )
        );

        return {
          ...item,
          actualQuantity:
            actual,
          existingStockQuantity:
            stock,
          readyForDispatchQuantity:
            ready,
        };
      })
    );
  };

  const markAvailableReady = (
    index: number
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const available =
          item.actualQuantity +
          item.existingStockQuantity;

        return {
          ...item,
          readyForDispatchQuantity:
            available,
        };
      })
    );
  };

  const summary = useMemo(
    () =>
      items.reduce(
        (total, item) => {
          const ordered =
            orderedQty(item.source);

          const available =
            item.actualQuantity +
            item.existingStockQuantity;

          const fulfilled =
            Math.min(
              ordered,
              available
            );

          const ready =
            Math.min(
              available,
              item.readyForDispatchQuantity
            );

          total.ordered +=
            ordered;
          total.produced +=
            item.actualQuantity;
          total.stock +=
            item.existingStockQuantity;
          total.available +=
            available;
          total.fulfilled +=
            fulfilled;
          total.remaining +=
            Math.max(
              0,
              ordered - fulfilled
            );
          total.ready += ready;

          return total;
        },
        {
          ordered: 0,
          produced: 0,
          stock: 0,
          available: 0,
          fulfilled: 0,
          remaining: 0,
          ready: 0,
        }
      ),
    [items]
  );

  const save = async () => {
    try {
      setSaving(true);

      for (const item of items) {
        if (!item.itemId) {
          continue;
        }

        const ordered =
          orderedQty(item.source);

        const actual =
          Math.max(
            0,
            Math.min(
              ordered,
              item.actualQuantity
            )
          );

        const stock =
          Math.max(
            0,
            Math.min(
              Math.max(
                0,
                ordered - actual
              ),
              item.existingStockQuantity
            )
          );

        const available =
          actual + stock;

        const ready =
          Math.max(
            0,
            Math.min(
              available,
              item.readyForDispatchQuantity
            )
          );

        await updateProductionItem(
          production._id,
          item.itemId,
          {
            actualQuantity:
              actual,
            existingStockQuantity:
              stock,
            readyForDispatchQuantity:
              ready,
            readyForDispatch:
              ready > 0,
            completed:
              available >= ordered &&
              ordered > 0,
          }
        );
      }

      await onSaved();
      onClose();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to save production progress."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open || !production) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="border-b px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">
            Step 2
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Update Production Quantity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            First complete the checklist on the main screen.
            Here you only record how many units were produced,
            how many were already in finished stock, and how many
            are ready for Dispatch.
          </p>

          <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-blue-800">
            <strong>Simple rule:</strong>{" "}
            Ordered → Produced + Existing Stock → Available →
            Ready for Dispatch.
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-6">
            <Summary label="Ordered" value={summary.ordered} />
            <Summary label="Produced" value={summary.produced} />
            <Summary label="Existing Stock" value={summary.stock} />
            <Summary label="Available" value={summary.available} />
            <Summary label="Remaining" value={summary.remaining} />
            <Summary label="Ready" value={summary.ready} />
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const ordered =
                orderedQty(item.source);

              const available =
                item.actualQuantity +
                item.existingStockQuantity;

              const remaining =
                Math.max(
                  0,
                  ordered - Math.min(
                    ordered,
                    available
                  )
                );

              const ready =
                Math.min(
                  available,
                  item.readyForDispatchQuantity
                );

              const image =
                productImage(item.source);

              return (
                <div
                  key={item.itemId}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex items-start gap-3">
                    {image ? (
                      <img
                        src={image}
                        alt={productName(item.source)}
                        className="h-14 w-14 shrink-0 rounded-xl border object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[9px] font-bold text-slate-400">
                        IMG
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900">
                        {productName(item.source)}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
                        <span>
                          Model:{" "}
                          <strong>
                            {productModel(item.source)}
                          </strong>
                        </span>

                        <span>
                          Marka:{" "}
                          <strong>
                            {productMarka(item.source)}
                          </strong>
                        </span>

                        <span>
                          Ordered:{" "}
                          <strong>
                            {ordered}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-orange-50 px-3 py-2 text-right">
                      <p className="text-[9px] uppercase tracking-wide text-orange-500">
                        Remaining
                      </p>

                      <p className="text-lg font-bold text-orange-700">
                        {remaining}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <NumberField
                      label="1. Produced"
                      value={
                        item.actualQuantity
                      }
                      max={ordered}
                      disabled={saving}
                      onChange={(value) =>
                        updateItem(
                          index,
                          "actualQuantity",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="2. Existing Stock"
                      value={
                        item.existingStockQuantity
                      }
                      max={Math.max(
                        0,
                        ordered -
                          item.actualQuantity
                      )}
                      disabled={saving}
                      onChange={(value) =>
                        updateItem(
                          index,
                          "existingStockQuantity",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="3. Ready Quantity"
                      value={ready}
                      max={available}
                      disabled={saving}
                      onChange={(value) =>
                        updateItem(
                          index,
                          "readyForDispatchQuantity",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="mt-3 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Available to send to Dispatch
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {available} units
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Ready quantity cannot be higher than available quantity.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        saving ||
                        available <= 0
                      }
                      onClick={() =>
                        markAvailableReady(
                          index
                        )
                      }
                      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Mark All Available Ready
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Ordered quantity is never changed here.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                saving ||
                items.length === 0
              }
              onClick={save}
              className="rounded-lg bg-[#17357A] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-base font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function NumberField({
  label,
  value,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <input
        type="number"
        min={0}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            Math.max(
              0,
              Math.min(
                max,
                Number(
                  event.target.value
                ) || 0
              )
            )
          )
        }
        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-[#17357A] disabled:bg-slate-50"
      />
    </label>
  );
}
