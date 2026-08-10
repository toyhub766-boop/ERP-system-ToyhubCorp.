import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  production: any;
  clients: any[];
  boms: any[];
  rawProducts: any[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ProductionEditModal({
  open,
  production,
  clients,
  boms,
  rawProducts,
  onClose,
  onSave,
}: Props) {
  const [client, setClient] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [team, setTeam] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [transport, setTransport] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !production) return;

    setClient(
      production.client?._id ||
        production.client ||
        ""
    );

    setItems(
      (production.items || []).map(
        (item: any) => ({
          _id: item._id,

          product:
            item.product?._id ||
            item.product ||
            "",

          bom:
            item.bom?._id ||
            item.bom ||
            "",

          quantity:
            Number(item.quantity) || 1,

          materialSelections:
            (item.materialSelections || []).map(
              (selection: any) => ({
                requiredMaterial:
                  selection.requiredMaterial?._id ||
                  selection.requiredMaterial,

                selectedMaterial:
                  selection.selectedMaterial?._id ||
                  selection.selectedMaterial,
              })
            ),

          checklist:
            item.checklist || {
              preparing: [],
              leaving: [],
              reason: "",
            },

          actualQuantity:
            item.actualQuantity ?? null,

          completed:
            item.completed || false,

          readyForDispatch:
            item.readyForDispatch || false,

          remarks:
            item.remarks || "",
        })
      )
    );

    setTeam(
      production.team || ""
    );

    setTargetDate(
      production.targetDate
        ? new Date(
            production.targetDate
          )
            .toISOString()
            .split("T")[0]
        : ""
    );

    setTransport(
      production.transport || ""
    );

    setNotes(
      production.notes || ""
    );
  }, [open, production]);

  if (!open) return null;

  const updateItem = (
    index: number,
    changes: any
  ) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  };

  const changeBOM = (
    index: number,
    bomId: string
  ) => {
    const bom = boms.find(
      (entry: any) =>
        String(entry._id) ===
        String(bomId)
    );

    updateItem(index, {
      bom: bomId,
      product:
        bom?.finishedProduct?._id ||
        bom?.finishedProduct ||
        "",
      materialSelections: [],
    });
  };

  const removeItem = (
    index: number
  ) => {
    if (items.length <= 1) {
      alert(
        "A production order must contain at least one product."
      );
      return;
    }

    setItems((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        _id: undefined,
        product: "",
        bom: "",
        quantity: 1,
        materialSelections: [],
        checklist: {
          preparing: [],
          leaving: [],
          reason: "",
        },
        actualQuantity: null,
        completed: false,
        readyForDispatch: false,
        remarks: "",
      },
    ]);
  };

  const submit = async () => {
    if (!client) {
      alert("Select a client.");
      return;
    }

    if (!targetDate) {
      alert("Select a target date.");
      return;
    }

    if (
      items.length === 0 ||
      items.some(
        (item) =>
          !item.product ||
          !item.bom ||
          Number(item.quantity) <= 0
      )
    ) {
      alert(
        "Complete the BOM and quantity for every product."
      );
      return;
    }

    try {
      setSaving(true);

      await onSave({
        client,

        items: items.map(
          (item) => ({
            _id: item._id,

            product:
              item.product,

            bom:
              item.bom,

            quantity:
              Number(item.quantity),

            materialSelections:
              item.materialSelections ||
              [],

            checklist:
              item.checklist,

            actualQuantity:
              item.actualQuantity,

            completed:
              item.completed,

            readyForDispatch:
              item.readyForDispatch,

            remarks:
              item.remarks || "",
          })
        ),

        team:
          team.trim() ||
          "Unassigned",

        targetDate,

        transport:
          transport.trim(),

        notes:
          notes.trim(),
      });

      onClose();
    } catch (error) {
      console.error(error);
      alert(
        "Failed to update production order."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="border-b px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Edit Production Order
          </div>

          <div className="mt-1 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {production?.orderNumber}
              </h2>

              <p className="text-sm text-slate-500">
                Update order, products and production details.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-2xl text-slate-400 hover:text-slate-700"
            >
              ×
            </button>
          </div>
        </div>

        {/* BODY */}

        <div className="overflow-y-auto px-6 py-5">

          {/* CLIENT */}

          <section>
            <h3 className="font-semibold">
              Client
            </h3>

            <select
              value={client}
              onChange={(e) =>
                setClient(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-lg border px-3 py-2.5"
            >
              <option value="">
                Select client
              </option>

              {clients.map(
                (entry: any) => (
                  <option
                    key={entry._id}
                    value={entry._id}
                  >
                    {entry.name}
                  </option>
                )
              )}
            </select>
          </section>

          {/* PRODUCTS */}

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Products
                </h3>

                <p className="text-xs text-slate-500">
                  Edit every product independently.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-blue-700"
              >
                + Add Product
              </button>
            </div>

            <div className="space-y-4">
              {items.map(
                (
                  item,
                  index
                ) => {
                  const selectedBOM =
                    boms.find(
                      (bom: any) =>
                        String(
                          bom._id
                        ) ===
                        String(
                          item.bom
                        )
                    );

                  const materials =
                    selectedBOM?.materials ||
                    [];

                  return (
                    <div
                      key={
                        item._id ||
                        `new-${index}`
                      }
                      className="rounded-xl border p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 font-bold text-white">
                            {index + 1}
                          </div>

                          <div>
                            <div className="font-semibold">
                              Product{" "}
                              {index + 1}
                            </div>

                            {item.completed && (
                              <span className="text-xs text-green-600">
                                Already completed
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                          className="text-sm font-medium text-red-500"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_160px]">

                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            BOM
                          </label>

                          <select
                            value={
                              item.bom
                            }
                            onChange={(
                              e
                            ) =>
                              changeBOM(
                                index,
                                e.target
                                  .value
                              )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                          >
                            <option value="">
                              Select BOM
                            </option>

                            {boms.map(
                              (
                                bom: any
                              ) => (
                                <option
                                  key={
                                    bom._id
                                  }
                                  value={
                                    bom._id
                                  }
                                >
                                  {bom
                                    .finishedProduct
                                    ?.name ||
                                    "BOM"}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              item.quantity
                            }
                            onChange={(
                              e
                            ) =>
                              updateItem(
                                index,
                                {
                                  quantity:
                                    Number(
                                      e
                                        .target
                                        .value
                                    ),
                                }
                              )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                          />
                        </div>
                      </div>

                      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="text-slate-500">
                          Product:
                        </span>{" "}
                        <strong>
                          {selectedBOM
                            ?.finishedProduct
                            ?.name ||
                            "Select BOM"}
                        </strong>
                      </div>

                      {/* MATERIAL ALTERNATIVES */}

                      {materials.length >
                        0 && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                          <div className="mb-3">
                            <div className="text-sm font-semibold">
                              Optional Raw Material
                            </div>

                            <div className="text-xs text-slate-500">
                              Leave unchanged to use the BOM material.
                            </div>
                          </div>

                          <div className="space-y-3">
                            {materials.map(
                              (
                                material: any,
                                materialIndex: number
                              ) => {
                                const requiredId =
                                  material
                                    .product
                                    ?._id ||
                                  material.product;

                                const current =
                                  item.materialSelections?.find(
                                    (
                                      selection: any
                                    ) =>
                                      String(
                                        selection.requiredMaterial
                                      ) ===
                                      String(
                                        requiredId
                                      )
                                  );

                                return (
                                  <div
                                    key={
                                      materialIndex
                                    }
                                    className="grid gap-3 md:grid-cols-2"
                                  >
                                    <div className="rounded-lg border bg-white px-3 py-2">
                                      <div className="text-xs text-slate-500">
                                        BOM Material
                                      </div>

                                      <div className="font-medium">
                                        {material
                                          .product
                                          ?.name ||
                                          "Material"}
                                      </div>
                                    </div>

                                    <select
                                      value={
                                        current
                                          ?.selectedMaterial ||
                                        ""
                                      }
                                      onChange={(
                                        e
                                      ) => {
                                        const value =
                                          e
                                            .target
                                            .value;

                                        const selections =
                                          (
                                            item.materialSelections ||
                                            []
                                          ).filter(
                                            (
                                              selection: any
                                            ) =>
                                              String(
                                                selection.requiredMaterial
                                              ) !==
                                              String(
                                                requiredId
                                              )
                                          );

                                        if (
                                          value
                                        ) {
                                          selections.push(
                                            {
                                              requiredMaterial:
                                                requiredId,

                                              selectedMaterial:
                                                value,
                                            }
                                          );
                                        }

                                        updateItem(
                                          index,
                                          {
                                            materialSelections:
                                              selections,
                                          }
                                        );
                                      }}
                                      className="rounded-lg border bg-white px-3 py-2"
                                    >
                                      <option value="">
                                        Use BOM material
                                      </option>

                                      {rawProducts.map(
                                        (
                                          product: any
                                        ) => (
                                          <option
                                            key={
                                              product._id
                                            }
                                            value={
                                              product._id
                                            }
                                          >
                                            {
                                              product.name
                                            }{" "}
                                            (
                                            {
                                              product.currentStock ??
                                              0
                                            }{" "}
                                            available)
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </section>

          {/* SCHEDULE */}

          <section className="mt-6">
            <h3 className="font-semibold">
              Production Details
            </h3>

            <div className="mt-3 grid gap-4 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Team
                </label>

                <input
                  value={team}
                  onChange={(e) =>
                    setTeam(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Target Date
                </label>

                <input
                  type="date"
                  value={
                    targetDate
                  }
                  onChange={(e) =>
                    setTargetDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">
                Transport
              </label>

              <input
                value={
                  transport
                }
                onChange={(e) =>
                  setTransport(
                    e.target.value
                  )
                }
                placeholder="Transport / delivery information"
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">
                Notes
              </label>

              <textarea
                rows={3}
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border bg-white px-5 py-2"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={submit}
            className="rounded-lg bg-blue-900 px-5 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}