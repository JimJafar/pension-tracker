import { Router, Request, Response } from 'express';
import { alphaVantageService } from '../services/alphaVantageService';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All stock routes require authentication
router.use(requireAuth);

// Get prices for multiple tickers
router.get('/prices', async (req: Request, res: Response): Promise<void> => {
  try {
    const tickersParam = req.query.tickers as string;

    if (!tickersParam) {
      res.status(400).json({ error: 'Tickers parameter is required' });
      return;
    }

    const tickers = tickersParam.split(',').map(t => t.trim().toUpperCase());

    if (tickers.length === 0) {
      res.status(400).json({ error: 'At least one ticker is required' });
      return;
    }

    if (tickers.length > 10) {
      res.status(400).json({ error: 'Maximum 10 tickers per request' });
      return;
    }

    const prices = await alphaVantageService.getPrices(tickers);
    res.json({ prices });
  } catch (error) {
    console.error('Error fetching stock prices:', error);
    res.status(500).json({ error: 'Failed to fetch stock prices' });
  }
});

// Get quote for a single ticker
router.get('/quote/:ticker', async (req: Request, res: Response): Promise<void> => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const quote = await alphaVantageService.getPrice(ticker);

    if (!quote) {
      res.status(404).json({ error: 'Stock quote not found' });
      return;
    }

    res.json(quote);
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    res.status(500).json({ error: 'Failed to fetch stock quote' });
  }
});

export default router;
