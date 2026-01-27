/**
 * MONTHLY EMAIL JOB
 * - jednom mesečno
 * - admin/firma dobija PDF
 */

import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { generateMonthlyPdf } from '../services/pdfReport.service.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// svakog 1. u mesecu u 02:00
cron.schedule('0 2 1 * *', async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // prethodni mesec

  const { data: firms } = await supabase
    .from('firms')
    .select('id, name, contact_email')
    .eq('status', 'active');

  for (const firm of firms || []) {
    if (!firm.contact_email) continue;

    const { filePath, fileName } = await generateMonthlyPdf({
      firmId: firm.id,
      firmName: firm.name,
      year,
      month
    });

    await transporter.sendMail({
      to: firm.contact_email,
      subject: `AGROV Monthly Report ${year}-${month}`,
      text: 'Monthly report attached.',
      attachments: [{ filename: fileName, path: filePath }]
    });
  }
});
