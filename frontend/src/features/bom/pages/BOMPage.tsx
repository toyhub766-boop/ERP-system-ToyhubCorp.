import { useEffect, useState } from "react";
import {
  FiBox,
  FiChevronRight,
  FiDownload,
  FiEdit3,
  FiFileText,
  FiLayers,
  FiPlus,
  FiTrash2,
  FiPackage,
  FiCheckCircle,
} from "react-icons/fi";

import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getBOMs,
  createBOM,
  updateBOM,
  deleteBOM,
} from "../services/bom.service";

import { getProducts } from "../../inventory/services/product.service";

import { exportBOMExcel } from "../../../utils/exportBOMExcel";
import { exportBOMPdf } from "../../../utils/exportBOMPdf";


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


  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = async () => {
    try {
      const [bomData, productData] =
        await Promise.all([
          getBOMs(),
          getProducts(),
        ]);

      setBoms(bomData);
      setProducts(productData);

      if (bomData.length > 0) {
        setSelectedBOM(bomData[0]);
      } else {
        setSelectedBOM(null);
      }
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  /* =========================================================
     MATERIALS
  ========================================================= */

  const addMaterial = () => {
    setMaterials((current) => [
      ...current,
      {
        product: "",
        quantity: 1,
      },
    ]);
  };


  const removeMaterial = (index: number) => {
    setMaterials((current) =>
      current.filter((_, i) => i !== index)
    );
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


  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  const handleCreateBOM = async () => {
    if (!finishedProduct) {
      alert("Please select a finished product.");
      return;
    }

    if (
      materials.length === 0 ||
      materials.some(
        (item) =>
          !item.product ||
          item.quantity <= 0
      )
    ) {
      alert("Please add valid materials.");
      return;
    }

    const materialIds =
      materials.map(
        (material) => material.product
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
          quantity: 1,
        },
      ]);

      setIsEditing(false);

      await loadData();

    } catch (error) {
      console.error(error);
    }
  };


  /* =========================================================
     DELETE
  ========================================================= */

  const handleDeleteBOM = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Delete this BOM?"
      );

    if (!confirmed) return;

    try {
      await deleteBOM(id);

      setSelectedBOM(null);

      await loadData();

    } catch (error) {
      console.error(error);
    }
  };


  /* =========================================================
     EDIT
  ========================================================= */

  const handleEditBOM = (
    bom: any
  ) => {
    setIsEditing(true);

    setFinishedProduct(
      bom.finishedProduct._id
    );

    setMaterials(
      bom.materials.map(
        (item: any) => ({
          product:
            item.product._id,
          quantity:
            item.quantity,
        })
      )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  return (
    <AdminLayout>

      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-4
          py-6
          sm:px-6
          sm:py-8
          lg:px-8
          lg:py-10
        "
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            mb-8
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          <div>

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
                text-xs
                font-medium
                text-slate-400
              "
            >
              <span>Admin</span>

              <FiChevronRight
                size={13}
              />

              <span className="text-slate-600">
                BOM Management
              </span>
            </div>


            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#172B6B]
                  text-white
                  shadow-sm
                "
              >
                <FiLayers size={20} />
              </div>

              <div>

                <h1
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                  "
                >
                  Bill of Materials
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Define the materials and quantities
                  required to manufacture finished products.
                </p>

              </div>

            </div>

          </div>


          {/* EXPORT */}

          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
            "
          >

            <button
              type="button"
              onClick={() =>
                exportBOMExcel(
                  boms,
                  "BOM_Report"
                )
              }
              disabled={
                boms.length === 0
              }
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-700
                shadow-sm
                transition-all
                hover:border-slate-300
                hover:bg-slate-50
                hover:shadow
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FiDownload size={16} />

              Excel
            </button>


            <button
              type="button"
              onClick={() =>
                exportBOMPdf(
                  boms,
                  "BOM Report"
                )
              }
              disabled={
                boms.length === 0
              }
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#172B6B]
                px-4
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                hover:bg-[#20398F]
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FiFileText size={16} />

              PDF
            </button>

          </div>

        </div>


        {/* =====================================================
            CREATE / UPDATE
        ===================================================== */}

        <section
          className="
            mb-8
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          "
        >

          <div
            className="
              border-b
              border-slate-100
              px-5
              py-5
              sm:px-7
              sm:py-6
            "
          >

            <div className="flex items-start gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-[#172B6B]
                "
              >
                {isEditing ? (
                  <FiEdit3 size={18} />
                ) : (
                  <FiPlus size={19} />
                )}
              </div>

              <div>

                <h2
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                  "
                >
                  {isEditing
                    ? "Update BOM"
                    : "Create New BOM"}
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  {isEditing
                    ? "Modify the manufacturing recipe and material quantities."
                    : "Create a manufacturing recipe for a finished product."}
                </p>

              </div>

            </div>

          </div>


          <div
            className="
              space-y-7
              p-5
              sm:p-7
            "
          >

            {/* FINISHED PRODUCT */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Finished Product
              </label>

              <select
                value={finishedProduct}
                onChange={(e) =>
                  setFinishedProduct(
                    e.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  text-slate-800
                  outline-none
                  transition-all
                  focus:border-[#172B6B]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-50
                "
              >

                <option value="">
                  Select Finished Product
                </option>

                {products
                  .filter(
                    (product) => {
                      if (
                        product.type !==
                        "FINISHED"
                      ) {
                        return false;
                      }

                      const alreadyHasBOM =
                        boms.some(
                          (bom) =>
                            bom
                              .finishedProduct
                              ?._id ===
                            product._id
                        );

                      return (
                        isEditing ||
                        !alreadyHasBOM
                      );
                    }
                  )
                  .map(
                    (product) => (
                      <option
                        key={
                          product._id
                        }
                        value={
                          product._id
                        }
                      >
                        {product.name}
                      </option>
                    )
                  )}

              </select>

            </div>


            {/* MATERIALS */}

            <div>

              <div
                className="
                  mb-4
                  flex
                  flex-col
                  gap-2
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
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
                    Raw Materials
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    Define the quantity of each
                    material required per unit.
                  </p>

                </div>

                <span
                  className="
                    inline-flex
                    w-fit
                    rounded-full
                    bg-slate-100
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-slate-600
                  "
                >
                  {materials.length}{" "}
                  {materials.length === 1
                    ? "material"
                    : "materials"}
                </span>

              </div>


              <div className="space-y-3">

                {materials.map(
                  (
                    material,
                    index
                  ) => (

                    <div
                      key={index}
                      className="
                        group
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50/70
                        p-3
                        transition-all
                        duration-200
                        hover:border-slate-300
                        hover:bg-slate-50
                      "
                    >

                      <div
                        className="
                          grid
                          gap-3
                          lg:grid-cols-[1fr_160px_auto]
                        "
                      >

                        {/* MATERIAL */}

                        <div>

                          <label
                            className="
                              mb-1.5
                              block
                              px-1
                              text-[11px]
                              font-semibold
                              uppercase
                              tracking-wide
                              text-slate-400
                            "
                          >
                            Material
                          </label>

                          <select
                            value={
                              material.product
                            }
                            onChange={(
                              e
                            ) =>
                              updateMaterial(
                                index,
                                "product",
                                e.target.value
                              )
                            }
                            className="
                              h-11
                              w-full
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              px-3
                              text-sm
                              text-slate-800
                              outline-none
                              transition
                              focus:border-[#172B6B]
                              focus:ring-4
                              focus:ring-blue-50
                            "
                          >

                            <option value="">
                              Select Material
                            </option>

                            {products
                              .filter(
                                (
                                  product
                                ) =>
                                  product.type ===
                                  "RAW"
                              )
                              .map(
                                (
                                  product
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
                                    }
                                  </option>
                                )
                              )}

                          </select>

                        </div>


                        {/* QUANTITY */}

                        <div>

                          <label
                            className="
                              mb-1.5
                              block
                              px-1
                              text-[11px]
                              font-semibold
                              uppercase
                              tracking-wide
                              text-slate-400
                            "
                          >
                            Quantity
                          </label>

                          <input
                            type="number"
                            min={1}
                            value={
                              material.quantity
                            }
                            onChange={(
                              e
                            ) =>
                              updateMaterial(
                                index,
                                "quantity",
                                Number(
                                  e.target.value
                                )
                              )
                            }
                            className="
                              h-11
                              w-full
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              px-3
                              text-sm
                              font-medium
                              text-slate-800
                              outline-none
                              transition
                              focus:border-[#172B6B]
                              focus:ring-4
                              focus:ring-blue-50
                            "
                          />

                        </div>


                        {/* REMOVE */}

                        <div
                          className="
                            flex
                            items-end
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              removeMaterial(
                                index
                              )
                            }
                            disabled={
                              materials.length ===
                              1
                            }
                            className="
                              flex
                              h-11
                              w-11
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              text-slate-400
                              transition
                              hover:border-red-200
                              hover:bg-red-50
                              hover:text-red-600
                              disabled:cursor-not-allowed
                              disabled:opacity-30
                            "
                            aria-label="Remove material"
                          >
                            <FiTrash2
                              size={16}
                            />
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>


              {/* ADD MATERIAL */}

              <button
                type="button"
                onClick={addMaterial}
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-dashed
                  border-slate-300
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:border-[#172B6B]/40
                  hover:bg-blue-50/40
                  hover:text-[#172B6B]
                "
              >
                <FiPlus size={16} />

                Add Material
              </button>

            </div>


            {/* FORM ACTIONS */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-slate-100
                pt-6
                sm:flex-row
                sm:justify-end
              "
            >

              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFinishedProduct("");
                    setMaterials([
                      {
                        product: "",
                        quantity: 1,
                      },
                    ]);
                  }}
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={
                  handleCreateBOM
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#172B6B]
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-[#20398F]
                  hover:shadow-md
                  active:scale-[0.98]
                "
              >

                {isEditing ? (
                  <FiCheckCircle
                    size={17}
                  />
                ) : (
                  <FiPlus
                    size={17}
                  />
                )}

                {isEditing
                  ? "Update BOM"
                  : "Create BOM"}

              </button>

            </div>

          </div>

        </section>


        {/* =====================================================
            BOM WORKSPACE
        ===================================================== */}

        <div
          className="
            grid
            gap-6
            xl:grid-cols-[360px_minmax(0,1fr)]
          "
        >

          {/* ===================================================
              BOM LIST
          =================================================== */}

          <section
            className="
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-[0_8px_30px_rgba(15,23,42,0.04)]
            "
          >

            <div
              className="
                border-b
                border-slate-100
                px-5
                py-5
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <h2
                    className="
                      text-base
                      font-bold
                      text-slate-900
                    "
                  >
                    Existing BOMs
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    Select a recipe to inspect.
                  </p>

                </div>

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-100
                    text-slate-500
                  "
                >
                  <FiLayers
                    size={16}
                  />
                </div>

              </div>

            </div>


            <div
              className="
                max-h-[650px]
                space-y-2
                overflow-y-auto
                p-3
              "
            >

              {boms.length === 0 ? (

                <div
                  className="
                    px-5
                    py-16
                    text-center
                  "
                >

                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-slate-100
                      text-slate-400
                    "
                  >
                    <FiPackage
                      size={21}
                    />
                  </div>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    No BOMs yet
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-400
                    "
                  >
                    Create your first
                    manufacturing recipe above.
                  </p>

                </div>

              ) : (

                boms.map(
                  (bom) => {

                    const selected =
                      selectedBOM?._id ===
                      bom._id;

                    return (
                      <button
                        key={bom._id}
                        type="button"
                        onClick={() =>
                          setSelectedBOM(
                            bom
                          )
                        }
                        className={`
                          group
                          w-full
                          rounded-2xl
                          border
                          p-4
                          text-left
                          transition-all
                          duration-200
                          ${
                            selected
                              ? "border-[#172B6B]/30 bg-blue-50/70 shadow-sm"
                              : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >

                          <div
                            className={`
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              ${
                                selected
                                  ? "bg-[#172B6B] text-white"
                                  : "bg-slate-100 text-slate-500"
                              }
                            `}
                          >
                            <FiBox
                              size={17}
                            />
                          </div>


                          <div className="min-w-0 flex-1">

                            <p
                              className="
                                truncate
                                text-sm
                                font-semibold
                                text-slate-900
                              "
                            >
                              {bom
                                .finishedProduct
                                ?.name ||
                                "Deleted Product"}
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-slate-500
                              "
                            >
                              {
                                bom
                                  .materials
                                  .length
                              }{" "}
                              material
                              {bom
                                .materials
                                .length !==
                              1
                                ? "s"
                                : ""}
                            </p>

                          </div>


                          <FiChevronRight
                            size={16}
                            className={`
                              mt-1
                              shrink-0
                              transition-transform
                              ${
                                selected
                                  ? "translate-x-0 text-[#172B6B]"
                                  : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500"
                              }
                            `}
                          />

                        </div>


                        {selected && (
                          <div
                            className="
                              mt-3
                              flex
                              items-center
                              justify-between
                              border-t
                              border-blue-100
                              pt-3
                            "
                          >

                            <span
                              className="
                                text-[11px]
                                font-medium
                                text-[#172B6B]
                              "
                            >
                              Currently selected
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBOM(
                                  bom._id
                                );
                              }}
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-lg
                                px-2
                                py-1
                                text-[11px]
                                font-semibold
                                text-red-500
                                transition
                                hover:bg-red-50
                                hover:text-red-600
                              "
                            >
                              <FiTrash2
                                size={13}
                              />
                              Delete
                            </button>

                          </div>
                        )}

                      </button>
                    );
                  }
                )

              )}

            </div>

          </section>


          {/* ===================================================
              DETAILS
          =================================================== */}

          <section
            className="
              min-w-0
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-[0_8px_30px_rgba(15,23,42,0.04)]
            "
          >

            {selectedBOM ? (

              <>

                {/* DETAILS HEADER */}

                <div
                  className="
                    border-b
                    border-slate-100
                    px-5
                    py-6
                    sm:px-7
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        min-w-0
                        items-start
                        gap-4
                      "
                    >

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-blue-50
                          text-[#172B6B]
                        "
                      >
                        <FiPackage
                          size={22}
                        />
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-400
                          "
                        >
                          Bill of Materials
                        </p>

                        <h2
                          className="
                            mt-1
                            truncate
                            text-xl
                            font-bold
                            tracking-tight
                            text-slate-900
                            sm:text-2xl
                          "
                        >
                          {
                            selectedBOM
                              .finishedProduct
                              ?.name
                          }
                        </h2>

                        <p
                          className="
                            mt-1
                            text-sm
                            text-slate-500
                          "
                        >
                          {
                            selectedBOM
                              .materials
                              .length
                          }{" "}
                          material
                          {selectedBOM
                            .materials
                            .length !==
                          1
                            ? "s"
                            : ""}{" "}
                          required per unit.
                        </p>

                      </div>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        handleEditBOM(
                          selectedBOM
                        )
                      }
                      className="
                        inline-flex
                        h-10
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        font-semibold
                        text-slate-700
                        transition
                        hover:border-slate-300
                        hover:bg-slate-50
                      "
                    >
                      <FiEdit3
                        size={15}
                      />

                      Edit BOM
                    </button>

                  </div>

                </div>


                {/* MATERIAL DETAILS */}

                <div
                  className="
                    grid
                    gap-3
                    p-5
                    sm:p-7
                    md:grid-cols-2
                  "
                >

                  {selectedBOM.materials.map(
                    (
                      item: any,
                      index: number
                    ) => (

                      <div
                        key={index}
                        className="
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50/60
                          p-4
                          transition-all
                          duration-200
                          hover:border-slate-300
                          hover:bg-white
                          hover:shadow-sm
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          "
                        >

                          <div
                            className="
                              flex
                              min-w-0
                              items-center
                              gap-3
                            "
                          >

                            <div
                              className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-white
                                text-[#172B6B]
                                shadow-sm
                              "
                            >
                              <FiBox
                                size={17}
                              />
                            </div>

                            <div className="min-w-0">

                              <h3
                                className="
                                  truncate
                                  text-sm
                                  font-semibold
                                  text-slate-900
                                "
                              >
                                {
                                  item
                                    .product
                                    ?.name
                                }
                              </h3>

                              <p
                                className="
                                  mt-1
                                  text-xs
                                  text-slate-500
                                "
                              >
                                Required material
                              </p>

                            </div>

                          </div>


                          <div
                            className="
                              shrink-0
                              text-right
                            "
                          >

                            <p
                              className="
                                text-xl
                                font-bold
                                tracking-tight
                                text-[#172B6B]
                              "
                            >
                              ×{item.quantity}
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-[11px]
                                text-slate-400
                              "
                            >
                              {
                                item
                                  .product
                                  ?.unit
                              }
                              /unit
                            </p>

                          </div>

                        </div>


                        <div
                          className="
                            mt-4
                            flex
                            items-center
                            justify-between
                            border-t
                            border-slate-200/80
                            pt-3
                          "
                        >

                          <span
                            className="
                              text-xs
                              text-slate-500
                            "
                          >
                            Available stock
                          </span>

                          <span
                            className="
                              text-xs
                              font-semibold
                              text-slate-700
                            "
                          >
                            {
                              item
                                .product
                                ?.currentStock
                            }{" "}
                            {
                              item
                                .product
                                ?.unit
                            }
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </>

            ) : (

              /* EMPTY */

              <div
                className="
                  flex
                  min-h-[520px]
                  items-center
                  justify-center
                  p-8
                "
              >

                <div
                  className="
                    max-w-sm
                    text-center
                  "
                >

                  <div
                    className="
                      mx-auto
                      mb-5
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-slate-100
                      text-slate-400
                    "
                  >
                    <FiLayers
                      size={25}
                    />
                  </div>

                  <h3
                    className="
                      text-base
                      font-bold
                      text-slate-800
                    "
                  >
                    No BOM selected
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Select a Bill of Materials
                    from the list to view its
                    materials, quantities and
                    current stock.
                  </p>

                </div>

              </div>

            )}

          </section>

        </div>

      </div>

    </AdminLayout>
  );
};

export default BOMPage;