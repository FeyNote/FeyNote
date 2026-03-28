const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOTTED_STRING_REGEX =
  /['"]([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)+)['"]/g;
const IGNORE_PATTERN = 'lint-locales-disable';
const IGNORE_NEXT_LINE_PATTERN = 'lint-locales-disable-next-line';
const IGNORE_ENABLE_PATTERN = 'lint-locales-enable';
const ARTIFACT_VALUE_REGEX = /".*":\s*".*[aA]rtifact/;

const CONFIGS = {
  frontend: {
    localeFile: 'apps/frontend/public/locales/en-us.json',
    sourceDirs: ['apps/frontend/src', 'libs/ui/src', 'libs/shared-utils/src'],
  },
  backend: {
    localeFile: 'libs/api-services/src/lib/i18n/locales/en-us.json',
    sourceDirs: [
      'libs/trpc/src',
      'libs/api-services/src',
      'libs/shared-utils/src/lib/ai/converters',
    ],
  },
};

const target = process.argv[2];
if (!target || !CONFIGS[target]) {
  console.error(
    `Usage: node scripts/lintLocales.js <${Object.keys(CONFIGS).join('|')}>`,
  );
  process.exit(1);
}

const config = CONFIGS[target];
const localeFile = path.join(ROOT, config.localeFile);
const sourceDirs = config.sourceDirs.map((d) => path.join(ROOT, d));

function getAllFilePaths(dir, exts) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFilePaths(fullPath, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractDottedStrings(dirs) {
  const strings = new Set();
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of getAllFilePaths(dir, ['.ts', '.tsx'])) {
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      let disabled = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          line.includes(IGNORE_PATTERN) &&
          !line.includes(IGNORE_NEXT_LINE_PATTERN)
        ) {
          disabled = true;
          continue;
        }
        if (line.includes(IGNORE_ENABLE_PATTERN)) {
          disabled = false;
          continue;
        }
        if (disabled) continue;
        if (i > 0 && lines[i - 1].includes(IGNORE_NEXT_LINE_PATTERN)) continue;
        for (const match of lines[i].matchAll(DOTTED_STRING_REGEX)) {
          strings.add(match[1]);
        }
      }
    }
  }
  return strings;
}

let exitCode = 0;

const localeContent = fs.readFileSync(localeFile, 'utf8');

const artifactViolations = localeContent
  .split('\n')
  .filter((line) => ARTIFACT_VALUE_REGEX.test(line));
if (artifactViolations.length > 0) {
  console.log("ERROR: Translation values must use 'document' not 'artifact'");
  artifactViolations.forEach((line) => console.log(line.trim()));
  exitCode = 1;
}

const jsonKeys = new Set(Object.keys(JSON.parse(localeContent)));
const usedStrings = extractDottedStrings(sourceDirs);

console.log('Checking for unused translation keys...');
const unused = Array.from(jsonKeys)
  .filter((key) => !usedStrings.has(key))
  .sort();
if (unused.length > 0) {
  unused.forEach((key) => console.log(`Unused translation key: ${key}`));
  console.log(
    `Error: Found ${unused.length} unused translation key(s) in ${config.localeFile}`,
  );
  exitCode = 1;
} else {
  console.log('No unused translation keys.');
}

console.log('Checking for missing translation keys...');
const missing = Array.from(usedStrings)
  .filter((key) => !jsonKeys.has(key))
  .sort();
if (missing.length > 0) {
  missing.forEach((key) => console.log(`Missing translation key: ${key}`));
  console.log(
    `Error: Found ${missing.length} missing translation key(s) not in ${config.localeFile}`,
  );
  console.log(
    'False positives can be suppressed with // lint-locales-disable-next-line or a // lint-locales-disable block',
  );
  exitCode = 1;
} else {
  console.log('No missing translation keys.');
}

process.exit(exitCode);
