import api from "../../../services/api/axios";

/* -------------------------------------------------------------------------- */
/* UPLOAD PRODUCTION IMAGE                                                    */
/* -------------------------------------------------------------------------- */

export const uploadProductionImage = async (
  file: File
) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post(
    "/production/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/* -------------------------------------------------------------------------- */
/* GET ALL PRODUCTION ORDERS                                                  */
/* -------------------------------------------------------------------------- */

export const getProductions = async () => {
  const response = await api.get("/production");
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* GET SINGLE PRODUCTION ORDER                                                */
/* -------------------------------------------------------------------------- */

export const getProductionById = async (
  id: string
) => {
  const response = await api.get(
    `/production/${id}`
  );

  return response.data;
};

/* -------------------------------------------------------------------------- */
/* GET ALL CRM ORDERS                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Production reporting needs the originating CRM Orders as well as
 * Production records.
 *
 * Production:
 *   crmOrder -> Order._id
 *
 * CRM Order:
 *   production -> Production._id
 *
 * We fetch the Orders separately so the Production frontend can
 * reliably resolve the complete commercial order even when an older
 * Production record does not contain a fully populated crmOrder.
 */
export const getCRMOrders = async () => {
  const response = await api.get("/orders");

  return Array.isArray(response.data)
    ? response.data
    : [];
};

/* -------------------------------------------------------------------------- */
/* GET SINGLE CRM ORDER                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Used when the Production UI needs the complete originating CRM Order.
 */
export const getCRMOrderById = async (
  id: string
) => {
  const response = await api.get(
    `/orders/${id}`
  );

  return response.data;
};

/* -------------------------------------------------------------------------- */
/* CREATE PRODUCTION ORDER                                                    */
/* */
/* Used by CRM / Founder.                                                     */
/* -------------------------------------------------------------------------- */

export const createProduction = async (
  data: any
) => {
  const response = await api.post(
    "/production",
    data
  );

  return response.data;
};

/* -------------------------------------------------------------------------- */
/* UPDATE WHOLE PRODUCTION ORDER                                              */
/* */
/* Used for order-level changes.                                              */
/* -------------------------------------------------------------------------- */

export const updateProduction = async (
  id: string,
  data: any
) => {
  const response = await api.put(
    `/production/${id}`,
    data
  );

  return response.data;
};

/* -------------------------------------------------------------------------- */
/* UPDATE SINGLE PRODUCTION ITEM                                              */
/* */
/* Used for production execution/progress.                                    */
/* -------------------------------------------------------------------------- */

export const updateProductionItem = async (
  productionId: string,
  itemId: string,
  data: any
) => {
  const response = await api.put(
    `/production/${productionId}/items/${itemId}`,
    data
  );

  return response.data;
};

/* -------------------------------------------------------------------------- */
/* DELETE PRODUCTION ORDER                                                    */
/* -------------------------------------------------------------------------- */

export const deleteProduction = async (
  id: string
) => {
  const response = await api.delete(
    `/production/${id}`
  );

  return response.data;
};

/* -------------------------------------------------------------------------- */
/* PRODUCTION CAPACITY CALCULATOR                                             */
/* -------------------------------------------------------------------------- */

export const calculateProduction = async (
  data: any
) => {
  const response = await api.post(
    "/production/calculate",
    data
  );

  return response.data;
};

/* -------------------------------------------------------------------------- */
/* GET MATERIAL CONSUMPTION                                                   */
/* -------------------------------------------------------------------------- */

export const getMaterialConsumption = async (
  productionId: string
) => {
  const response = await api.get(
    `/production/${productionId}/material-consumption`
  );

  return response.data;
};
