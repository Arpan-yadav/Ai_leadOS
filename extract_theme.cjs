const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Arpan yadav\\.gemini\\antigravity-ide\\brain\\0191bf8b-256a-43b7-a23e-752fcdf17c19\\.system_generated\\logs\\transcript_full.jsonl';

const targetFiles = [
  'c:\\Users\\Arpan yadav\\Desktop\\ProyoTech\\AI_LeadOS\\frontend\\components\\layout\\Sidebar.tsx',
  'c:\\Users\\Arpan yadav\\Desktop\\ProyoTech\\AI_LeadOS\\frontend\\components\\layout\\TopBar.tsx',
  'c:\\Users\\Arpan yadav\\Desktop\\ProyoTech\\AI_LeadOS\\frontend\\app\\(main)\\dashboard\\page.tsx',
  'c:\\Users\\Arpan yadav\\Desktop\\ProyoTech\\AI_LeadOS\\frontend\\app\\(main)\\layout.tsx',
];

const fileContents = {};

async function processLineByLine() {
  const fileStream = fs.createReadStream(transcriptPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'PLANNER_RESPONSE' && obj.tool_calls) {
        for (const tool of obj.tool_calls) {
          if (tool.name === 'default_api:write_to_file') {
            const target = tool.args.TargetFile || tool.args.targetFile;
            if (target && targetFiles.map(t => t.toLowerCase()).includes(target.toLowerCase())) {
              fileContents[target.toLowerCase()] = tool.args.CodeContent || tool.args.codeContent;
            }
          }
        }
      }
    } catch (e) {}
  }

  // Now, check if we found them
  for (const f of targetFiles) {
    const key = f.toLowerCase();
    if (fileContents[key]) {
      console.log(`Found content for ${f}, length: ${fileContents[key].length}`);
      fs.writeFileSync(f, fileContents[key]);
      console.log(`Restored ${f}`);
    } else {
      console.log(`Did NOT find content for ${f}`);
    }
  }
}

processLineByLine();
