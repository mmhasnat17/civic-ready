import express from 'express';
import { initialCases, priorityFor, todayLocal, type CaseStatus, type CourtCase } from '../src/domain';

const app = express();
app.use(express.json({ limit: '16kb' }));
// Ephemeral, fictional records: restarting the server restores demo data.
let cases: CourtCase[] = initialCases();

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'CivicReady demo API' }));
app.get('/api/cases', (_req, res) => res.json(cases.map(item => ({ ...item, priority: priorityFor(item, todayLocal()) }))));
app.patch('/api/cases/:id/status', (req, res) => {
  const allowed: CaseStatus[] = ['Pending','Contacted','Confirmed'];
  const { status } = req.body ?? {};
  if (!allowed.includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }
  const item = cases.find(entry => entry.id === req.params.id);
  if (!item) { res.status(404).json({ error: 'Case not found' }); return; }
  cases = cases.map(entry => entry.id === item.id ? { ...entry, status, lastContact: status === 'Contacted' ? todayLocal() : entry.lastContact } : entry);
  res.json(cases.find(entry => entry.id === item.id));
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`CivicReady API at http://localhost:${port}`));
