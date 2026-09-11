import { useEffect, useState } from "react";

import { uploadProductionImage } from "../services/production.services";

interface Props {
  open: boolean;
  customer: any;
  boms: any[];
  rawProducts: any[];
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

interface Item {
  product: string;
  bom: string;

  image: string;
  marka: string;
  category: string;
  price: number;
  importantNotes: string;

  quantity: number;
  materialSelections: any[];
}

const emptyItem = (): Item => ({
  product: "",
  bom: "",

  image: "",
  marka: "",
  category: "",
  price: 0,
  importantNotes: "",

  quantity: 1,
  materialSelections: [],
});

export default function ProductionCreateModal({
  open,
  customer,
  boms,
  rawProducts,
  onClose,
  onCreate,
}: Props) {
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

  const [saving, setSaving] =
    useState(false);

  const [uploadingIndex, setUploadingIndex] =
    useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    setItems([emptyItem()]);
    setTeam("");
    setTargetDate("");
    setTransport("");
    setNotes("");

    setSaving(false);
    setUploadingIndex(null);
  }, [open]);

  if (!open) return null;

  const customerName =
    customer?.companyName ||
    customer?.firmName ||
    customer?.name ||
    "Customer";

  const customerPhone =
    customer?.phone ||
    customer?.mobile ||
    customer?.contactNumber ||
    "";

  const customerContact =
    customer?.contactPerson ||
    customer?.contactName ||
    "";

  const customerId =
    customer?._id || customer?.id;

  const updateItem = (
    index: number,
    changes: Partial<Item>
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

  const selectBOM = (
    index: number,
    bomId: string
  ) => {
    const bom = boms.find(
      (entry: any) =>
        String(entry._id) ===
        String(bomId)
    );

    const product =
      bom?.finishedProduct;

    updateItem(index, {
      bom: bomId,

      product:
        product?._id ||
        product ||
        "",

      image:
        product?.image ||
        "",

      marka:
        product?.marka ||
        product?.brand ||
        "",

      category:
        typeof product?.category ===
        "object"
          ? product.category?.name || ""
          : product?.category || "",

      price:
        Number(
          product?.price ||
            product?.sellingPrice ||
            0
        ),

      importantNotes:
        product?.importantNotes ||
        product?.notes ||
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

  const handleImageUpload = async (
    index: number,
    file?: File
  ) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Image must be smaller than 5 MB."
      );
      return;
    }

    try {
      setUploadingIndex(index);

      const result =
        await uploadProductionImage(
          file
        );

      if (!result?.image) {
        throw new Error(
          "Image URL was not returned."
        );
      }

      updateItem(index, {
        image: result.image,
      });
    } catch (error) {
      console.error(error);

      alert(
        "Failed to upload product image."
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const submit = async () => {
    if (!customerId) {
      alert(
        "Customer information is missing."
      );
      return;
    }

    if (!targetDate) {
      alert(
        "Select a target date."
      );
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
        "Complete the BOM, product and quantity for every product."
      );
      return;
    }

    try {
      setSaving(true);

      await onCreate({
        /*
         * Customer comes directly from
         * the Customer Profile context.
         *
         * No customer selection happens
         * inside this modal.
         */
        client: customerId,

        /*
         * CRM customer is an AccountParty
         * in this workflow.
         */
        clientModel: "AccountParty",

        items: items.map(
          (item) => ({
            ...item,

            quantity:
              Number(
                item.quantity
              ),

            price:
              Number(
                item.price || 0
              ),
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
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-slate-950/50
        p-3 sm:p-5
        backdrop-blur-[2px]
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex max-h-[94vh] w-full max-w-6xl
          flex-col overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-2xl
        "
      >
        {/* Header */}

        <div
          className="
            flex items-start
            justify-between
            border-b border-slate-200
            px-5 py-4
            sm:px-6
          "
        >
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="
                flex h-10 w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-700
              "
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 7h18" />
                <path d="M6 3h12l1 4H5l1-4Z" />
                <path d="M5 7v13h14V7" />
                <path d="M9 11h6" />
              </svg>
            </div>

            <div className="min-w-0">
              <div
                className="
                  mb-0.5
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-blue-600
                "
              >
                CRM · Production
              </div>

              <h2
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-xl
                "
              >
                Create Production Order
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                  sm:text-sm
                "
              >
                Create a production order for
                this customer.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              ml-3
              flex h-8 w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-xl
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            ×
          </button>
        </div>

        {/* Body */}

        <div
          className="
            overflow-y-auto
            bg-slate-50/60
            px-4 py-5
            sm:px-6
          "
        >
          {/* Customer Context */}

          <section
            className="
              rounded-2xl
              border border-blue-100
              bg-blue-50/60
              p-4
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-10 w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-blue-700
                    shadow-sm
                  "
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-blue-600
                    "
                  >
                    Creating order for
                  </p>

                  <h3
                    className="
                      mt-0.5
                      truncate
                      text-sm
                      font-bold
                      text-slate-900
                      sm:text-base
                    "
                  >
                    {customerName}
                  </h3>

                  {(customerContact ||
                    customerPhone) && (
                    <p
                      className="
                        mt-0.5
                        truncate
                        text-[10px]
                        text-slate-500
                      "
                    >
                      {[
                        customerContact,
                        customerPhone,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </div>

              <span
                className="
                  w-fit
                  rounded-full
                  border
                  border-blue-100
                  bg-white
                  px-3 py-1.5
                  text-[10px]
                  font-bold
                  text-blue-700
                "
              >
                Customer Context
              </span>
            </div>
          </section>

          {/* Products */}

          <section className="mt-5">
            <div
              className="
                mb-3
                flex
                items-end
                justify-between
                gap-3
              "
            >
              <div>
                <h3
                  className="
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  Production Items
                </h3>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-500
                  "
                >
                  Add the products that need to
                  be manufactured.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-blue-200
                  bg-white
                  px-3 py-2
                  text-xs
                  font-bold
                  text-blue-700
                  transition
                  hover:bg-blue-50
                "
              >
                <span className="text-base leading-none">
                  +
                </span>
                Add Product
              </button>
            </div>

            <div className="space-y-4">
              {items.map(
                (item, index) => {
                  const selectedBOM =
                    boms.find(
                      (entry: any) =>
                        String(
                          entry._id
                        ) ===
                        String(
                          item.bom
                        )
                    );

                  const selectedProduct =
                    selectedBOM?.finishedProduct;

                  const materials =
                    selectedBOM?.materials ||
                    [];

                  return (
                    <div
                      key={index}
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                      "
                    >
                      {/* Item Header */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          border-b
                          border-slate-100
                          bg-slate-50/80
                          px-4 py-3
                        "
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              flex h-8 w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-900
                              text-xs
                              font-bold
                              text-white
                            "
                          >
                            {index + 1}
                          </div>

                          <div>
                            <div
                              className="
                                text-sm
                                font-bold
                                text-slate-800
                              "
                            >
                              Product {index + 1}
                            </div>

                            <div
                              className="
                                text-[11px]
                                text-slate-500
                              "
                            >
                              Product information
                              & production
                              requirements
                            </div>
                          </div>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            className="
                              rounded-lg
                              px-2.5 py-1.5
                              text-xs
                              font-semibold
                              text-red-500
                              transition
                              hover:bg-red-50
                            "
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="p-4">
                        {/* Product Selection */}

                        <div
                          className="
                            grid
                            gap-4
                            lg:grid-cols-[1.1fr_1fr_150px]
                          "
                        >
                          <div>
                            <label
                              className="
                                mb-1.5
                                block
                                text-xs
                                font-semibold
                                text-slate-700
                              "
                            >
                              BOM
                            </label>

                            <select
                              value={
                                item.bom
                              }
                              onChange={(
                                e
                              ) =>
                                selectBOM(
                                  index,
                                  e.target
                                    .value
                                )
                              }
                              className="
                                h-10
                                w-full
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                text-sm
                                outline-none
                                transition
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                              "
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
                            <label
                              className="
                                mb-1.5
                                block
                                text-xs
                                font-semibold
                                text-slate-700
                              "
                            >
                              Product
                            </label>

                            <div
                              className="
                                flex h-10
                                items-center
                                rounded-lg
                                border
                                border-slate-200
                                bg-slate-50
                                px-3
                                text-sm
                              "
                            >
                              <span
                                className={
                                  selectedProduct
                                    ? "font-semibold text-slate-800"
                                    : "text-slate-400"
                                }
                              >
                                {selectedProduct?.name ||
                                  "Select a BOM first"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label
                              className="
                                mb-1.5
                                block
                                text-xs
                                font-semibold
                                text-slate-700
                              "
                            >
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
                                        e.target
                                          .value
                                      ),
                                  }
                                )
                              }
                              className="
                                h-10
                                w-full
                                rounded-lg
                                border
                                border-slate-200
                                px-3
                                text-sm
                                outline-none
                                transition
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                              "
                            />
                          </div>
                        </div>

                        {/* Product Information */}

                        <div
                          className="
                            mt-5
                            border-t
                            border-slate-100
                            pt-5
                          "
                        >
                          <div className="mb-3">
                            <div
                              className="
                                text-xs
                                font-bold
                                uppercase
                                tracking-wider
                                text-slate-500
                              "
                            >
                              Product Information
                            </div>

                            <div
                              className="
                                mt-0.5
                                text-[11px]
                                text-slate-400
                              "
                            >
                              These details are
                              stored with the
                              production order.
                            </div>
                          </div>

                          <div
                            className="
                              grid
                              gap-4
                              lg:grid-cols-[190px_1fr]
                            "
                          >
                            {/* Image */}

                            <div>
                              <label
                                className="
                                  mb-1.5
                                  block
                                  text-xs
                                  font-semibold
                                  text-slate-700
                                "
                              >
                                Product Photo
                              </label>

                              <div
                                className="
                                  relative
                                  flex
                                  h-40
                                  w-full
                                  overflow-hidden
                                  rounded-xl
                                  border
                                  border-dashed
                                  border-slate-300
                                  bg-slate-50
                                "
                              >
                                {item.image ? (
                                  <>
                                    <img
                                      src={
                                        item.image
                                      }
                                      alt={
                                        selectedProduct?.name ||
                                        "Product"
                                      }
                                      className="
                                        h-full
                                        w-full
                                        object-cover
                                      "
                                    />

                                    <label
                                      className="
                                        absolute
                                        bottom-2
                                        right-2
                                        cursor-pointer
                                        rounded-lg
                                        bg-white/95
                                        px-2.5 py-1.5
                                        text-[11px]
                                        font-semibold
                                        text-slate-700
                                        shadow
                                      "
                                    >
                                      Change

                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(
                                          e
                                        ) =>
                                          handleImageUpload(
                                            index,
                                            e
                                              .target
                                              .files?.[0]
                                          )
                                        }
                                      />
                                    </label>
                                  </>
                                ) : (
                                  <label
                                    className="
                                      flex
                                      h-full
                                      w-full
                                      cursor-pointer
                                      flex-col
                                      items-center
                                      justify-center
                                      gap-2
                                      text-center
                                    "
                                  >
                                    <div
                                      className="
                                        flex h-9 w-9
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-white
                                        text-slate-400
                                        shadow-sm
                                      "
                                    >
                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <rect
                                          x="3"
                                          y="3"
                                          width="18"
                                          height="18"
                                          rx="2"
                                        />
                                        <circle
                                          cx="8.5"
                                          cy="8.5"
                                          r="1.5"
                                        />
                                        <path d="m21 15-5-5L5 21" />
                                      </svg>
                                    </div>

                                    <span
                                      className="
                                        text-xs
                                        font-semibold
                                        text-slate-600
                                      "
                                    >
                                      {uploadingIndex ===
                                      index
                                        ? "Uploading..."
                                        : "Upload photo"}
                                    </span>

                                    <span
                                      className="
                                        text-[10px]
                                        text-slate-400
                                      "
                                    >
                                      PNG, JPG ·
                                      max 5 MB
                                    </span>

                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={
                                        uploadingIndex ===
                                        index
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        handleImageUpload(
                                          index,
                                          e
                                            .target
                                            .files?.[0]
                                        )
                                      }
                                    />
                                  </label>
                                )}
                              </div>
                            </div>

                            {/* Fields */}

                            <div
                              className="
                                grid
                                gap-4
                                sm:grid-cols-2
                              "
                            >
                              <div>
                                <label
                                  className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                  "
                                >
                                  Marka
                                </label>

                                <input
                                  value={
                                    item.marka
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateItem(
                                      index,
                                      {
                                        marka:
                                          e
                                            .target
                                            .value,
                                      }
                                    )
                                  }
                                  placeholder="Enter marka / brand"
                                  className="
                                    h-10
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-200
                                    px-3
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                  "
                                />
                              </div>

                              <div>
                                <label
                                  className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                  "
                                >
                                  Category
                                </label>

                                <input
                                  value={
                                    item.category
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateItem(
                                      index,
                                      {
                                        category:
                                          e
                                            .target
                                            .value,
                                      }
                                    )
                                  }
                                  placeholder="Product category"
                                  className="
                                    h-10
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-200
                                    px-3
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                  "
                                />
                              </div>

                              <div>
                                <label
                                  className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                  "
                                >
                                  Price
                                </label>

                                <div className="relative">
                                  <span
                                    className="
                                      absolute
                                      left-3
                                      top-1/2
                                      -translate-y-1/2
                                      text-xs
                                      font-semibold
                                      text-slate-400
                                    "
                                  >
                                    ₹
                                  </span>

                                  <input
                                    type="number"
                                    min="0"
                                    value={
                                      item.price
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateItem(
                                        index,
                                        {
                                          price:
                                            Number(
                                              e
                                                .target
                                                .value
                                            ),
                                        }
                                      )
                                    }
                                    placeholder="0"
                                    className="
                                      h-10
                                      w-full
                                      rounded-lg
                                      border
                                      border-slate-200
                                      pl-7 pr-3
                                      text-sm
                                      outline-none
                                      transition
                                      focus:border-blue-500
                                      focus:ring-2
                                      focus:ring-blue-100
                                    "
                                  />
                                </div>
                              </div>

                              <div>
                                <label
                                  className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                  "
                                >
                                  Product SKU
                                </label>

                                <div
                                  className="
                                    flex h-10
                                    items-center
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-3
                                    text-sm
                                    text-slate-600
                                  "
                                >
                                  {selectedProduct?.sku ||
                                    "—"}
                                </div>
                              </div>

                              <div className="sm:col-span-2">
                                <label
                                  className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                  "
                                >
                                  Important Notes
                                </label>

                                <textarea
                                  value={
                                    item.importantNotes
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateItem(
                                      index,
                                      {
                                        importantNotes:
                                          e
                                            .target
                                            .value,
                                      }
                                    )
                                  }
                                  rows={2}
                                  placeholder="Special product instructions, packaging requirements, colour, finish, etc."
                                  className="
                                    w-full
                                    resize-none
                                    rounded-lg
                                    border
                                    border-slate-200
                                    px-3 py-2.5
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                  "
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Materials */}

                        {materials.length > 0 && (
                          <div
                            className="
                              mt-5
                              border-t
                              border-slate-100
                              pt-5
                            "
                          >
                            <div className="mb-3">
                              <div
                                className="
                                  text-xs
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  text-slate-500
                                "
                              >
                                Raw Material Selection
                              </div>

                              <div
                                className="
                                  mt-0.5
                                  text-[11px]
                                  text-slate-400
                                "
                              >
                                Optional. Leave
                                unchanged to use
                                the BOM material.
                              </div>
                            </div>

                            <div className="space-y-2">
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
                                    item.materialSelections.find(
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
                                      className="
                                        grid
                                        gap-2
                                        rounded-xl
                                        border
                                        border-slate-100
                                        bg-slate-50
                                        p-3
                                        md:grid-cols-2
                                      "
                                    >
                                      <div
                                        className="
                                          flex
                                          items-center
                                          rounded-lg
                                          bg-white
                                          px-3 py-2
                                        "
                                      >
                                        <div>
                                          <div
                                            className="
                                              text-[10px]
                                              uppercase
                                              tracking-wider
                                              text-slate-400
                                            "
                                          >
                                            BOM Material
                                          </div>

                                          <div
                                            className="
                                              text-sm
                                              font-semibold
                                              text-slate-700
                                            "
                                          >
                                            {material
                                              .product
                                              ?.name ||
                                              "Material"}
                                          </div>
                                        </div>
                                      </div>

                                      <select
                                        value={
                                          current?.selectedMaterial ||
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
                                        className="
                                          h-10
                                          rounded-lg
                                          border
                                          border-slate-200
                                          bg-white
                                          px-3
                                          text-sm
                                          outline-none
                                          focus:border-blue-500
                                        "
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
                                              {product.currentStock ??
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
                    </div>
                  );
                }
              )}
            </div>
          </section>

          {/* Schedule */}

          <section
            className="
              mt-5
              rounded-2xl
              border border-slate-200
              bg-white
              p-4
              shadow-sm
            "
          >
            <div className="mb-4">
              <h3
                className="
                  text-sm
                  font-bold
                  text-slate-900
                "
              >
                Production Schedule
              </h3>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                Set the production deadline and
                operational instructions.
              </p>
            </div>

            <div
              className="
                grid
                gap-4
                md:grid-cols-3
              "
            >
              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-slate-700
                  "
                >
                  Target Date *
                </label>

                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) =>
                    setTargetDate(
                      e.target.value
                    )
                  }
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-slate-700
                  "
                >
                  Team
                </label>

                <input
                  value={team}
                  onChange={(e) =>
                    setTeam(
                      e.target.value
                    )
                  }
                  placeholder="Production team"
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-slate-700
                  "
                >
                  Transport
                </label>

                <input
                  value={transport}
                  onChange={(e) =>
                    setTransport(
                      e.target.value
                    )
                  }
                  placeholder="Transport / delivery"
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                "
              >
                Order Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="General production instructions, packaging instructions, deadlines or other important information..."
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-slate-200
                  px-3 py-2.5
                  text-sm
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />
            </div>
          </section>
        </div>

        {/* Footer */}

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-slate-200
            bg-white
            px-4 py-3
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
          "
        >
          <div
            className="
              text-[11px]
              text-slate-400
            "
          >
            Order for{" "}
            <span className="font-semibold text-slate-600">
              {customerName}
            </span>{" "}
            · {items.length}{" "}
            {items.length === 1
              ? "product"
              : "products"}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                rounded-lg
                border border-slate-200
                bg-white
                px-4 py-2
                text-xs
                font-semibold
                text-slate-700
                transition
                hover:bg-slate-50
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                saving ||
                uploadingIndex !== null
              }
              onClick={submit}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-slate-900
                px-5 py-2
                text-xs
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving ? (
                <>
                  <span
                    className="
                      h-3.5 w-3.5
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Creating...
                </>
              ) : (
                <>
                  Create Production Order
                  <span className="text-sm">
                    →
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}