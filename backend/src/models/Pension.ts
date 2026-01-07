import { getOne, getAll, insert, runQuery } from '../config/database';

export type PensionType = 'SIPP' | 'managed';
export type ContributionType = 'regular_fixed' | 'manual';

export interface Pension {
  id: number;
  user_id: number;
  name: string;
  type: PensionType;
  contribution_type: ContributionType;
  monthly_amount?: number;
  day_of_month?: number;
  created_at: string;
}

export interface PensionWithTotals extends Pension {
  total_contributions: number;
  current_value: number;
}

export const PensionModel = {
  findById: async (id: number): Promise<Pension | undefined> => {
    return getOne<Pension>('SELECT * FROM pensions WHERE id = ?', [id]);
  },

  findByUserId: async (userId: number): Promise<Pension[]> => {
    return getAll<Pension>('SELECT * FROM pensions WHERE user_id = ?', [userId]);
  },

  findByUserIdWithTotals: async (userId: number): Promise<PensionWithTotals[]> => {
    const sql = `
      SELECT
        p.*,
        COALESCE(SUM(c.amount), 0) as total_contributions
      FROM pensions p
      LEFT JOIN contributions c ON p.id = c.pension_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    const pensions = await getAll<PensionWithTotals>(sql, [userId]);

    // Initialize current_value (will be calculated with holdings in service layer)
    return pensions.map(p => ({
      ...p,
      current_value: 0
    }));
  },

  create: async (data: {
    user_id: number;
    name: string;
    type: PensionType;
    contribution_type: ContributionType;
    monthly_amount?: number;
    day_of_month?: number;
  }): Promise<number> => {
    const { user_id, name, type, contribution_type, monthly_amount, day_of_month } = data;
    return insert(
      `INSERT INTO pensions (user_id, name, type, contribution_type, monthly_amount, day_of_month)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, name, type, contribution_type, monthly_amount || null, day_of_month || null]
    );
  },

  update: async (id: number, data: {
    name?: string;
    type?: PensionType;
    contribution_type?: ContributionType;
    monthly_amount?: number;
    day_of_month?: number;
  }): Promise<void> => {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      params.push(data.type);
    }
    if (data.contribution_type !== undefined) {
      updates.push('contribution_type = ?');
      params.push(data.contribution_type);
    }
    if (data.monthly_amount !== undefined) {
      updates.push('monthly_amount = ?');
      params.push(data.monthly_amount || null);
    }
    if (data.day_of_month !== undefined) {
      updates.push('day_of_month = ?');
      params.push(data.day_of_month || null);
    }

    if (updates.length === 0) return;

    params.push(id);
    const sql = `UPDATE pensions SET ${updates.join(', ')} WHERE id = ?`;
    await runQuery(sql, params);
  },

  delete: async (id: number): Promise<void> => {
    await runQuery('DELETE FROM pensions WHERE id = ?', [id]);
  },
};
