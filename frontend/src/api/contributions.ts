import client from './client';
import { Contribution } from '../types/pension';

export const contributionApi = {
  getByPensionId: async (pensionId: number): Promise<Contribution[]> => {
    const response = await client.get<{ contributions: Contribution[] }>(
      `/pensions/${pensionId}/contributions`
    );
    return response.data.contributions;
  },

  create: async (pensionId: number, data: {
    amount: number;
    contribution_date: string;
  }): Promise<Contribution> => {
    const response = await client.post<{ contribution: Contribution }>(
      `/pensions/${pensionId}/contributions`,
      data
    );
    return response.data.contribution;
  },

  update: async (id: number, data: {
    amount?: number;
    contribution_date?: string;
  }): Promise<Contribution> => {
    const response = await client.put<{ contribution: Contribution }>(
      `/contributions/${id}`,
      data
    );
    return response.data.contribution;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/contributions/${id}`);
  },
};
