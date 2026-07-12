import { useEffect, useState } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getBOMs,
  createBOM,
  updateBOM,
  deleteBOM,
} from "../services/bom.service";

import { getProducts } from "../../inventory/services/product.service";

const BOMPage = () => {
  const [boms, setBoms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedBOM, setSelectedBOM] =
    useState<any>(null);

  const [finishedProduct, setFinishedProduct] =
    useState("");

  const [materials, setMaterials] = useState([
  {
    product: "",
    quantity: 1,
  },
]);

const [isEditing, setIsEditing] =
  useState(false);

  const loadData = async () => {
    try {
      const [bomData, productData] =
        await Promise.all([
          getBOMs(),
          getProducts(),
        ]);

      setBoms(bomData);
      console.log(boms)
      setProducts(productData);

      if (bomData.length > 0) {
        setSelectedBOM(bomData[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addMaterial = () => {
  setMaterials([
    ...materials,
    {
      product: "",
      quantity: 1,
    },
  ]);
};

const updateMaterial = (
  index: number,
  field: "product" | "quantity",
  value: string | number
) => {
  const updated = [...materials];

  updated[index] = {
    ...updated[index],
    [field]: value,
  };

  setMaterials(updated);
};

const handleCreateBOM = async () => {
  if (!finishedProduct) {
  alert("Please select a finished product.");
  return;
}

if (
  materials.length === 0 ||
  materials.some(
    (item) => !item.product || item.quantity <= 0
  )
) {
  alert("Please add valid materials.");
  return;
}

const materialIds = materials.map(
  (m) => m.product
);

if (
  new Set(materialIds).size !==
  materialIds.length
) {
  alert(
    "Duplicate materials are not allowed."
  );
  return;
}
  try {
    if (isEditing) {
  await updateBOM(
    selectedBOM._id,
    {
      finishedProduct,
      materials,
    }
  );

  setIsEditing(false);

} else {

  await createBOM({
    finishedProduct,
    materials,
  });

}

    setFinishedProduct("");

    setMaterials([
      {
        product: "",
        quantity: 0,
      },
    ]);

    loadData();
  } catch (error) {
    console.error(error);
  }
};

const handleDeleteBOM = async (id: string) => {
  const confirmed = window.confirm(
    "Delete this BOM?"
  );

  if (!confirmed) return;

  try {
    await deleteBOM(id);

    setSelectedBOM(null);

    loadData();

  } catch (error) {
    console.error(error);
  }
};

  return (
  <AdminLayout>

    <div className="mx-auto w-full max-w-[1450px] space-y-8">

      {/* ===================== PAGE HEADER ===================== */}

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">

        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Admin &gt; BOM
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              Bill of Materials
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create and manage manufacturing recipes for finished products.
            </p>

          </div>

        </div>

      </div>

      {/* ===================== CREATE BOM ===================== */}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-6">

          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? "Update BOM" : "Create New BOM"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a finished product and assign the raw materials required to manufacture it.
          </p>

        </div>

        <div className="space-y-6 p-6">

          {/* Finished Product */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Finished Product
            </label>

            <select
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                text-sm
                outline-none
                transition
                focus:border-[#172B6B]
                focus:ring-4
                focus:ring-blue-100
              "
              value={finishedProduct}
              onChange={(e) =>
                setFinishedProduct(e.target.value)
              }
            >
              <option value="">
                Select Finished Product
              </option>

              {products
                .filter((product) => {
                  if (product.type !== "FINISHED")
                    return false;

                  const alreadyHasBOM =
                    boms.some(
                      (bom) =>
                        bom.finishedProduct?._id ===
                        product._id
                    );

                  return (
                    isEditing || !alreadyHasBOM
                  );
                })
                .map((product) => (
                  <option
                    key={product._id}
                    value={product._id}
                  >
                    {product.name}
                  </option>
                ))}
            </select>

          </div>

          {/* Materials */}

          <div>

            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              Raw Materials
            </h3>

            <div className="space-y-4">

              {materials.map(
                (material, index) => (

                  <div
                    key={index}
                    className="
                      grid
                      gap-4
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-50
                      p-4
                      lg:grid-cols-[1fr_140px]
                    "
                  >

                    <select
                      className="
                        h-12
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        text-sm
                        outline-none
                        transition
                        focus:border-[#172B6B]
                        focus:ring-4
                        focus:ring-blue-100
                      "
                      value={material.product}
                      onChange={(e) =>
                        updateMaterial(
                          index,
                          "product",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Material
                      </option>

                      {products
                        .filter(
                          (product) =>
                            product.type === "RAW"
                        )
                        .map((product) => (
                          <option
                            key={product._id}
                            value={product._id}
                          >
                            {product.name}
                          </option>
                        ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      value={material.quantity}
                      onChange={(e) =>
                        updateMaterial(
                          index,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                      className="
                        h-12
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        text-sm
                        outline-none
                        transition
                        focus:border-[#172B6B]
                        focus:ring-4
                        focus:ring-blue-100
                      "
                    />

                  </div>

                )
              )}

            </div>

          </div>

          {/* Buttons */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              onClick={addMaterial}
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                border
                border-slate-300
                bg-white
                px-5
                py-3
                text-sm
                font-semibold
                transition
                hover:bg-slate-50
              "
            >
              + Add Material
            </button>

            <button
              onClick={handleCreateBOM}
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-[#172B6B]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#20398F]
              "
            >
              {isEditing
                ? "Update BOM"
                : "Create BOM"}
            </button>

          </div>

        </div>

      </div>

      {/* ===================== BOM GRID ===================== */}

      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        {/* ===================== BOM LIST ===================== */}

<div className="space-y-5">

  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

    <div className="border-b border-slate-200 px-6 py-5">

      <h2 className="text-xl font-bold text-slate-900">
        Existing BOMs
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Select a Bill of Materials to view or edit.
      </p>

    </div>

    <div className="space-y-4 p-5">

      {boms.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No BOMs have been created yet.
        </div>

      ) : (

        boms.map((bom) => (

          <div
            key={bom._id}
            onClick={() => setSelectedBOM(bom)}
            className={`
              cursor-pointer
              rounded-2xl
              border
              p-5
              transition-all
              duration-200
              ${
                selectedBOM?._id === bom._id
                  ? "border-[#172B6B] bg-blue-50 shadow-md ring-2 ring-blue-100"
                  : "border-slate-200 bg-white hover:border-[#172B6B]/40 hover:shadow"
              }
            `}
          >

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0 flex-1">

                <h3 className="truncate text-lg font-semibold text-slate-900">
                  {bom.finishedProduct?.name ||
                    "Deleted Product"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {bom.materials.length} material
                  {bom.materials.length !== 1 && "s"}
                </p>

              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBOM(bom._id);
                }}
                className="
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-red-600
                  transition
                  hover:bg-red-100
                "
              >
                Delete
              </button>

            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Bill of Materials
              </span>

              {selectedBOM?._id === bom._id && (
                <span className="rounded-full bg-[#172B6B] px-3 py-1 text-xs font-semibold text-white">
                  Selected
                </span>
              )}

            </div>

          </div>

        ))

      )}

    </div>

  </div>

</div>

{/* ===================== DETAILS ===================== */}

{/* ===================== BOM DETAILS ===================== */}

<div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

  {selectedBOM ? (

    <>

      <div className="flex flex-col gap-5 border-b border-slate-200 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-sm text-slate-500">
            Bill of Materials
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {selectedBOM.finishedProduct?.name}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {selectedBOM.materials.length} material
            {selectedBOM.materials.length !== 1 && "s"} required for production.
          </p>

        </div>

        <button
          onClick={() => {
            setIsEditing(true);

            setFinishedProduct(
              selectedBOM.finishedProduct._id
            );

            setMaterials(
              selectedBOM.materials.map((item: any) => ({
                product: item.product._id,
                quantity: item.quantity,
              }))
            );
          }}
          className="
            inline-flex
            items-center
            justify-center
            rounded-xl
            bg-[#172B6B]
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#20398F]
          "
        >
          Edit BOM
        </button>

      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2">

        {selectedBOM.materials.map(
          (item: any, index: number) => (

            <div
              key={index}
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-lg font-semibold text-slate-900">
                    {item.product?.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Available Stock
                  </p>

                  <p className="font-semibold text-slate-700">
                    {item.product?.currentStock} {item.product?.unit}
                  </p>

                </div>

                <div className="text-right">

                  <div className="text-3xl font-bold text-[#172B6B]">
                    ×{item.quantity}
                  </div>

                  <p className="text-xs text-slate-500">
                    {item.product?.unit}/unit
                  </p>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </>

  ) : (

    <div className="flex min-h-[500px] items-center justify-center p-10">

      <div className="text-center">

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl">
          📦
        </div>

        <h3 className="text-2xl font-semibold text-slate-700">
          No BOM Selected
        </h3>

        <p className="mt-2 text-slate-500">
          Select a Bill of Materials from the left to view its details.
        </p>

      </div>

    </div>

  )}

</div>

</div>

</div>

</AdminLayout>
  );
  
};

export default BOMPage;