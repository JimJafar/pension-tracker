import client from './client';
import { StockPrice } from '../types/pension';

export const stockApi = {
  getPrices: async (tickers: string[]): Promise<{ [ticker: string]: StockPrice | null }> => {
    const response = await client.get<{ prices: { [ticker: string]: StockPrice | null } }>(
      '/stocks/prices',
      { params: { tickers: tickers.join(',') } }
    );
    return response.data.prices;
  },

  getQuote: async (ticker: string): Promise<StockPrice> => {
    const response = await client.get<StockPrice>(`/stocks/quote/${ticker}`);
    return response.data;
  },
};
