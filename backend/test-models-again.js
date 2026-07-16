const { GoogleGenAI } = require('@google/genai');
async function run() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDhcj2m8LcUXgukjixM1-2dFtOP-7nWZ2w';
  const ai = new GoogleGenAI({ apiKey });
  
  const testModels = [
    'gemini-flash-latest',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001',
    'gemini-1.5-flash-latest'
  ];

  for (const model of testModels) {
    try {
      const res = await ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      });
      console.log(`✅ ${model} works!`);
      return; // Exit after first success
    } catch(e) {
      console.log(`❌ ${model} failed: ${e.message}`);
    }
  }
}
run();
