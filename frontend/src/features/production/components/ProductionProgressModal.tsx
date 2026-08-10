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

export default function ProductionProgressModal({
  open,
  production,
  onClose,
  onSaved,
}: Props) {
  const [items, setItems] =
    useState<any[]>([]);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!production || !open) return;

    setItems(
      (production.items || []).map(
        (item: any) => ({
          itemId: item._id,

          preparing:
            item.checklist?.preparing || [],

          leaving:
            item.checklist?.leaving || [],

          reason:
            item.checklist?.reason || "",
        })
      )
    );
  }, [production, open]);

  if (!open || !production) {
    return null;
  }

  const updateItem = (
    index: number,
    changes: any
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
            checklist: {
              preparing:
                item.preparing,
              leaving:
                item.leaving,
              reason:
                item.reason,
            },
          }
        );
      }

      await onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(
        "Failed to start production."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="border-b px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-500">
            In Progress
          </div>

          <h2 className="text-2xl font-bold">
            Start Production
          </h2>

          <p className="text-sm text-slate-500">
            Record what the team is preparing and what is being left.
          </p>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="mb-5 rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              Production Order
            </div>

            <div className="font-bold">
              {production.orderNumber}
            </div>
          </div>

          <div className="space-y-4">
            {items.map(
              (item, index) => {
                const product =
                  production.items?.[
                    index
                  ]?.product;

                return (
                  <div
                    key={item.itemId}
                    className="rounded-xl border p-5"
                  >
                    <div className="mb-4 flex items-center gap-3">
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
                          Quantity:{" "}
                          {production
                            .items?.[
                            index
                          ]?.quantity ??
                            "-"}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">

                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          What are you preparing?
                        </label>

                        <textarea
                          rows={3}
                          value={item.preparing.join(
                            "\n"
                          )}
                          onChange={(e) =>
                            updateItem(
                              index,
                              {
                                preparing:
                                  e.target.value
                                    .split("\n")
                                    .map(
                                      (
                                        value
                                      ) =>
                                        value.trim()
                                    )
                                    .filter(
                                      Boolean
                                    ),
                              }
                            )
                          }
                          placeholder={
                            "Example:\nBody panels\nPackaging\nAssembly"
                          }
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          What are you leaving?
                        </label>

                        <textarea
                          rows={3}
                          value={item.leaving.join(
                            "\n"
                          )}
                          onChange={(e) =>
                            updateItem(
                              index,
                              {
                                leaving:
                                  e.target.value
                                    .split("\n")
                                    .map(
                                      (
                                        value
                                      ) =>
                                        value.trim()
                                    )
                                    .filter(
                                      Boolean
                                    ),
                              }
                            )
                          }
                          placeholder={
                            "Example:\nMissing material\nPending approval"
                          }
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    {item.leaving.length >
                      0 && (
                      <div className="mt-4">
                        <label className="mb-1 block text-sm font-semibold">
                          Why are these being left?
                        </label>

                        <textarea
                          rows={2}
                          value={item.reason}
                          onChange={(e) =>
                            updateItem(
                              index,
                              {
                                reason:
                                  e.target
                                    .value,
                              }
                            )
                          }
                          placeholder="Enter the reason..."
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                      </div>
                    )}
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
            className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Starting..."
              : "Mark In Progress"}
          </button>
        </div>
      </div>
    </div>
  );
}