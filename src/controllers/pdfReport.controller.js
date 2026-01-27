/**
 * PDF REPORT CONTROLLER (ADMIN)
 */

import { generateMonthlyPdf } from '../services/pdfReport.service.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function generateMonthlyPdfController(req, res) {
  try {
    const { id: firmId, year, month } = req.params;

    const { data: firm } = await supabase
      .from('firms')
      .select('name')
      .eq('id', firmId)
      .single();

    if (!firm) throw new Error('Firm not found');

    const { filePath, fileName } = await generateMonthlyPdf({
      firmId,
      firmName: firm.name,
      year,
      month
    });

    res.download(filePath, fileName);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
