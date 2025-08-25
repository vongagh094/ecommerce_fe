#!/usr/bin/env node

/**
 * Script to find hardcoded strings that need translation
 * Usage: node scripts/find-untranslated.js
 */

const fs = require('fs');
const path = require('path');

// Patterns to match hardcoded strings
const patterns = [
  // JSX text content
  />\s*([A-Z][^<>{]*[a-z][^<>{}]*)\s*</g,
  // String literals in JSX attributes
  /(?:title|placeholder|alt|aria-label)=["']([^"']+)["']/g,
  // Button text
  /<Button[^>]*>\s*([A-Z][^<>]*)\s*<\/Button>/g,
  // Common UI text patterns
  /["']([A-Z][^"']*(?:\s+[a-z][^"']*)*[.!?]?)["']/g,
];

// Directories to scan
const scanDirs = [
  'src/components',
  'src/app',
];

// Files to ignore
const ignoreFiles = [
  'use-translations.ts',
  'translation-utils.ts',
  'language-switcher.tsx',
];

// Strings to ignore (already translated or not user-facing)
const ignoreStrings = [
  'use client',
  'use server',
  'className',
  'onClick',
  'onChange',
  'onSubmit',
  'useState',
  'useEffect',
  'console.log',
  'console.error',
  'process.env',
  'window.location',
  'localStorage',
  'sessionStorage',
  'JSON.stringify',
  'JSON.parse',
  'Error',
  'Promise',
  'async',
  'await',
  'return',
  'export',
  'import',
  'from',
  'default',
  'function',
  'const',
  'let',
  'var',
  'if',
  'else',
  'for',
  'while',
  'switch',
  'case',
  'break',
  'continue',
  'try',
  'catch',
  'finally',
  'throw',
  'new',
  'this',
  'super',
  'class',
  'extends',
  'implements',
  'interface',
  'type',
  'enum',
  'namespace',
  'module',
  'declare',
  'public',
  'private',
  'protected',
  'static',
  'readonly',
  'abstract',
  'true',
  'false',
  'null',
  'undefined',
  'void',
  'never',
  'any',
  'unknown',
  'string',
  'number',
  'boolean',
  'object',
  'symbol',
  'bigint',
];

function shouldIgnoreString(str) {
  // Ignore very short strings
  if (str.length < 3) return true;
  
  // Ignore strings that are all uppercase (likely constants)
  if (str === str.toUpperCase()) return true;
  
  // Ignore strings that are all lowercase (likely technical terms)
  if (str === str.toLowerCase() && !str.includes(' ')) return true;
  
  // Ignore strings in ignore list
  if (ignoreStrings.includes(str)) return true;
  
  // Ignore URLs
  if (str.startsWith('http') || str.startsWith('www.')) return true;
  
  // Ignore file paths
  if (str.includes('/') && (str.includes('.') || str.startsWith('/'))) return true;
  
  // Ignore CSS classes
  if (str.includes('-') && str.split('-').length > 2) return true;
  
  // Ignore technical strings
  if (/^[a-z]+[A-Z][a-zA-Z]*$/.test(str)) return true; // camelCase
  if (/^[A-Z_]+$/.test(str)) return true; // CONSTANT_CASE
  if (/^\d+$/.test(str)) return true; // numbers only
  if (/^[a-z0-9-]+$/.test(str) && str.includes('-')) return true; // kebab-case
  
  return false;
}

function extractStringsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const strings = new Set();
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const str = match[1].trim();
      if (str && !shouldIgnoreString(str)) {
        strings.add(str);
      }
    }
  });
  
  return Array.from(strings);
}

function scanDirectory(dir) {
  const results = [];
  
  function scanRecursive(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
          scanRecursive(itemPath);
        }
      } else if (stat.isFile()) {
        // Only scan TypeScript and JavaScript files
        if (/\.(tsx?|jsx?)$/.test(item) && !ignoreFiles.some(ignore => item.includes(ignore))) {
          const strings = extractStringsFromFile(itemPath);
          if (strings.length > 0) {
            results.push({
              file: path.relative(process.cwd(), itemPath),
              strings
            });
          }
        }
      }
    });
  }
  
  scanRecursive(dir);
  return results;
}

function main() {
  console.log('🔍 Scanning for untranslated strings...\n');
  
  const allResults = [];
  
  scanDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const results = scanDirectory(dir);
      allResults.push(...results);
    }
  });
  
  if (allResults.length === 0) {
    console.log('✅ No untranslated strings found!');
    return;
  }
  
  console.log(`📋 Found potentially untranslated strings in ${allResults.length} files:\n`);
  
  let totalStrings = 0;
  
  allResults.forEach(({ file, strings }) => {
    console.log(`📄 ${file}`);
    strings.forEach(str => {
      console.log(`   • "${str}"`);
      totalStrings++;
    });
    console.log('');
  });
  
  console.log(`📊 Summary: ${totalStrings} strings in ${allResults.length} files need review`);
  console.log('\n💡 Next steps:');
  console.log('1. Review each string to determine if it needs translation');
  console.log('2. Add appropriate translation keys to locale files');
  console.log('3. Replace hardcoded strings with translation hooks');
  console.log('4. Test with both languages');
}

if (require.main === module) {
  main();
}