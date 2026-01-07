import { Router, Request, Response } from 'express';
import { PensionModel } from '../models/Pension';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All pension routes require authentication
router.use(requireAuth);

// Get all pensions for current user
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.session.userId!;
    const pensions = await PensionModel.findByUserIdWithTotals(userId);
    res.json({ pensions });
  } catch (error) {
    console.error('Error fetching pensions:', error);
    res.status(500).json({ error: 'Failed to fetch pensions' });
  }
});

// Get single pension
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const pension = await PensionModel.findById(id);

    if (!pension) {
      res.status(404).json({ error: 'Pension not found' });
      return;
    }

    // Verify ownership
    if (pension.user_id !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json({ pension });
  } catch (error) {
    console.error('Error fetching pension:', error);
    res.status(500).json({ error: 'Failed to fetch pension' });
  }
});

// Create pension
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, contribution_type, monthly_amount, day_of_month } = req.body;

    // Validation
    if (!name || !type || !contribution_type) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!['SIPP', 'managed'].includes(type)) {
      res.status(400).json({ error: 'Invalid pension type' });
      return;
    }

    if (!['regular_fixed', 'manual'].includes(contribution_type)) {
      res.status(400).json({ error: 'Invalid contribution type' });
      return;
    }

    if (contribution_type === 'regular_fixed') {
      if (!monthly_amount || !day_of_month) {
        res.status(400).json({ error: 'Monthly amount and day of month required for regular fixed contributions' });
        return;
      }
      if (day_of_month < 1 || day_of_month > 31) {
        res.status(400).json({ error: 'Day of month must be between 1 and 31' });
        return;
      }
    }

    const userId = req.session.userId!;
    const id = await PensionModel.create({
      user_id: userId,
      name,
      type,
      contribution_type,
      monthly_amount: contribution_type === 'regular_fixed' ? monthly_amount : undefined,
      day_of_month: contribution_type === 'regular_fixed' ? day_of_month : undefined,
    });

    const pension = await PensionModel.findById(id);
    res.status(201).json({ pension });
  } catch (error) {
    console.error('Error creating pension:', error);
    res.status(500).json({ error: 'Failed to create pension' });
  }
});

// Update pension
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const pension = await PensionModel.findById(id);

    if (!pension) {
      res.status(404).json({ error: 'Pension not found' });
      return;
    }

    // Verify ownership
    if (pension.user_id !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { name, type, contribution_type, monthly_amount, day_of_month } = req.body;

    await PensionModel.update(id, {
      name,
      type,
      contribution_type,
      monthly_amount,
      day_of_month,
    });

    const updated = await PensionModel.findById(id);
    res.json({ pension: updated });
  } catch (error) {
    console.error('Error updating pension:', error);
    res.status(500).json({ error: 'Failed to update pension' });
  }
});

// Delete pension
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const pension = await PensionModel.findById(id);

    if (!pension) {
      res.status(404).json({ error: 'Pension not found' });
      return;
    }

    // Verify ownership
    if (pension.user_id !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await PensionModel.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting pension:', error);
    res.status(500).json({ error: 'Failed to delete pension' });
  }
});

export default router;
