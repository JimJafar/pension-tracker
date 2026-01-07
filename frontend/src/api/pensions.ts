import client from './client';
import { Pension, PensionWithTotals } from '../types/pension';

export const pensionApi = {
  getAll: async (): Promise<PensionWithTotals[]> => {
    const response = await client.get<{ pensions: PensionWithTotals[] }>('/pensions');
    return response.data.pensions;
  },

  getById: async (id: number): Promise<Pension> => {
    const response = await client.get<{ pension: Pension }>(`/pensions/${id}`);
    return response.data.pension;
  },

  create: async (data: {
    name: string;
    type: string;
    contribution_type: string;
    monthly_amount?: number;
    day_of_month?: number;
  }): Promise<Pension> => {
    const response = await client.post<{ pension: Pension }>('/pensions', data);
    return response.data.pension;
  },

  update: async (id: number, data: {
    name?: string;
    type?: string;
    contribution_type?: string;
    monthly_amount?: number;
    day_of_month?: number;
  }): Promise<Pension> => {
    const response = await client.put<{ pension: Pension }>(`/pensions/${id}`, data);
    return response.data.pension;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/pensions/${id}`);
  },
};
