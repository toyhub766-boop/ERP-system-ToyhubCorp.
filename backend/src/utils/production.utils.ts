import BOM from "../models/BOM";
import Product from "../models/Product";

export const calculateMaterialAvailability = async (
  bomId: string,
  quantity: number
) => {
  const bom = await BOM.findById(bomId)
    .populate("materials.product");

  if (!bom) {
    throw new Error("BOM not found");
  }

  const materials = [];

  let maximumProducible = Number.MAX_SAFE_INTEGER;

  let bottleneck = "";

  for (const item of bom.materials as any[]) {

    const product = item.product;

    const required =
      item.quantity * quantity;

    const available =
      product.currentStock;

    const shortage =
      Math.max(required - available, 0);

    const possible =
      Math.floor(
        available / item.quantity
      );

    if (possible < maximumProducible) {
      maximumProducible = possible;
      bottleneck = product.name;
    }

    materials.push({
      product: product.name,

      required,

      available,

      shortage,

      sufficient:
        available >= required,
    });
  }

  return {
    maximumProducible,

    bottleneck,

    materials,
  };
};