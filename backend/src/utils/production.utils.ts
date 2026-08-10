import BOM from "../models/BOM";
import Product from "../models/Product";

interface MaterialSelection {
  requiredMaterial: string;
  selectedMaterial: string;
}

export const calculateMaterialAvailability = async (
  bomId: string,
  quantity: number,
  materialSelections: MaterialSelection[] = []
) => {
  const bom = await BOM.findById(bomId)
    .populate("materials.product");

  if (!bom) {
    throw new Error("BOM not found");
  }

  const materials: any[] = [];

  let maximumProducible =
    Number.MAX_SAFE_INTEGER;

  let bottleneck = "";

  for (const item of bom.materials as any[]) {
    /*
     * By default, use the material defined
     * in the BOM.
     */
    let product = item.product;

    /*
     * If an alternative material was selected
     * for this BOM material, use that product
     * for availability calculation.
     */
    const selection =
      materialSelections.find(
        (selection) =>
          String(
            selection.requiredMaterial
          ) === String(item.product._id)
      );

    if (selection?.selectedMaterial) {
      const selectedProduct =
        await Product.findById(
          selection.selectedMaterial
        );

      if (selectedProduct) {
        product = selectedProduct;
      }
    }

    const required =
      item.quantity * quantity;

    const available =
      Number(product.currentStock || 0);

    const shortage =
      Math.max(
        required - available,
        0
      );

    const possible =
      item.quantity > 0
        ? Math.floor(
            available /
              item.quantity
          )
        : 0;

    if (
      possible <
      maximumProducible
    ) {
      maximumProducible =
        possible;

      bottleneck =
        product.name;
    }

    materials.push({
      product:
        product.name,

      productId:
        product._id,

      requiredMaterial:
        item.product.name,

      requiredMaterialId:
        item.product._id,

      required,

      available,

      shortage,

      sufficient:
        available >= required,

      selected:
        Boolean(selection),
    });
  }

  /*
   * If the BOM has no materials,
   * avoid returning MAX_SAFE_INTEGER.
   */
  if (
    maximumProducible ===
    Number.MAX_SAFE_INTEGER
  ) {
    maximumProducible = 0;
  }

  return {
    maximumProducible,

    bottleneck,

    materials,
  };
};