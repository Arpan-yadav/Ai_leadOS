import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ─── Gemini Setup ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const MODEL = 'gemini-1.5-flash';

// ─── Utility: Safe Gemini JSON Call ──────────────────────────────────────────
async function callGeminiJSON<T>(prompt: string): Promise<T | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const result = await genAI.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const text = result.text || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('[Gemini] Error:', err);
    return null;
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/analyze-company
 * Analyze a company website and return sales intelligence.
 * AI Team — Lead Analyzer Flow
 */
app.post('/api/analyze-company', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const prompt = `
You are an expert B2B sales intelligence analyst.
Analyze the company at website: ${url}

Return a JSON object with exactly these fields:
{
  "analysis": "2-sentence executive summary of what they do and their market position",
  "score": <integer 0-100 sales fitness score>,
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "nextAction": "single most important next sales action",
  "sentiment": "positive"
}
Only return valid JSON.`.trim();

  const data = await callGeminiJSON<object>(prompt);

  if (!data) {
    return res.json({
      analysis: `Demo Mode: ${url} appears to be a growing digital company. Connect your Gemini API key for real-time live intelligence.`,
      score: 78,
      opportunities: [
        'AI-powered workflow automation integration',
        'Enterprise tier upsell potential',
        'Multi-channel communication suite adoption',
      ],
      risks: [
        'Competitive pressure from established platforms',
        'Budget approval cycles may delay decision',
        'Technical integration complexity',
      ],
      nextAction: 'Schedule a 15-minute discovery call',
      sentiment: 'positive',
    });
  }

  res.json(data);
});

/**
 * POST /api/generate-outreach
 * Generate a personalized multi-channel outreach sequence.
 * AI Team — Outreach Sequence Generator
 */
app.post('/api/generate-outreach', async (req, res) => {
  const { leadName, company, context } = req.body;
  if (!leadName || !company) {
    return res.status(400).json({ error: 'leadName and company are required' });
  }

  const prompt = `
You are a senior B2B sales strategist. Create a 7-day multi-channel outreach sequence.
Lead Name: ${leadName}, Company: ${company}, Context: ${context || 'Standard B2B outreach'}

Return JSON:
{
  "leadName": "${leadName}",
  "company": "${company}",
  "totalDays": 7,
  "sequences": [
    { "day": 1, "channel": "email", "subject": "<subject>", "message": "<2-3 sentence message>" },
    { "day": 2, "channel": "linkedin", "subject": "LinkedIn Connection", "message": "<message>" },
    { "day": 3, "channel": "email", "subject": "<subject>", "message": "<message>" },
    { "day": 5, "channel": "whatsapp", "subject": "Quick check-in", "message": "<message>" },
    { "day": 7, "channel": "email", "subject": "<final subject>", "message": "<message>" }
  ]
}
Only return valid JSON.`.trim();

  const data = await callGeminiJSON<object>(prompt);

  if (!data) {
    return res.json({
      leadName,
      company,
      totalDays: 7,
      sequences: [
        { day: 1, channel: 'email', subject: `Quick question for ${company}`, message: `Hi ${leadName}, I noticed your recent work at ${company} and wanted to reach out about how we help similar companies scale their operations.` },
        { day: 2, channel: 'linkedin', subject: 'LinkedIn Connection', message: `${leadName}, connecting here to follow up on my email. Looking forward to learning more about your goals at ${company}.` },
        { day: 3, channel: 'email', subject: `Case study relevant to ${company}`, message: `I wanted to share a quick case study on how a company similar to ${company} increased their pipeline by 40%.` },
        { day: 5, channel: 'whatsapp', subject: 'Quick check-in', message: `Hi ${leadName}! Just wanted to check if you had a chance to review my previous messages. Happy to jump on a quick call!` },
        { day: 7, channel: 'email', subject: `Final note — ${company} partnership`, message: `${leadName}, this is my last note. If now isn't the right time, no worries at all. Feel free to reach out whenever ready!` },
      ],
    });
  }

  res.json(data);
});

/**
 * POST /api/score-lead
 * AI-powered lead scoring.
 * AI Team — Lead Scorer
 */
app.post('/api/score-lead', async (req, res) => {
  const { name, company, title, source, interactions } = req.body;

  const prompt = `
Score this B2B lead from 0-100:
Name: ${name}, Company: ${company}, Title: ${title}, Source: ${source}, Interactions: ${interactions || 0}

Return JSON: { "score": <integer>, "reason": "1-sentence rationale", "priority": "high|medium|low", "icpFit": <integer 0-100> }
Only valid JSON.`.trim();

  const data = await callGeminiJSON<object>(prompt);
  if (!data) {
    return res.json({ score: 70, reason: 'Demo mode — connect Gemini API key for AI scoring.', priority: 'medium', icpFit: 65 });
  }
  res.json(data);
});

/**
 * POST /api/suggest-workflows
 * Suggest automation workflows based on CRM context.
 * Automation Team — Workflow Suggester
 */
app.post('/api/suggest-workflows', async (req, res) => {
  const { context } = req.body;

  const prompt = `
You are an automation architect for a B2B SaaS CRM.
Context: ${context || 'Standard sales team with active lead pipeline'}

Suggest 3 high-impact automation workflows:
[
  { "title": "<name>", "trigger": "<trigger>", "actions": ["action 1", "action 2", "action 3"], "estimatedImpact": "<1-sentence impact>" }
]
Only return valid JSON array.`.trim();

  const data = await callGeminiJSON<object[]>(prompt);
  if (!data) {
    return res.json([
      { title: 'Hot Lead Alert', trigger: 'Lead score exceeds 80', actions: ['Slack alert to sales team', 'Create priority task', 'Trigger email sequence'], estimatedImpact: 'Reduce response time by 80%, improving close rates.' },
      { title: 'Re-engagement Drip', trigger: 'No activity for 14 days', actions: ['WhatsApp check-in', 'Update CRM status', 'Queue email sequence'], estimatedImpact: 'Recover 15-20% of cold leads back into pipeline.' },
      { title: 'Post-Demo Follow-up', trigger: 'Meeting marked as completed', actions: ['Send summary email', 'Create proposal task', 'Schedule 3-day reminder'], estimatedImpact: 'Increase deal progression rate by 35%.' },
    ]);
  }
  res.json(data);
});

// ─── Vite Dev Server Setup ────────────────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 AI LeadOS Server running at http://localhost:${PORT}`);
    console.log(`   AI endpoints ready: /api/analyze-company, /api/generate-outreach, /api/score-lead, /api/suggest-workflows`);
  });
}

startServer();
