import { translations } from './src/lib/i18n/translations.ts';

function getAllKeys(obj, prefix = '') {
  const keys = new Set();
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (obj[key] && typeof obj[key] === 'object' && !('en' in obj[key])) {
      getAllKeys(obj[key], fullKey);
    } else {
      keys.add(fullKey);
    }
  }
  return keys;
}

const validKeys = getAllKeys(translations);

// Leer desde stdin
const input = process.stdin.read();
const lines = input.split('\n').filter(l => l.trim());

const missingKeys = new Set();
const usedKeys = new Set();

for (const line of lines) {
  // Extraer clave de t('...')
  const match = line.match(/t\('([^']+)'\)/);
  if (match) {
    const key = match[1];
    usedKeys.add(key);
    if (!validKeys.has(key)) {
      missingKeys.add(key);
    }
  }
}

console.log('=== CLAVES I18N FALTANTES ===');
console.log(`Total usadas: ${usedKeys.size}`);
console.log(`Total válidas: ${validKeys.size}`);
console.log(`Faltantes: ${missingKeys.size}\n`);

if (missingKeys.size > 0) {
  const sorted = [...missingKeys].sort();
  for (const key of sorted) {
    console.log(`  MISSING: ${key}`);
  }
} else {
  console.log('✅ Todas las claves están definidas!');
}
