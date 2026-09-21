import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '256kb' }));

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const formatTriggers = (triggers = []) => triggers.length
  ? triggers.map((entry) => `<li>${escapeHtml(entry.trigger)}${entry.comment ? `: ${escapeHtml(entry.comment)}` : ''}</li>`).join('')
  : '<li>No triggers logged.</li>';

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

app.post('/api/send-report', async (request, response) => {
  const { report, user } = request.body || {};
  const recipients = [report?.emailToSend, report?.secondaryEmailToSend]
    .filter((recipient) => typeof recipient === 'string' && recipient.trim());
  const transporter = createTransporter();

  if (!transporter || !process.env.SMTP_FROM) {
    return response.status(503).json({ error: 'SMTP email delivery is not configured.' });
  }
  if (!report || !recipients.length) {
    return response.status(400).json({ error: 'A report and at least one recipient are required.' });
  }

  const subject = `Look Away report: ${report.startDate} to ${report.endDate}`;
  const text = [
    `Look Away report for ${user?.name || 'Look Away member'}`,
    `Date range: ${report.startDate} to ${report.endDate}`,
    `Created: ${report.createdAt}`,
    '',
    `General comments: ${report.generalComments || 'No general comments recorded.'}`,
    '',
    'Triggers:',
    ...(report.triggers || []).map((entry) => `- ${entry.trigger}${entry.comment ? `: ${entry.comment}` : ''}`),
  ].join('\n');
  const html = `
    <h1>Look Away report</h1>
    <p><strong>Member:</strong> ${escapeHtml(user?.name || 'Look Away member')}</p>
    <p><strong>Date range:</strong> ${escapeHtml(report.startDate)} to ${escapeHtml(report.endDate)}</p>
    <p><strong>Created:</strong> ${escapeHtml(report.createdAt)}</p>
    <p><strong>General comments:</strong> ${escapeHtml(report.generalComments || 'No general comments recorded.')}</p>
    <h2>Triggers</h2>
    <ul>${formatTriggers(report.triggers)}</ul>`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: [...new Set(recipients)],
      subject,
      text,
      html,
    });
    return response.json({ sent: true });
  } catch (error) {
    console.error('SMTP report delivery failed:', error);
    return response.status(502).json({ error: 'The report email could not be sent.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_request, response) => response.sendFile(path.join(__dirname, 'dist', 'index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true, host: true } });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Look Away server listening on http://localhost:${port}`);
});