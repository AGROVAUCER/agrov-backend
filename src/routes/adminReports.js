import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { generateFirmReportPDF } from '../services/pdfReportService.js';
import { db } from '../db.js';

const router = express.Router();

router.get('/admin/reports/firm/:firmId/pdf', requireAdmin, async (req, res) => {
  const { firmId } = req.params;
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'from/to required' });
  }

  const firm = await db.one(
    'SELECT id, name FROM firms WHERE id = $1',
    [firmId]
  );

  const transactions = await db.any(
    `
    SELECT type, amount, created_at, user_id
    FROM transactions
    WHERE firm_id = $1
      AND created_at BETWEEN $2 AND $3
    ORDER BY created_at ASC
    `,
    [firmId, from, to]
  );

  const pdfBuffer = await generateFirmReportPDF({
    firm,
    transactions,
    from,
    to,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="agrov-${firm.name}-${from}-${to}.pdf"`
  );

  res.send(pdfBuffer);
});

export default router;
