import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiBookOpen,
  FiDownload,
  FiEdit2,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiFileText,
  FiImage,
  FiX,
} from "react-icons/fi";

import jsPDF from "jspdf";

import {
  getCatalogues,
  deleteCatalogue,
} from "../services/catalogue.service";

import CatalogueModal from "./CatalogueModal";

interface CatalogueProduct {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  image?: string;
  price?: number;
  unit?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const Catalogue = () => {
  // =========================================================
  // DATA
  // =========================================================

  const [catalogues, setCatalogues] =
    useState<CatalogueProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  // =========================================================
  // MODAL
  // =========================================================

  const [showModal, setShowModal] =
    useState(false);

  const [editingCatalogue, setEditingCatalogue] =
    useState<CatalogueProduct | null>(null);

  // =========================================================
  // EXPORT MENU
  // =========================================================

  const [showExportMenu, setShowExportMenu] =
    useState(false);

  const exportMenuRef =
    useRef<HTMLDivElement>(null);

  const [exporting, setExporting] =
    useState(false);

  // =========================================================
  // LOAD
  // =========================================================

  const loadCatalogues = async () => {
    try {
      setLoading(true);

      const data =
        await getCatalogues();

      setCatalogues(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load catalogue:",
        error
      );

      setCatalogues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogues();
  }, []);

  // =========================================================
  // CLOSE EXPORT MENU ON OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories =
    useMemo(() => {
      const values =
        catalogues
          .map(
            (item) =>
              item.category?.trim()
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          );

      return [
        "All",
        ...Array.from(
          new Set(values)
        ).sort((a, b) =>
          a.localeCompare(b)
        ),
      ];
    }, [catalogues]);

  // =========================================================
  // FILTERED PRODUCTS
  // =========================================================

  const filteredCatalogues =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return catalogues.filter(
        (item) => {
          const matchesSearch =
            !query ||
            item.name
              ?.toLowerCase()
              .includes(query) ||
            item.description
              ?.toLowerCase()
              .includes(query) ||
            item.category
              ?.toLowerCase()
              .includes(query);

          const matchesCategory =
            categoryFilter ===
              "All" ||
            item.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      catalogues,
      search,
      categoryFilter,
    ]);

  // =========================================================
  // ADD
  // =========================================================

  const handleAdd = () => {
    setEditingCatalogue(null);
    setShowModal(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (
    catalogue: CatalogueProduct
  ) => {
    setEditingCatalogue(
      catalogue
    );

    setShowModal(true);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    catalogue: CatalogueProduct
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${catalogue.name}" from the catalogue?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCatalogue(
        catalogue._id
      );

      await loadCatalogues();
    } catch (error: any) {
      console.error(
        "Failed to delete catalogue product:",
        error
      );

      window.alert(
        error?.response?.data?.message ||
          "Failed to delete catalogue product."
      );
    }
  };

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (
    price?: number,
    unit?: string
  ) => {
    if (
      price === undefined ||
      price === null
    ) {
      return null;
    }

    return `₹${price.toLocaleString(
      "en-IN"
    )}${unit ? ` / ${unit}` : ""}`;
  };

  // =========================================================
  // LOAD IMAGE INTO CANVAS
  // =========================================================

  const loadImage = (
    src: string
  ): Promise<HTMLImageElement> => {
    return new Promise(
      (resolve, reject) => {
        const image =
          new Image();

        image.crossOrigin =
          "anonymous";

        image.onload = () =>
          resolve(image);

        image.onerror = () =>
          reject(
            new Error(
              "Failed to load image"
            )
          );

        image.src = src;
      }
    );
  };

  // =========================================================
  // DRAW IMAGE COVER
  // =========================================================

  const drawCoverImage = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const imageRatio =
      image.width /
      image.height;

    const boxRatio =
      width / height;

    let sourceWidth =
      image.width;

    let sourceHeight =
      image.height;

    let sourceX = 0;
    let sourceY = 0;

    if (
      imageRatio > boxRatio
    ) {
      sourceWidth =
        image.height *
        boxRatio;

      sourceX =
        (image.width -
          sourceWidth) /
        2;
    } else {
      sourceHeight =
        image.width /
        boxRatio;

      sourceY =
        (image.height -
          sourceHeight) /
        2;
    }

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );
  };

  // =========================================================
  // TEXT WRAP
  // =========================================================

  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines = 3
  ) => {
    const words =
      text.split(" ");

    let line = "";
    let lines: string[] = [];

    for (
      let i = 0;
      i < words.length;
      i++
    ) {
      const testLine =
        line +
        (line ? " " : "") +
        words[i];

      const width =
        ctx.measureText(
          testLine
        ).width;

      if (
        width > maxWidth &&
        line
      ) {
        lines.push(line);
        line = words[i];

        if (
          lines.length ===
          maxLines
        ) {
          break;
        }
      } else {
        line = testLine;
      }
    }

    if (
      lines.length <
      maxLines &&
      line
    ) {
      lines.push(line);
    }

    if (
      lines.length ===
      maxLines &&
      words.length > 0
    ) {
      const last =
        lines[
          lines.length - 1
        ];

      if (
        last &&
        !last.endsWith("...")
      ) {
        lines[
          lines.length - 1
        ] = last + "...";
      }
    }

    lines.forEach(
      (lineText, index) => {
        ctx.fillText(
          lineText,
          x,
          y +
            index *
              lineHeight
        );
      }
    );

    return (
      y +
      lines.length *
        lineHeight
    );
  };

  // =========================================================
  // BUILD CATALOGUE PAGE
  // =========================================================

  const buildCataloguePage =
    async (
      products: CatalogueProduct[],
      pageIndex: number,
      totalPages: number
    ) => {
      // A4 at 96 DPI-ish
      const width = 794;
      const height = 1123;

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = width;
      canvas.height = height;

      const ctx =
        canvas.getContext(
          "2d"
        );

      if (!ctx) {
        throw new Error(
          "Canvas is not supported."
        );
      }

      // -------------------------------------------------------
      // PAGE
      // -------------------------------------------------------

      ctx.fillStyle =
        "#ffffff";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      // -------------------------------------------------------
      // HEADER
      // -------------------------------------------------------

      ctx.fillStyle =
        "#17357A";

      ctx.fillRect(
        0,
        0,
        width,
        120
      );

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "bold 26px Arial";

      ctx.fillText(
        "TOY HUB CORPORATION",
        52,
        48
      );

      ctx.font =
        "500 13px Arial";

      ctx.fillText(
        "PRODUCT CATALOGUE",
        52,
        73
      );

      ctx.font =
        "12px Arial";

      ctx.textAlign =
        "right";

      ctx.fillText(
        new Date().toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),
        width - 52,
        48
      );

      ctx.fillText(
        `Page ${
          pageIndex + 1
        } of ${totalPages}`,
        width - 52,
        70
      );

      ctx.textAlign =
        "left";

      // -------------------------------------------------------
      // FILTER INFORMATION
      // -------------------------------------------------------

      ctx.fillStyle =
        "#17357A";

      ctx.font =
        "bold 20px Arial";

      ctx.fillText(
        "Catalogue",
        52,
        160
      );

      ctx.fillStyle =
        "#64748b";

      ctx.font =
        "12px Arial";

      const filterText =
        categoryFilter ===
        "All"
          ? "All categories"
          : `Category: ${categoryFilter}`;

      ctx.fillText(
        `${filterText} • ${products.length} product${
          products.length ===
          1
            ? ""
            : "s"
        }`,
        52,
        183
      );

      // -------------------------------------------------------
      // GRID
      // -------------------------------------------------------

      const marginX = 52;
      const topY = 215;

      const gap = 22;

      const cardWidth =
        (width -
          marginX * 2 -
          gap) /
        2;

      const cardHeight = 400;

      const imageHeight = 220;

      const rowsPerPage = 2;

      const columns = 2;

      const pageProducts =
        products.slice(
          pageIndex *
            rowsPerPage *
            columns,
          (pageIndex + 1) *
            rowsPerPage *
            columns
        );

      for (
        let index = 0;
        index <
        pageProducts.length;
        index++
      ) {
        const product =
          pageProducts[index];

        const row =
          Math.floor(index / 2);

        const column =
          index % 2;

        const x =
          marginX +
          column *
            (cardWidth + gap);

        const y =
          topY +
          row *
            (cardHeight + gap);

        // Card
        ctx.fillStyle =
          "#ffffff";

        ctx.strokeStyle =
          "#e2e8f0";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.roundRect(
          x,
          y,
          cardWidth,
          cardHeight,
          14
        );

        ctx.fill();

        ctx.stroke();

        // Image area
        ctx.fillStyle =
          "#f8fafc";

        ctx.beginPath();

        ctx.roundRect(
          x + 1,
          y + 1,
          cardWidth - 2,
          imageHeight,
          13
        );

        ctx.fill();

        if (
          product.image
        ) {
          try {
            const image =
              await loadImage(
                product.image
              );

            drawCoverImage(
              ctx,
              image,
              x + 1,
              y + 1,
              cardWidth - 2,
              imageHeight
            );
          } catch {
            // Keep placeholder
          }
        }

        // Image divider
        ctx.strokeStyle =
          "#e2e8f0";

        ctx.beginPath();

        ctx.moveTo(
          x,
          y +
            imageHeight
        );

        ctx.lineTo(
          x + cardWidth,
          y +
            imageHeight
        );

        ctx.stroke();

        // Category
        let textY =
          y +
          imageHeight +
          28;

        if (
          product.category
        ) {
          ctx.fillStyle =
            "#17357A";

          ctx.font =
            "bold 10px Arial";

          ctx.fillText(
            product.category
              .toUpperCase(),
            x + 18,
            textY
          );

          textY += 20;
        }

        // Product name
        ctx.fillStyle =
          "#0f172a";

        ctx.font =
          "bold 17px Arial";

        textY =
          drawWrappedText(
            ctx,
            product.name ||
              "Untitled Product",
            x + 18,
            textY,
            cardWidth - 36,
            22,
            2
          );

        // Description
        if (
          product.description
        ) {
          ctx.fillStyle =
            "#64748b";

          ctx.font =
            "11px Arial";

          textY += 7;

          textY =
            drawWrappedText(
              ctx,
              product.description,
              x + 18,
              textY,
              cardWidth - 36,
              16,
              3
            );
        }

        // Price
        const price =
          formatPrice(
            product.price,
            product.unit
          );

        if (price) {
          ctx.fillStyle =
            "#17357A";

          ctx.font =
            "bold 15px Arial";

          ctx.fillText(
            price,
            x + 18,
            y +
              cardHeight -
              20
          );
        }
      }

      // -------------------------------------------------------
      // FOOTER
      // -------------------------------------------------------

      ctx.fillStyle =
        "#94a3b8";

      ctx.font =
        "10px Arial";

      ctx.fillText(
        "Toy Hub Corporation • Product Catalogue",
        52,
        height - 28
      );

      return canvas;
    };

  // =========================================================
  // EXPORT PNG
  // =========================================================

  const handleExportPng =
    async () => {
      if (
        !filteredCatalogues.length
      ) {
        window.alert(
          "There are no products to export with the current filters."
        );

        return;
      }

      try {
        setExporting(true);
        setShowExportMenu(false);

        const productsPerPage =
          4;

        const totalPages =
          Math.ceil(
            filteredCatalogues.length /
              productsPerPage
          );

        for (
          let page = 0;
          page < totalPages;
          page++
        ) {
          const canvas =
            await buildCataloguePage(
              filteredCatalogues,
              page,
              totalPages
            );

          const link =
            document.createElement(
              "a"
            );

          link.download =
            totalPages === 1
              ? "toyhub-catalogue.png"
              : `toyhub-catalogue-page-${
                  page + 1
                }.png`;

          link.href =
            canvas.toDataURL(
              "image/png"
            );

          link.click();

          // Prevent browser download blocking
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                250
              )
          );
        }
      } catch (error) {
        console.error(
          "PNG export failed:",
          error
        );

        window.alert(
          "Failed to export PNG catalogue."
        );
      } finally {
        setExporting(false);
      }
    };

  // =========================================================
  // EXPORT PDF — A4
  // =========================================================

  const handleExportPdf =
    async () => {
      if (
        !filteredCatalogues.length
      ) {
        window.alert(
          "There are no products to export with the current filters."
        );

        return;
      }

      try {
        setExporting(true);
        setShowExportMenu(false);

        const productsPerPage =
          4;

        const totalPages =
          Math.ceil(
            filteredCatalogues.length /
              productsPerPage
          );

        const pdf =
          new jsPDF({
            orientation:
              "portrait",
            unit: "mm",
            format: "a4",
          });

        for (
          let page = 0;
          page < totalPages;
          page++
        ) {
          const canvas =
            await buildCataloguePage(
              filteredCatalogues,
              page,
              totalPages
            );

          const image =
            canvas.toDataURL(
              "image/png",
              1
            );

          if (page > 0) {
            pdf.addPage(
              "a4",
              "portrait"
            );
          }

          pdf.addImage(
            image,
            "PNG",
            0,
            0,
            210,
            297
          );
        }

        const suffix =
          categoryFilter ===
          "All"
            ? "all"
            : categoryFilter
                .replace(
                  /\s+/g,
                  "-"
                )
                .toLowerCase();

        pdf.save(
          `toyhub-catalogue-${suffix}.pdf`
        );
      } catch (error) {
        console.error(
          "PDF export failed:",
          error
        );

        window.alert(
          "Failed to export PDF catalogue."
        );
      } finally {
        setExporting(false);
      }
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-blue-50
                text-[#17357A]
              "
            >
              <FiBookOpen
                size={20}
              />
            </div>

            <div>
              <h1
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                Catalogue
              </h1>

              <p
                className="
                  mt-0.5
                  text-sm
                  text-slate-500
                "
              >
                Manage products independently
                from Inventory.
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          {/* EXPORT */}

          <div
            ref={exportMenuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setShowExportMenu(
                  (value) =>
                    !value
                )
              }
              disabled={
                exporting ||
                !filteredCatalogues.length
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FiDownload
                size={16}
              />

              {exporting
                ? "Exporting..."
                : "Export Catalogue"}

              <FiMoreVertical
                size={15}
              />
            </button>

            {showExportMenu && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  z-30
                  mt-2
                  w-56
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-1.5
                  shadow-xl
                "
              >
                <button
                  type="button"
                  onClick={
                    handleExportPdf
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-red-50
                      text-red-600
                    "
                  >
                    <FiFileText
                      size={15}
                    />
                  </span>

                  <span>
                    <span className="block font-semibold">
                      PDF — A4
                    </span>

                    <span className="block text-[11px] text-slate-400">
                      Business catalogue
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={
                    handleExportPng
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-blue-50
                      text-blue-600
                    "
                  >
                    <FiImage
                      size={15}
                    />
                  </span>

                  <span>
                    <span className="block font-semibold">
                      PNG
                    </span>

                    <span className="block text-[11px] text-slate-400">
                      Catalogue page
                    </span>
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* ADD PRODUCT */}

          <button
            type="button"
            onClick={handleAdd}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-[#17357A]
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#122c68]
            "
          >
            <FiPlus
              size={17}
            />

            Add Product
          </button>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
          "
        >
          <div className="relative flex-1">
            <FiSearch
              size={17}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search catalogue..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                pl-10
                pr-10
                text-sm
                outline-none
                transition
                focus:border-[#17357A]
                focus:ring-2
                focus:ring-blue-50
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  hover:text-slate-700
                "
              >
                <FiX
                  size={15}
                />
              </button>
            )}
          </div>

          <select
            value={
              categoryFilter
            }
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            className="
              h-11
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-medium
              text-slate-700
              outline-none
              focus:border-[#17357A]
              sm:w-52
            "
          >
            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>
        </div>

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <p
            className="
              text-xs
              text-slate-500
            "
          >
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {
                filteredCatalogues.length
              }
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {catalogues.length}
            </span>{" "}
            products
          </p>

          {(search ||
            categoryFilter !==
              "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter(
                  "All"
                );
              }}
              className="
                text-xs
                font-semibold
                text-[#17357A]
                hover:underline
              "
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      {loading ? (
        <div
          className="
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  h-[420px]
                  animate-pulse
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-100
                "
              />
            )
          )}
        </div>
      ) : filteredCatalogues.length ===
        0 ? (
        <div
          className="
            flex
            min-h-[360px]
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-slate-300
            bg-slate-50/50
            px-6
            text-center
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-white
              text-slate-400
              shadow-sm
            "
          >
            <FiBookOpen
              size={24}
            />
          </div>

          <h3
            className="
              mt-4
              text-base
              font-bold
              text-slate-900
            "
          >
            No catalogue products found
          </h3>

          <p
            className="
              mt-1
              max-w-sm
              text-sm
              text-slate-500
            "
          >
            Try changing your search or category
            filter, or add a new catalogue product.
          </p>

          {!search &&
            categoryFilter ===
              "All" && (
              <button
                type="button"
                onClick={handleAdd}
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#17357A]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                "
              >
                <FiPlus
                  size={16}
                />

                Add Product
              </button>
            )}
        </div>
      ) : (
        <div
          className="
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {filteredCatalogues.map(
            (item) => {
              const price =
                formatPrice(
                  item.price,
                  item.unit
                );

              return (
                <article
                  key={item._id}
                  className="
                    group
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-md
                  "
                >
                  {/* IMAGE */}

                  <div
                    className="
                      relative
                      aspect-[4/3]
                      overflow-hidden
                      bg-slate-50
                    "
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={
                          item.name
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-300
                          group-hover:scale-[1.02]
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          w-full
                          items-center
                          justify-center
                          text-slate-300
                        "
                      >
                        <FiImage
                          size={38}
                        />
                      </div>
                    )}

                    {!item.isActive && (
                      <span
                        className="
                          absolute
                          left-3
                          top-3
                          rounded-full
                          bg-slate-900/75
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-white
                        "
                      >
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="p-4">
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <div className="min-w-0">
                        <h3
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-slate-900
                          "
                        >
                          {item.name}
                        </h3>

                        {item.category && (
                          <p
                            className="
                              mt-1
                              text-xs
                              font-medium
                              text-[#17357A]
                            "
                          >
                            {
                              item.category
                            }
                          </p>
                        )}
                      </div>

                      {price && (
                        <p
                          className="
                            shrink-0
                            text-sm
                            font-bold
                            text-slate-900
                          "
                        >
                          {price}
                        </p>
                      )}
                    </div>

                    {item.description && (
                      <p
                        className="
                          mt-3
                          line-clamp-3
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        {
                          item.description
                        }
                      </p>
                    )}

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        border-t
                        border-slate-100
                        pt-3
                      "
                    >
                      <span
                        className="
                          text-[11px]
                          text-slate-400
                        "
                      >
                        {item.unit
                          ? `Unit: ${item.unit}`
                          : "Catalogue product"}
                      </span>

                      <div
                        className="
                          flex
                          items-center
                          gap-1.5
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              item
                            )
                          }
                          className="
                            flex
                            h-8
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            border-slate-200
                            px-3
                            text-xs
                            font-semibold
                            text-slate-700
                            transition
                            hover:bg-slate-50
                          "
                        >
                          <FiEdit2
                            size={13}
                          />

                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              item
                            )
                          }
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-red-100
                            text-red-500
                            transition
                            hover:bg-red-50
                          "
                          title="Delete"
                        >
                          <FiTrash2
                            size={14}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}

      {/* =====================================================
          MODAL
      ===================================================== */}

      <CatalogueModal
        open={showModal}
        catalogue={
          editingCatalogue
        }
        onClose={() => {
          setShowModal(false);
          setEditingCatalogue(
            null
          );
        }}
        onSaved={async () => {
          await loadCatalogues();
        }}
      />
    </div>
  );
};

export default Catalogue;