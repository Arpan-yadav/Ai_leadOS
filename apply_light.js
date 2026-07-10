import fs from 'fs';

const files = [
  'frontend/app/(main)/tasks/page.tsx',
  'frontend/app/(main)/ai-intelligence/page.tsx',
  'frontend/app/(main)/sequences/page.tsx'
];

const replacements = [
  { search: /bg-\[#16161D\]/g, replace: 'bg-[#16161D] light:bg-white' },
  { search: /bg-\[#0A0A0C\]/g, replace: 'bg-[#0A0A0C] light:bg-slate-50' },
  { search: /border-\[#27272A\]/g, replace: 'border-[#27272A] light:border-slate-200' },
  { search: /text-white/g, replace: 'text-white light:text-slate-800' },
  { search: /text-\[#e5e1e4\]/g, replace: 'text-[#e5e1e4] light:text-slate-700' },
  { search: /text-\[#b9cacb\]/g, replace: 'text-[#b9cacb] light:text-slate-500' },
  { search: /bg-brand-500\/10/g, replace: 'bg-brand-500/10 light:bg-brand-50' },
  { search: /text-brand-400/g, replace: 'text-brand-400 light:text-brand-600' },
  { search: /text-brand-300/g, replace: 'text-brand-300 light:text-brand-600' },
  { search: /bg-\[#00f0ff\]\/10/g, replace: 'bg-[#00f0ff]/10 light:bg-blue-50' },
  { search: /text-\[#00f0ff\]/g, replace: 'text-[#00f0ff] light:text-blue-600' },
  { search: /bg-\[#bd00ff\]\/10/g, replace: 'bg-[#bd00ff]/10 light:bg-indigo-50' },
  { search: /text-\[#bd00ff\]/g, replace: 'text-[#bd00ff] light:text-indigo-600' },
  { search: /bg-\[#111114\]/g, replace: 'bg-[#111114] light:bg-slate-50' },
  { search: /hover:bg-\[#111114\]/g, replace: 'hover:bg-[#111114] light:hover:bg-slate-100' },
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  for (const r of replacements) {
    if (!content.includes(r.replace)) {
      content = content.replace(r.search, r.replace);
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
