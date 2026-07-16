const { GoogleGenAI } = require('@google/genai');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDhcj2m8LcUXgukjixM1-2dFtOP-7nWZ2w';
  const ai = new GoogleGenAI({ apiKey });
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
    });
    console.log("gemini-1.5-flash works!", res.text);
  } catch(e) {
    console.error("gemini-1.5-flash failed:", e.message);
    try {
      const res2 = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      });
      console.log("gemini-2.0-flash works!", res2.text);
    } catch(e2) {
      console.error("gemini-2.0-flash failed:", e2.message);
      try {
        const res3 = await ai.models.generateContent({
          model: 'gemini-1.5-pro',
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        });
        console.log("gemini-1.5-pro works!", res3.text);
      } catch(e3) {
        console.error("gemini-1.5-pro failed:", e3.message);
      }
    }
  }
}

run();
