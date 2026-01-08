export type PensionType = "SIPP" | "managed";
export type ContributionType = "regular_fixed" | "manual";
export type CurrencyUnit = "pounds" | "pence";

export interface Pension {
  id: number;
  user_id: number;
  name: string;
  type: PensionType;
  contribution_type: ContributionType;
  monthly_amount?: number;
  day_of_month?: number;
  cash?: number;
  created_at: string;
}

export interface PensionWithTotals extends Pension {
  total_contributions: number;
  current_value: number;
  holdings?: HoldingWithPrice[];
  expected_contributions?: ExpectedContribution[];
  missing_contributions?: MissingContribution[];
}

export interface Contribution {
  id: number;
  pension_id: number;
  amount: number;
  contribution_date: string;
  created_at: string;
}

export interface Holding {
  id: number;
  pension_id: number;
  ticker: string;
  shares: number;
  currency_unit: CurrencyUnit;
  created_at: string;
  updated_at: string;
}

export interface HoldingWithPrice extends Holding {
  current_price?: number;
  total_value?: number;
  currency?: string;
}

export interface StockPrice {
  ticker: string;
  price: number;
  timestamp: string;
  currency: string;
}

export type ContributionStatus = "received" | "pending" | "missing" | "late";

export interface ExpectedContribution {
  date: string;
  amount: number;
  status: ContributionStatus;
  actualContribution?: Contribution;
}

export interface MissingContribution {
  expected_date: string;
  amount: number;
  days_overdue: number;
}
