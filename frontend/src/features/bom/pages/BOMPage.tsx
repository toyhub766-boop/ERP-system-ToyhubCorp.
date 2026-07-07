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
    <div>
    <div className="bg-white rounded-xl border p-6 mb-6">

  <h2 className="font-semibold mb-4">
    Create New BOM
  </h2>

  <select
    className="w-full border rounded-lg p-3 mb-4"
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
    if (product.type !== "FINISHED") return false;

    const alreadyHasBOM = boms.some(
      (bom) =>
        bom.finishedProduct?._id === product._id
    );

    return !alreadyHasBOM;
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

  {materials.map((material, index) => (

    <div
      key={index}
      className="flex gap-3 mb-3"
    >

      <select
        className="flex-1 border rounded-lg p-3"
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
    (product) => product.type === "RAW"
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
        className="w-32 border rounded-lg p-3"
        value={material.quantity}
        onChange={(e) =>
          updateMaterial(
            index,
            "quantity",
            Number(e.target.value)
          )
        }
      />

    </div>

  ))}

  <div className="flex gap-3 mt-4">

    <button
      onClick={addMaterial}
      className="px-4 py-2 rounded-lg bg-gray-200"
    >
      + Add Material
    </button>

    <button
      onClick={handleCreateBOM}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white"
    >
      {isEditing ? "Update BOM" : "Create BOM"}
    </button>

  </div>

</div>

<div className="grid grid-cols-2 gap-6">

  {/* LEFT */}

  <div className="space-y-4">

    {boms.map((bom) => (

      <div
        key={bom._id}
        onClick={() => setSelectedBOM(bom)}
        className={`border rounded-2xl p-5 cursor-pointer transition
          ${
            selectedBOM?._id === bom._id
              ? "border-[#17357A] ring-2 ring-[#17357A]/20"
              : "hover:border-slate-300"
          }`}
      >

        <h3 className="font-semibold text-lg">
          {bom.finishedProduct?.name || "Deleted Product"}
        </h3>

        <p className="text-slate-500 text-sm">
          {bom.materials.length} materials
        </p>

         <button
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteBOM(bom._id);
    }}
    className="text-red-500 hover:text-red-700"
  >
    🗑
  </button>

      </div>

    ))}

  </div>

  {/* RIGHT */}

  <div className="border rounded-2xl p-6">

  {selectedBOM ? (
    <>

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-bold">
            {selectedBOM.finishedProduct?.name}
          </h2>

          <p className="text-slate-500 text-sm">
            Bill of Materials
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
  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
>
  Edit
</button>

      </div>

      <div className="space-y-4">

        {selectedBOM.materials.map(
          (item: any, index: number) => (

            <div
              key={index}
              className="border rounded-xl p-4 flex justify-between items-center"
            >

              <div>

                <h3 className="font-semibold">
                  {item.product?.name}
                </h3>

                <p className="text-sm text-slate-500">
                  Available: {item.product?.currentStock} {item.product?.unit}
                </p>

              </div>

              <div className="text-right">

                <p className="text-xl font-bold text-[#17357A]">
                  ×{item.quantity}
                </p>

                <p className="text-xs text-slate-500">
                  {item.product?.unit}/unit
                </p>

              </div>

            </div>

          )
        )}

      </div>

    </>
  ) : (

    <div className="h-full flex items-center justify-center text-slate-400">
      Select a BOM to view details
    </div>

  )}

</div>

</div>
</div>
</AdminLayout>
  );

  
};

export default BOMPage;