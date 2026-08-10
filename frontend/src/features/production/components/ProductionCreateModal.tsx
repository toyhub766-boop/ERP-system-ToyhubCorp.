import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  clients: any[];
  boms: any[];
  rawProducts: any[];
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
  onCreateClient: (data: any) => Promise<any>;
}

interface Item {
  product: string;
  bom: string;
  quantity: number;
  materialSelections: any[];
}

const today = () =>
  new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const emptyItem = (): Item => ({
  product: "",
  bom: "",
  quantity: 1,
  materialSelections: [],
});

export default function ProductionCreateModal({
  open,
  clients,
  boms,
  rawProducts,
  onClose,
  onCreate,
  onCreateClient,
}: Props) {
  const [client, setClient] = useState("");
  const [items, setItems] = useState<Item[]>([
    emptyItem(),
  ]);

  const [team, setTeam] = useState("");
  const [targetDate, setTargetDate] =
    useState("");

  const [transport, setTransport] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [showNewClient, setShowNewClient] =
    useState(false);

  const [newClientName, setNewClientName] =
    useState("");

  const [newClientPhone, setNewClientPhone] =
    useState("");

  const [newClientContact, setNewClientContact] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    setClient("");
    setItems([emptyItem()]);
    setTeam("");
    setTargetDate("");
    setTransport("");
    setNotes("");
    setShowNewClient(false);
    setNewClientName("");
    setNewClientPhone("");
    setNewClientContact("");
  }, [open]);

  if (!open) return null;

  const updateItem = (
    index: number,
    changes: Partial<Item>
  ) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, ...changes }
          : item
      )
    );
  };

  const selectBOM = (
    index: number,
    bomId: string
  ) => {
    const bom = boms.find(
      (entry: any) =>
        String(entry._id) === String(bomId)
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

  const addItem = () => {
    setItems((current) => [
      ...current,
      emptyItem(),
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;

    setItems((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  const createClient = async () => {
    if (!newClientName.trim()) {
      alert("Client name is required.");
      return;
    }

    try {
      const created =
        await onCreateClient({
          name: newClientName.trim(),
          phone: newClientPhone,
          contactPerson:
            newClientContact,
        });

      setClient(created._id);
      setShowNewClient(false);
      setNewClientName("");
      setNewClientPhone("");
      setNewClientContact("");
    } catch (error) {
      console.error(error);
      alert("Failed to create client.");
    }
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
      items.some(
        (item) =>
          !item.bom ||
          !item.product ||
          item.quantity <= 0
      )
    ) {
      alert(
        "Complete the BOM and quantity for every product."
      );
      return;
    }

    try {
      setSaving(true);

      await onCreate({
        client,
        items,
        team:
          team.trim() || "Unassigned",
        targetDate,
        transport,
        notes,
      });

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="border-b px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-500">
            Production
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Create Production Order
              </h2>

              <p className="text-sm text-slate-500">
                Create one order for a client with multiple products.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-2xl text-slate-400"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-5">

          {/* CLIENT */}

          <section>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Client
                </h3>

                <p className="text-xs text-slate-500">
                  Who is this production order for?
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowNewClient(
                    (value) => !value
                  )
                }
                className="rounded-lg border px-3 py-1.5 text-sm font-medium"
              >
                + New Client
              </button>
            </div>

            {showNewClient ? (
              <div className="mb-4 grid gap-3 rounded-xl border bg-slate-50 p-4 md:grid-cols-3">
                <input
                  value={newClientName}
                  onChange={(e) =>
                    setNewClientName(
                      e.target.value
                    )
                  }
                  placeholder="Client name *"
                  className="rounded-lg border px-3 py-2"
                />

                <input
                  value={newClientContact}
                  onChange={(e) =>
                    setNewClientContact(
                      e.target.value
                    )
                  }
                  placeholder="Contact person"
                  className="rounded-lg border px-3 py-2"
                />

                <input
                  value={newClientPhone}
                  onChange={(e) =>
                    setNewClientPhone(
                      e.target.value
                    )
                  }
                  placeholder="Phone"
                  className="rounded-lg border px-3 py-2"
                />

                <button
                  type="button"
                  onClick={createClient}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:col-span-3"
                >
                  Save Client
                </button>
              </div>
            ) : null}

            <select
              value={client}
              onChange={(e) =>
                setClient(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2.5"
            >
              <option value="">
                Select client
              </option>

              {clients.map((entry: any) => (
                <option
                  key={entry._id}
                  value={entry._id}
                >
                  {entry.name}
                </option>
              ))}
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
                  Add every product included in this client's order.
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
              {items.map((item, index) => {
                const selectedBOM =
                  boms.find(
                    (entry: any) =>
                      String(entry._id) ===
                      String(item.bom)
                  );

                const materials =
                  selectedBOM?.materials || [];

                return (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 font-bold text-white">
                          {index + 1}
                        </div>

                        <div>
                          <div className="font-semibold">
                            Product {index + 1}
                          </div>

                          <div className="text-xs text-slate-500">
                            Select BOM and production quantity
                          </div>
                        </div>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(index)
                          }
                          className="text-sm font-medium text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_140px]">

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          BOM
                        </label>

                        <select
                          value={item.bom}
                          onChange={(e) =>
                            selectBOM(
                              index,
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border px-3 py-2"
                        >
                          <option value="">
                            Select BOM
                          </option>

                          {boms.map(
                            (bom: any) => (
                              <option
                                key={bom._id}
                                value={bom._id}
                              >
                                {bom.finishedProduct?.name ||
                                  "BOM"}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Product
                        </label>

                        <div className="rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                          {selectedBOM
                            ?.finishedProduct
                            ?.name ||
                            "Select a BOM"}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              {
                                quantity:
                                  Number(
                                    e.target
                                      .value
                                  ),
                              }
                            )
                          }
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      </div>
                    </div>

                    {/* OPTIONAL MATERIALS */}

                    {materials.length > 0 && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4">
                        <div className="mb-3">
                          <div className="text-sm font-semibold">
                            Optional Raw Material Selection
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
                              const current =
                                item.materialSelections.find(
                                  (
                                    selection: any
                                  ) =>
                                    String(
                                      selection.requiredMaterial
                                    ) ===
                                    String(
                                      material.product?._id ||
                                        material.product
                                    )
                                );

                              const requiredId =
                                material.product?._id ||
                                material.product;

                              return (
                                <div
                                  key={
                                    materialIndex
                                  }
                                  className="grid gap-3 md:grid-cols-2"
                                >
                                  <div className="rounded-lg border bg-white px-3 py-2">
                                    <div className="text-xs text-slate-500">
                                      BOM material
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
                                        e.target
                                          .value;

                                      const selections =
                                        item.materialSelections.filter(
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
                                          ({product.currentStock ??
                                            0}{" "}
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
              })}
            </div>
          </section>

          {/* SCHEDULE */}

          <section className="mt-6">
            <h3 className="font-semibold">
              Production Schedule
            </h3>

            <p className="mb-3 text-xs text-slate-500">
              Created date is recorded automatically by the system.
            </p>

            <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-500">
                Created Date:
              </span>{" "}
              <strong>{today()}</strong>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Team
                </label>

                <input
                  value={team}
                  onChange={(e) =>
                    setTeam(e.target.value)
                  }
                  placeholder="Production team"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Target Date
                </label>

                <input
                  type="date"
                  value={targetDate}
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
                value={transport}
                onChange={(e) =>
                  setTransport(
                    e.target.value
                  )
                }
                placeholder="Optional transport / delivery information"
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                rows={3}
                placeholder="Production notes or special instructions..."
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </section>
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
            onClick={submit}
            className="rounded-lg bg-blue-900 px-5 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Creating..."
              : "Create Production Order"}
          </button>
        </div>
      </div>
    </div>
  );
}