import { getOne, getAll, insert, runQuery } from "../config/database";

export type CurrencyUnit = "pounds" | "pence";

export interface Holding {
  id: number;
  pension_id: number;
  ticker: string;
  shares: number;
  currency_unit: CurrencyUnit;
  created_at: string;
  updated_at: string;
}

export const HoldingModel = {
  findById: async (id: number): Promise<Holding | undefined> => {
    return getOne<Holding>("SELECT * FROM holdings WHERE id = ?", [id]);
  },

  findByPensionId: async (pensionId: number): Promise<Holding[]> => {
    return getAll<Holding>(
      "SELECT * FROM holdings WHERE pension_id = ? ORDER BY ticker",
      [pensionId]
    );
  },

  findByPensionIdAndTicker: async (
    pensionId: number,
    ticker: string
  ): Promise<Holding | undefined> => {
    return getOne<Holding>(
      "SELECT * FROM holdings WHERE pension_id = ? AND ticker = ?",
      [pensionId, ticker]
    );
  },

  create: async (data: {
    pension_id: number;
    ticker: string;
    shares: number;
    currency_unit?: CurrencyUnit;
  }): Promise<number> => {
    const { pension_id, ticker, shares, currency_unit } = data;
    return insert(
      "INSERT INTO holdings (pension_id, ticker, shares, currency_unit) VALUES (?, ?, ?, ?)",
      [pension_id, ticker.toUpperCase(), shares, currency_unit || "pounds"]
    );
  },

  update: async (
    id: number,
    data: {
      ticker?: string;
      shares?: number;
      currency_unit?: CurrencyUnit;
    }
  ): Promise<void> => {
    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const params: any[] = [];

    if (data.ticker !== undefined) {
      updates.push("ticker = ?");
      params.push(data.ticker.toUpperCase());
    }
    if (data.shares !== undefined) {
      updates.push("shares = ?");
      params.push(data.shares);
    }
    if (data.currency_unit !== undefined) {
      updates.push("currency_unit = ?");
      params.push(data.currency_unit);
    }

    params.push(id);
    const sql = `UPDATE holdings SET ${updates.join(", ")} WHERE id = ?`;
    await runQuery(sql, params);
  },

  delete: async (id: number): Promise<void> => {
    await runQuery("DELETE FROM holdings WHERE id = ?", [id]);
  },
};
