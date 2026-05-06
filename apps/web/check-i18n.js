const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const content = fs.readFileSync(translationsPath, 'utf8');

function extractKeys(text) {
  const keys = new Set();
  const lines = text.split('\n');
  const stack = [];
  
  for (const line of lines) {
    const indent = line.search(/\S/);
    const depth = Math.floor(indent / 2);
    
    while (stack.length > depth) stack.pop();
    
    const keyMatch = line.match(/^\s*(\w+):\s*{/);
    if (keyMatch) {
      stack.push(keyMatch[1]);
      const fullKey = stack.join('.');
      const hasTranslation = line.includes('en:') || line.includes('es:');
      if (hasTranslation) {
        keys.add(fullKey);
      }
    }
  }
  
  return keys;
}

const validKeys = extractKeys(content);
console.log(`Valid keys: ${validKeys.size}`);

const usedKeysPath = '/tmp/used_keys.txt';
const usedKeysText = fs.readFileSync(usedKeysPath, 'utf8');
const usedKeys = usedKeysText.split('\n').filter(k => k.trim().length > 0 && !k.includes(' '));

let broken = 0;
const brokenList = [];

for (const key of usedKeys) {
  if (!validKeys.has(key)) {
    broken++;
    brokenList.push(key);
  }
}

console.log(`Broken keys: ${broken}\n`);
brokenList.sort().forEach(k => console.log(`MISSING: ${k}`));
