import fs from 'fs';

// Fix YCPUSimulator.tsx: t('ycpu.' -> t('tools.ycpu.')
let y = fs.readFileSync('components/tools/YCPUSimulator.tsx', 'utf8');
const yBefore = (y.match(/t\('ycpu\./g) || []).length;
y = y.replace(/t\('ycpu\./g, "t('tools.ycpu.");
fs.writeFileSync('components/tools/YCPUSimulator.tsx', y);
console.log('YCPU replacements:', yBefore);

// Fix Yspeech.tsx: t('yspeech.' -> t('tools.yspeech.')
let s = fs.readFileSync('components/tools/Yspeech.tsx', 'utf8');
const sBefore = (s.match(/t\('yspeech\./g) || []).length;
s = s.replace(/t\('yspeech\./g, "t('tools.yspeech.");
fs.writeFileSync('components/tools/Yspeech.tsx', s);
console.log('Yspeech replacements:', sBefore);

// Fix tools/page.tsx labelKeys
let p = fs.readFileSync('app/tools/page.tsx', 'utf8');
p = p.replace(/'ycpu\.title'/g, "'tools.ycpu.title'");
p = p.replace(/'yspeech\.title'/g, "'tools.yspeech.title'");
fs.writeFileSync('app/tools/page.tsx', p);
console.log('tools/page.tsx fixed');

// Fix select transparency in tools/page.tsx
const oldSelect = 'bg-surface px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-light/50 cursor-pointer';
const newSelect = 'bg-transparent px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-light/50 cursor-pointer dark:[&>option]:bg-[#0c0c16] [&>option]:bg-[#f8f9fc] [&>option]:text-body';
let p2 = fs.readFileSync('app/tools/page.tsx', 'utf8');
if (p2.includes(oldSelect)) {
  p2 = p2.replace(oldSelect, newSelect);
  fs.writeFileSync('app/tools/page.tsx', p2);
  console.log('select styled transparent');
} else {
  console.log('select pattern not found');
}
