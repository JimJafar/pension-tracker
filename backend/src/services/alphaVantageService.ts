import axios from "axios";
import { config } from "../config/env";

interface PriceCache {
  [ticker: string]: {
    price: number;
    timestamp: number;
    currency: string;
  };
}

interface StockPrice {
  ticker: string;
  price: number;
  timestamp: string;
  currency: string;
}

class AlphaVantageService {
  private cache: PriceCache = {};
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  private readonly API_KEY: string;
  private requestQueue: Promise<any> = Promise.resolve();
  private readonly REQUEST_DELAY = 12000; // 12 seconds between requests (5/min limit)

  constructor() {
    this.API_KEY = config.alphaVantageApiKey;
  }

  async getPrice(ticker: string): Promise<StockPrice | null> {
    try {
      // Check cache first
      const cached = this.cache[ticker];
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return {
          ticker,
          price: cached.price,
          timestamp: new Date(cached.timestamp).toISOString(),
          currency: cached.currency,
        };
      }

      // Queue the request to respect rate limits
      return await this.queueRequest(async () => {
        const response = await axios.get("https://www.alphavantage.co/query", {
          params: {
            function: "GLOBAL_QUOTE",
            symbol: `${ticker}.LON`,
            apikey: this.API_KEY,
          },
        });

        const globalQuote = response.data["Global Quote"];

        if (!globalQuote || !globalQuote["05. price"]) {
          console.error(`No price data for ticker: ${ticker}`);
          return null;
        }

        const price = parseFloat(globalQuote["05. price"]);
        const timestamp = Date.now();

        // Cache the price
        this.cache[ticker] = {
          price,
          timestamp,
          currency: "USD", // AlphaVantage returns USD prices
        };

        return {
          ticker,
          price,
          timestamp: new Date(timestamp).toISOString(),
          currency: "USD",
        };
      });
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      return null;
    }
  }

  async getPrices(
    tickers: string[]
  ): Promise<{ [ticker: string]: StockPrice | null }> {
    const results: { [ticker: string]: StockPrice | null } = {};

    // Process tickers sequentially to respect rate limits
    for (const ticker of tickers) {
      results[ticker] = await this.getPrice(ticker);
    }

    return results;
  }

  private async queueRequest<T>(fn: () => Promise<T>): Promise<T> {
    // Wait for previous request to complete
    await this.requestQueue;

    // Execute current request
    const result = fn();

    // Queue the delay for next request
    this.requestQueue = result.then(
      () => new Promise((resolve) => setTimeout(resolve, this.REQUEST_DELAY)),
      () => new Promise((resolve) => setTimeout(resolve, this.REQUEST_DELAY))
    );

    return result;
  }

  // Clear old cache entries (call periodically if needed)
  clearStaleCache(): void {
    const now = Date.now();
    for (const ticker in this.cache) {
      if (now - this.cache[ticker].timestamp > this.CACHE_TTL) {
        delete this.cache[ticker];
      }
    }
  }
}

export const alphaVantageService = new AlphaVantageService();
