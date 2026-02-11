import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getMonthlySummary } from './monthlySummary.service.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EXPORT_DIR = path.join(process.cwd(), 'exports', 'reports');

export async function generateMonthlyReport({ firmId, year, month }) {
  const { data: firm } = await supabase
    .from('firms')
    .select('id,name')
    .eq('id', firmId)
    .single();

  if (!firm) throw new Error('Firm not found');

  const summary = await getMonthlySummary({ firmId, year, month });

  const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const periodEnd = `${year}-${String(month).padStart(2, '0')}-31`;

  const { data: points } = await supabase
    .from('points_ledger')
    .select('type, amount')
    .gte('created_at', periodStart)
    .lte('created_at', periodEnd);

  const pointsSummary = points.reduce(
    (acc, p) => {
      if (p.amount > 0) {
        if (p.type === 'user') acc.user_issued += p.amount;
        if (p.type === 'system') acc.system_issued += p.amount;
      } else {
        if (p.type === 'user') acc.user_spent += Math.abs(p.amount);
        if (p.type === 'system') acc.system_spent += Math.abs(p.amount);
      }
      return acc;
    },
    {
      user_issued: 0,
      user_spent: 0,
      system_issued: 0,
      system_spent: 0
    }
  );

  fs.mkdirSync(EXPORT_DIR, { recursive: true });

  const fileName = `report_${firmId}_${year}_${month}.pdf`;
  const filePath = path.join(EXPORT_DIR, fileName);

  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).text('AGROV – Monthly Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Firm: ${firm.name}`);
  doc.text(`Period: ${year}-${String(month).padStart(2, '0')}`);
  doc.moveDown();

  doc.fontSize(14).text('Financial Summary');
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Issued: ${summary.total_issued}`);
  doc.text(`Spent: ${summary.total_spent}`);
  doc.text(`Net balance: ${summary.net_balance}`);
  doc.moveDown();

  doc.fontSize(14).text('Loyalty Summary');
  doc.moveDown(0.5);
  doc.fontSize(12).text(`User points issued: ${pointsSummary.user_issued}`);
  doc.text(`User points spent: ${pointsSummary.user_spent}`);
  doc.text(`System points issued: ${pointsSummary.system_issued}`);
  doc.text(`System points spent: ${pointsSummary.system_spent}`);

  doc.end();
  await new Promise(res => stream.on('finish', res));

  const { data: report } = await supabase
    .from('reports')
    .insert({
      firm_id: firm.id,
      firm_name: firm.name,
      period: `${year}-${String(month).padStart(2, '0')}`,
      file_path: `/exports/reports/${fileName}`
    })
    .select()
    .single();

  return report;
}

export async function listReports() {
  const { data } = await supabase
    .from('reports')
    .select('id, firm_name, period, created_at')
    .order('created_at', { ascending: false });

  return data || [];
}

export async function getReportDownload(reportId) {
  const { data } = await supabase
    .from('reports')
    .select('file_path')
    .eq('id', reportId)
    .single();

  if (!data) throw new Error('Report not found');
  return { url: data.file_path };
}
