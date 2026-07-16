const { GoogleGenAI } = require('@google/genai');
async function run() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDhcj2m8LcUXgukjixM1-2dFtOP-7nWZ2w';
  const ai = new GoogleGenAI({ apiKey });
  try {
    const list = await ai.models.list();
    for await (const m of list) {
      console.log(m.name);
    }
  } catch(e) {
    console.log("Error listing:", e.message);
  }
}
run();
