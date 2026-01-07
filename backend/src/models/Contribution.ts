import { getOne, getAll, insert, runQuery } from '../config/database';

export interface Contribution {
  id: number;
  pension_id: number;
  amount: number;
  contribution_date: string;
  created_at: string;
}

export const ContributionModel = {
  findById: async (id: number): Promise<Contribution | undefined> => {
    return getOne<Contribution>('SELECT * FROM contributions WHERE id = ?', [id]);
  },

  findByPensionId: async (pensionId: number): Promise<Contribution[]> => {
    return getAll<Contribution>(
      'SELECT * FROM contributions WHERE pension_id = ? ORDER BY contribution_date DESC',
      [pensionId]
    );
  },

  create: async (data: {
    pension_id: number;
    amount: number;
    contribution_date: string;
  }): Promise<number> => {
    const { pension_id, amount, contribution_date } = data;
    return insert(
      'INSERT INTO contributions (pension_id, amount, contribution_date) VALUES (?, ?, ?)',
      [pension_id, amount, contribution_date]
    );
  },

  update: async (id: number, data: {
    amount?: number;
    contribution_date?: string;
  }): Promise<void> => {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.amount !== undefined) {
      updates.push('amount = ?');
      params.push(data.amount);
    }
    if (data.contribution_date !== undefined) {
      updates.push('contribution_date = ?');
      params.push(data.contribution_date);
    }

    if (updates.length === 0) return;

    params.push(id);
    const sql = `UPDATE contributions SET ${updates.join(', ')} WHERE id = ?`;
    await runQuery(sql, params);
  },

  delete: async (id: number): Promise<void> => {
    await runQuery('DELETE FROM contributions WHERE id = ?', [id]);
  },

  getTotalByPensionId: async (pensionId: number): Promise<number> => {
    const result = await getOne<{ total: number }>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM contributions WHERE pension_id = ?',
      [pensionId]
    );
    return result?.total || 0;
  },
};
