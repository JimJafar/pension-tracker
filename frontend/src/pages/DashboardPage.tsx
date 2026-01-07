import React, { useEffect, useState } from "react";
import { pensionApi } from "../api/pensions";
import { holdingApi } from "../api/holdings";
import type {
  PensionWithTotals,
  Holding,
  HoldingWithPrice,
} from "../types/pension";
import { useStockPrices } from "../hooks/useStockPrices";
import PensionCard from "../components/pension/PensionCard";
import Layout from "../components/common/Layout";

const DashboardPage: React.FC = () => {
  const [pensions, setPensions] = useState<PensionWithTotals[]>([]);
  const [pensionHoldings, setPensionHoldings] = useState<{
    [pensionId: number]: Holding[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPensions = await pensionApi.getAll();
      setPensions(fetchedPensions);

      // Fetch holdings for SIPP pensions
      const holdingsMap: { [pensionId: number]: Holding[] } = {};
      for (const pension of fetchedPensions) {
        if (pension.type === "SIPP") {
          const holdings = await holdingApi.getByPensionId(pension.id);
          holdingsMap[pension.id] = holdings;
        }
      }
      setPensionHoldings(holdingsMap);
    } catch (err) {
      setError("Failed to load pensions");
      console.error("Error loading pensions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tickers from all holdings
  const allTickers = Object.values(pensionHoldings)
    .flat()
    .map((h) => h.ticker);
  const uniqueTickers = Array.from(new Set(allTickers));

  // Fetch stock prices for all holdings
  const { prices } = useStockPrices(uniqueTickers, uniqueTickers.length > 0);

  // Calculate current values and enrich holdings with prices
  const enrichedPensions = pensions.map((pension) => {
    const holdings = pensionHoldings[pension.id] || [];
    const holdingsWithPrices: HoldingWithPrice[] = holdings.map((holding) => {
      const stockPrice = prices[holding.ticker];
      const currentPrice = stockPrice?.price;
      const totalValue = currentPrice
        ? currentPrice * holding.shares
        : undefined;

      return {
        ...holding,
        current_price:
          currentPrice && currentPrice > 300
            ? currentPrice / 100
            : currentPrice,
        total_value:
          totalValue && (currentPrice || 0) > 300
            ? totalValue / 100
            : totalValue,
        currency: stockPrice?.currency,
      };
    });

    // Calculate total current value for SIPP pensions
    const currentValue =
      pension.type === "SIPP"
        ? holdingsWithPrices.reduce((sum, h) => sum + (h.total_value || 0), 0)
        : pension.total_contributions;

    return {
      ...pension,
      current_value: currentValue,
      holdings: holdingsWithPrices,
    };
  });

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>Loading pensions...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={styles.error}>{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h1 style={styles.pageTitle}>My Pensions</h1>
        {enrichedPensions.length === 0 ? (
          <div style={styles.empty}>
            <p>No pensions yet. Add your first pension to get started!</p>
          </div>
        ) : (
          enrichedPensions.map((pension) => (
            <PensionCard
              key={pension.id}
              pension={pension}
              holdings={pension.holdings || []}
            />
          ))
        )}
      </div>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageTitle: {
    marginBottom: "2rem",
    color: "#333",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    fontSize: "1.125rem",
    color: "#6c757d",
  },
  error: {
    textAlign: "center",
    padding: "3rem",
    fontSize: "1.125rem",
    color: "#dc3545",
  },
  empty: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "white",
    borderRadius: "8px",
    color: "#6c757d",
  },
};

export default DashboardPage;
