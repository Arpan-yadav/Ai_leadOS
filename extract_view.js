import fs from 'fs';
import readline from 'readline';

const transcriptPath = 'C:\\Users\\Arpan yadav\\.gemini\\antigravity-ide\\brain\\0191bf8b-256a-43b7-a23e-752fcdf17c19\\.system_generated\\logs\\transcript_full.jsonl';

const targetFiles = [
  'sidebar.tsx',
  'topbar.tsx',
  'dashboard/page.tsx',
  'leads/page.tsx',
  'pipeline/page.tsx',
  'leaddetailpanel.tsx',
  'layout.tsx'
];

async function extractViewFileOutputs() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let stepIndex = 0;
  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      stepIndex = obj.step_index || stepIndex + 1;
      
      if (obj.type === 'VIEW_FILE' || obj.type === 'TOOL_RESPONSE') {
        const content = obj.content || '';
        if (content.includes('File Path:')) {
          const match = content.match(/File Path: `file:\/\/(.+?)`/);
          if (match) {
            let pathStr = match[1].toLowerCase();
            for (const t of targetFiles) {
              if (pathStr.includes(t)) {
                const lines = content.split('\n');
                let startIdx = lines.findIndex(l => l.startsWith('The following code has been modified to include a line number before every line'));
                let endIdx = lines.findIndex(l => l.startsWith('The above content shows the entire, complete file contents of the requested file.'));
                
                if (startIdx !== -1 && endIdx !== -1) {
                  let fileContent = lines.slice(startIdx + 1, endIdx).map(l => {
                    const colonIdx = l.indexOf(': ');
                    return colonIdx !== -1 ? l.substring(colonIdx + 2) : l;
                  }).join('\n');
                  
                  const cleanName = t.replace(/[\/\\]/g, '_');
                  const filename = `recovery_${cleanName}_step${stepIndex}.tsx`;
                  fs.writeFileSync(filename, fileContent);
                  console.log(`Saved ${filename}`);
                }
              }
            }
          }
        }
      }
    } catch (e) {}
  }
}

extractViewFileOutputs();
