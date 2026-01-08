import { Router, Request, Response } from "express";
import { HoldingModel } from "../models/Holding";
import { PensionModel } from "../models/Pension";
import { requireAuth } from "../middleware/auth";

const router = Router();

// All holding routes require authentication
router.use(requireAuth);

// Get all holdings for a pension
router.get(
  "/pensions/:pensionId/holdings",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const pensionId = parseInt(req.params.pensionId);
      const pension = await PensionModel.findById(pensionId);

      if (!pension) {
        res.status(404).json({ error: "Pension not found" });
        return;
      }

      // Verify ownership
      if (pension.user_id !== req.session.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const holdings = await HoldingModel.findByPensionId(pensionId);
      res.json({ holdings });
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ error: "Failed to fetch holdings" });
    }
  }
);

// Create holding
router.post(
  "/pensions/:pensionId/holdings",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const pensionId = parseInt(req.params.pensionId);
      const { ticker, shares, currency_unit } = req.body;

      // Validation
      if (!ticker || !shares) {
        res.status(400).json({ error: "Ticker and shares are required" });
        return;
      }

      if (shares <= 0) {
        res.status(400).json({ error: "Shares must be positive" });
        return;
      }

      if (!/^[A-Z0-9]{1,5}$/i.test(ticker)) {
        res.status(400).json({ error: "Invalid ticker format" });
        return;
      }

      if (currency_unit && !["pounds", "pence"].includes(currency_unit)) {
        res.status(400).json({ error: "Invalid currency unit" });
        return;
      }

      const pension = await PensionModel.findById(pensionId);

      if (!pension) {
        res.status(404).json({ error: "Pension not found" });
        return;
      }

      // Verify ownership
      if (pension.user_id !== req.session.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      // Check if holding already exists
      const existing = await HoldingModel.findByPensionIdAndTicker(
        pensionId,
        ticker
      );
      if (existing) {
        res
          .status(400)
          .json({ error: "Holding for this ticker already exists" });
        return;
      }

      const id = await HoldingModel.create({
        pension_id: pensionId,
        ticker,
        shares,
        currency_unit,
      });

      const holding = await HoldingModel.findById(id);
      res.status(201).json({ holding });
    } catch (error) {
      console.error("Error creating holding:", error);
      res.status(500).json({ error: "Failed to create holding" });
    }
  }
);

// Update holding
router.put(
  "/holdings/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const holding = await HoldingModel.findById(id);

      if (!holding) {
        res.status(404).json({ error: "Holding not found" });
        return;
      }

      // Verify ownership through pension
      const pension = await PensionModel.findById(holding.pension_id);
      if (!pension || pension.user_id !== req.session.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const { ticker, shares, currency_unit } = req.body;

      // Validate ticker format if provided
      if (ticker && !/^[A-Z0-9]{1,5}$/i.test(ticker)) {
        res.status(400).json({ error: "Invalid ticker format" });
        return;
      }

      // Validate shares if provided
      if (shares !== undefined && shares <= 0) {
        res.status(400).json({ error: "Shares must be positive" });
        return;
      }

      // Validate currency_unit if provided
      if (currency_unit && !["pounds", "pence"].includes(currency_unit)) {
        res.status(400).json({ error: "Invalid currency unit" });
        return;
      }

      await HoldingModel.update(id, {
        ticker,
        shares,
        currency_unit,
      });

      const updated = await HoldingModel.findById(id);
      res.json({ holding: updated });
    } catch (error) {
      console.error("Error updating holding:", error);
      res.status(500).json({ error: "Failed to update holding" });
    }
  }
);

// Delete holding
router.delete(
  "/holdings/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const holding = await HoldingModel.findById(id);

      if (!holding) {
        res.status(404).json({ error: "Holding not found" });
        return;
      }

      // Verify ownership through pension
      const pension = await PensionModel.findById(holding.pension_id);
      if (!pension || pension.user_id !== req.session.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      await HoldingModel.delete(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting holding:", error);
      res.status(500).json({ error: "Failed to delete holding" });
    }
  }
);

export default router;
