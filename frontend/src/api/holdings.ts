import client from "./client";
import type { Holding } from "../types/pension";

export const holdingApi = {
  getByPensionId: async (pensionId: number): Promise<Holding[]> => {
    const response = await client.get<{ holdings: Holding[] }>(
      `/pensions/${pensionId}/holdings`
    );
    return response.data.holdings;
  },

  create: async (
    pensionId: number,
    data: {
      ticker: string;
      shares: number;
    }
  ): Promise<Holding> => {
    const response = await client.post<{ holding: Holding }>(
      `/pensions/${pensionId}/holdings`,
      data
    );
    return response.data.holding;
  },

  update: async (
    id: number,
    data: {
      ticker?: string;
      shares?: number;
    }
  ): Promise<Holding> => {
    const response = await client.put<{ holding: Holding }>(
      `/holdings/${id}`,
      data
    );
    return response.data.holding;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/holdings/${id}`);
  },
};
