import api from "../../../services/api/axios";

export interface PipelineUpdate {
  stage?: string;
  assignedSalesperson?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  nextAction?: string;
  negotiationNotes?: string;
  stageNote?: string;
}

export const getSalesPipeline =
  async () => {
    const response =
      await api.get(
        "/customers/pipeline"
      );

    return response.data;
  };

export const updateCustomerPipeline =
  async (
    customerId: string,
    data: PipelineUpdate
  ) => {
    const response =
      await api.put(
        `/customers/${customerId}/pipeline`,
        data
      );

    return response.data;
  };