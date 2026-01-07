import { Router, Request, Response } from 'express';
import { ContributionModel } from '../models/Contribution';
import { PensionModel } from '../models/Pension';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All contribution routes require authentication
router.use(requireAuth);

// Get all contributions for a pension
router.get('/pensions/:pensionId/contributions', async (req: Request, res: Response): Promise<void> => {
  try {
    const pensionId = parseInt(req.params.pensionId);
    const pension = await PensionModel.findById(pensionId);

    if (!pension) {
      res.status(404).json({ error: 'Pension not found' });
      return;
    }

    // Verify ownership
    if (pension.user_id !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const contributions = await ContributionModel.findByPensionId(pensionId);
    res.json({ contributions });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// Create contribution
router.post('/pensions/:pensionId/contributions', async (req: Request, res: Response): Promise<void> => {
  try {
    const pensionId = parseInt(req.params.pensionId);
    const { amount, contribution_date } = req.body;

    // Validation
    if (!amount || !contribution_date) {
      res.status(400).json({ error: 'Amount and contribution date are required' });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ error: 'Amount must be positive' });
      return;
    }

    const pension = await PensionModel.findById(pensionId);

    if (!pension) {
      res.status(404).json({ error: 'Pension not found' });
      return;
    }

    // Verify ownership
    if (pension.user_id !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const id = await ContributionModel.create({
      pension_id: pensionId,
      amount,
      contribution_date,
    });

    const contribution = await ContributionModel.findById(id);
    res.status(201).json({ contribution });
  } catch (error) {
    console.error('Error creating contribution:', error);
    res.status(500).json({ error: 'Failed to create contribution' });
  }
});

// Update contribution
router.put('/contributions/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const contribution = await ContributionModel.findById(id);

    if (!contribution) {
      res.status(404).json({ error: 'Contribution not found' });
      return;
    }

    // Verify ownership through pension
    const pension = await PensionModel.findById(contribution.pension_id);
    if (!pension || pension.user_id !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { amount, contribution_date } = req.body;

    await ContributionModel.update(id, {
      amount,
      contribution_date,
    });

    const updated = await ContributionModel.findById(id);
    res.json({ contribution: updated });
  } catch (error) {
    console.error('Error updating contribution:', error);
    res.status(500).json({ error: 'Failed to update contribution' });
  }
});

// Delete contribution
router.delete('/contributions/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const contribution = await ContributionModel.findById(id);

    if (!contribution) {
      res.status(404).json({ error: 'Contribution not found' });
      return;
    }

    // Verify ownership through pension
    const pension = await PensionModel.findById(contribution.pension_id);
    if (!pension || pension.user_id !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await ContributionModel.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contribution:', error);
    res.status(500).json({ error: 'Failed to delete contribution' });
  }
});

export default router;
