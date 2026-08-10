import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const formatDate = (date: any) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const exportBOMExcel = (
  data: any[],
  fileName = "BOM_Report"
) => {
  const rows: any[] = [];

  data.forEach((bom) => {
    const materials = bom.materials || [];

    if (materials.length === 0) {
      rows.push({
        "Finished Product":
          bom.finishedProduct?.name || "-",

        SKU:
          bom.finishedProduct?.sku || "-",

        "Material":
          "-",

        "Material SKU":
          "-",

        "Required Quantity":
          "-",

        Unit:
          "-",

        "Available Stock":
          "-",

        "Created Date":
          formatDate(bom.createdAt),

        "Updated Date":
          formatDate(bom.updatedAt),
      });

      return;
    }

    materials.forEach((item: any) => {
      rows.push({
        "Finished Product":
          bom.finishedProduct?.name || "-",

        SKU:
          bom.finishedProduct?.sku || "-",

        Material:
          item.product?.name || "-",

        "Material SKU":
          item.product?.sku || "-",

        "Required Quantity":
          item.quantity ?? "-",

        Unit:
          item.product?.unit || "-",

        "Available Stock":
          item.product?.currentStock ?? "-",

        "Created Date":
          formatDate(bom.createdAt),

        "Updated Date":
          formatDate(bom.updatedAt),
      });
    });
  });

  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.aoa_to_sheet([
    ["BILL OF MATERIALS"],
    ["Toy Hub Corporation"],
    [
      `Generated: ${new Date().toLocaleString(
        "en-IN"
      )}`,
    ],
    [],
  ]);

  XLSX.utils.sheet_add_json(
    worksheet,
    rows,
    {
      origin: "A5",
    }
  );

  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 28 },
    { wch: 18 },
    { wch: 20 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];

  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 8 },
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 8 },
    },
    {
      s: { r: 2, c: 0 },
      e: { r: 2, c: 8 },
    },
  ];

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 5,
  };

  if (rows.length > 0) {
    worksheet["!autofilter"] = {
      ref: `A5:I${rows.length + 5}`,
    };
  }

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "BOM Report"
  );

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(
    blob,
    `${fileName}.xlsx`
  );
};