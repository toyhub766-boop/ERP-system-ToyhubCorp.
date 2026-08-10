import { useEffect, useState } from "react";

import {
  updateProductionItem,
} from "../services/production.services";

interface Props {
  open: boolean;
  production: any;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

interface CompletionItem {
  itemId: string;
  completed: boolean;
  actualQuantity: number | "";
  readyForDispatch: boolean;
  remarks: string;
}

export default function ProductionCompletionModal({
  open,
  production,
  onClose,
  onSaved,
}: Props) {
  const [items, setItems] =
    useState<CompletionItem[]>([]);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!open || !production) return;

    setItems(
      (production.items || []).map(
        (item: any) => ({
          itemId: item._id,

          completed:
            item.completed || false,

          actualQuantity:
            item.actualQuantity ??
            item.quantity ??
            "",

          readyForDispatch:
            item.readyForDispatch ||
            false,

          remarks:
            item.remarks || "",
        })
      )
    );
  }, [open, production]);

  if (!open || !production) {
    return null;
  }

  const updateItem = (
    index: number,
    changes: Partial<CompletionItem>
  ) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, ...changes }
          : item
      )
    );
  };

  const save = async () => {
    try {
      setSaving(true);

      for (const item of items) {
        await updateProductionItem(
          production._id,
          item.itemId,
          {
            completed:
              item.completed,

            actualQuantity:
              item.actualQuantity === ""
                ? null
                : Number(
                    item.actualQuantity
                  ),

            readyForDispatch:
              item.readyForDispatch,

            remarks:
              item.remarks,
          }
        );
      }

      await onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(
        "Failed to save production completion."
      );
    } finally {
      setSaving(false);
    }
  };

  const completedCount =
    items.filter(
      (item) => item.completed
    ).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="border-b px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-green-600">
            Production Completion
          </div>

          <h2 className="text-2xl font-bold">
            Complete Production
          </h2>

          <p className="text-sm text-slate-500">
            Complete each product separately.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <strong>
              {completedCount}
            </strong>{" "}
            of{" "}
            <strong>
              {items.length}
            </strong>{" "}
            products completed
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="space-y-4">

            {items.map(
              (item, index) => {
                const product =
                  production.items?.[
                    index
                  ]?.product;

                const orderedQuantity =
                  production.items?.[
                    index
                  ]?.quantity;

                return (
                  <div
                    key={item.itemId}
                    className={`rounded-xl border p-5 ${
                      item.completed
                        ? "border-green-200 bg-green-50/40"
                        : "border-slate-200"
                    }`}
                  >

                    <div className="mb-4 flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 font-bold text-white">
                          {index + 1}
                        </div>

                        <div>
                          <div className="font-semibold">
                            {product?.name ||
                              `Product ${
                                index + 1
                              }`}
                          </div>

                          <div className="text-xs text-slate-500">
                            Ordered quantity:{" "}
                            {orderedQuantity}
                          </div>
                        </div>
                      </div>

                      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={
                            item.completed
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              {
                                completed:
                                  e.target
                                    .checked,
                              }
                            )
                          }
                          className="h-4 w-4"
                        />

                        Completed
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Actual Quantity
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            item.actualQuantity
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              {
                                actualQuantity:
                                  e.target
                                    .value ===
                                  ""
                                    ? ""
                                    : Number(
                                        e.target
                                          .value
                                      ),
                              }
                            )
                          }
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <label className="flex items-center gap-3 rounded-lg border px-4 py-3">
                        <input
                          type="checkbox"
                          checked={
                            item.readyForDispatch
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              {
                                readyForDispatch:
                                  e.target
                                    .checked,
                              }
                            )
                          }
                          className="h-4 w-4"
                        />

                        <div>
                          <div className="text-sm font-semibold">
                            Ready for Dispatch
                          </div>

                          <div className="text-xs text-slate-500">
                            Mark this product as ready to leave production.
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="mt-4">
                      <label className="mb-1 block text-sm font-medium">
                        Remarks
                      </label>

                      <textarea
                        rows={2}
                        value={item.remarks}
                        onChange={(e) =>
                          updateItem(
                            index,
                            {
                              remarks:
                                e.target
                                  .value,
                            }
                          )
                        }
                        placeholder="Completion remarks..."
                        className="w-full rounded-lg border px-3 py-2"
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border bg-white px-5 py-2"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={save}
            className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Production"}
          </button>
        </div>
      </div>
    </div>
  );
}