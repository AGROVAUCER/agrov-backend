/**
 * PDF REPORT SERVICE
 * - generiše mesečni PDF za firmu
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { getMonthlySummary } from './monthlySummary.service.js';

export async function generateMonthlyPdf({ firmId, firmName, year, month }) {
  const summary = await getMonthlySummary({ firmId, year, month });

  const fileName = `report_${firmId}_${year}_${month}.pdf`;
  const filePath = path.join(process.cwd(), 'tmp', fileName);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).text('AGROV – Monthly Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Firm: ${firmName}`);
  doc.text(`Period: ${year}-${String(month).padStart(2,'0')}`);
  doc.moveDown();

  doc.text(`System credit: ${summary.system_credit}`);
  doc.text(`System debit: ${summary.system_debit}`);
  doc.text(`Operational GIVE: ${summary.operational_give}`);
  doc.text(`Operational TAKE: ${summary.operational_take}`);
  doc.moveDown();

  doc.fontSize(14).text(`Ending balance: ${summary.ending_balance}`);

  doc.end();

  await new Promise(res => stream.on('finish', res));

  return { filePath, fileName };
}
