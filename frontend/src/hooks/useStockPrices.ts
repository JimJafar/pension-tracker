import { useState, useEffect } from 'react';
import { stockApi } from '../api/stocks';
import { StockPrice } from '../types/pension';

export const useStockPrices = (tickers: string[], enabled: boolean = true) => {
  const [prices, setPrices] = useState<{ [ticker: string]: StockPrice | null }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || tickers.length === 0) return;

    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await stockApi.getPrices(tickers);
        setPrices(result);
      } catch (err) {
        setError('Failed to fetch stock prices');
        console.error('Error fetching stock prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, [tickers.join(','), enabled]);

  return { prices, loading, error };
};
