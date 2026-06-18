import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini Setup
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.post('/api/analyze-company', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    // Fallback if API KEY is missing (for UX demo safety)
    return res.json({
        analysis: `Demo Mode: Stripe is a financial infrastructure platform for the internet. Millions of companies use Stripe's software and APIs to accept payments and manage their businesses online. [Connect Gemini API Key for real-time live audits]`,
        score: 95,
        opportunities: [
          'High demand for cross-border payment automation',
          'Integration with legacy ERP systems needed',
          'Opportunity for AI-driven fraud detection services'
        ],
        risks: [
          'Increasing regulatory compliance in EU markets',
          'Competitive pressure from regional payment providers',
          'Transaction fee compression'
        ]
    });
  }

  try {
    const prompt = `Analyze the company with website: ${url}. 
    Return a JSON object with the following fields:
    - analysis (string): A 2-sentence executive summary of what they do and their market position.
    - score (number): A sales fitness score from 0-100 based on modern SaaS scalability.
    - opportunities (string[]): A list of 3 specific B2B sales/upsell opportunities.
    - risks (string[]): A list of 3 specific business or operational risks.
    
    Ensure the response is valid JSON only.`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    const text = result.text || '';
    
    // Clean JSON from markdown if present
    const cleanedJson = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanedJson);
    res.json(data);
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
