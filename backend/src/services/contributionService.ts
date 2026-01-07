import { Pension } from '../models/Pension';
import { Contribution, ContributionModel } from '../models/Contribution';

export type ContributionStatus = 'received' | 'pending' | 'missing' | 'late';

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

const GRACE_PERIOD_DAYS = 3;

export const contributionService = {
  calculateExpectedContributions: async (
    pension: Pension,
    startDate: Date,
    endDate: Date
  ): Promise<ExpectedContribution[]> => {
    if (pension.contribution_type !== 'regular_fixed') {
      return [];
    }

    if (!pension.monthly_amount || !pension.day_of_month) {
      return [];
    }

    // Get all actual contributions for this pension
    const actualContributions = await ContributionModel.findByPensionId(pension.id);

    const expected: ExpectedContribution[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const expectedDate = new Date(
        current.getFullYear(),
        current.getMonth(),
        Math.min(pension.day_of_month, new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate())
      );

      const status = contributionService.determineStatus(
        expectedDate,
        actualContributions,
        pension.monthly_amount
      );

      const matchingContribution = contributionService.findMatchingContribution(
        expectedDate,
        actualContributions
      );

      expected.push({
        date: expectedDate.toISOString().split('T')[0],
        amount: pension.monthly_amount,
        status,
        actualContribution: matchingContribution,
      });

      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }

    return expected;
  },

  determineStatus: (
    expectedDate: Date,
    actualContributions: Contribution[],
    expectedAmount: number
  ): ContributionStatus => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    expectedDate.setHours(0, 0, 0, 0);

    // Check if contribution exists within grace period
    const found = actualContributions.find(c => {
      const contributionDate = new Date(c.contribution_date);
      contributionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.abs(
        (contributionDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if within grace period and amount matches (within 10% tolerance)
      const amountMatches = Math.abs(c.amount - expectedAmount) / expectedAmount < 0.1;

      return daysDiff <= GRACE_PERIOD_DAYS && amountMatches;
    });

    if (found) return 'received';

    // If expected date is in the future, it's pending
    if (expectedDate > now) return 'pending';

    // Calculate how many days late
    const daysLate = Math.floor((now.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysLate > GRACE_PERIOD_DAYS ? 'missing' : 'late';
  },

  findMatchingContribution: (
    expectedDate: Date,
    actualContributions: Contribution[]
  ): Contribution | undefined => {
    expectedDate.setHours(0, 0, 0, 0);

    return actualContributions.find(c => {
      const contributionDate = new Date(c.contribution_date);
      contributionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.abs(
        (contributionDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysDiff <= GRACE_PERIOD_DAYS;
    });
  },

  getMissingContributions: async (pension: Pension): Promise<MissingContribution[]> => {
    if (pension.contribution_type !== 'regular_fixed') {
      return [];
    }

    // Calculate expected contributions for the last 12 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const expectedContributions = await contributionService.calculateExpectedContributions(
      pension,
      startDate,
      endDate
    );

    const now = new Date();
    const missing: MissingContribution[] = [];

    for (const expected of expectedContributions) {
      if (expected.status === 'missing') {
        const expectedDate = new Date(expected.date);
        const daysOverdue = Math.floor(
          (now.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        missing.push({
          expected_date: expected.date,
          amount: expected.amount,
          days_overdue: daysOverdue,
        });
      }
    }

    return missing;
  },
};
