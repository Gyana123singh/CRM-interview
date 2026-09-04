const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkDir(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');

console.log('Finding all .ts and .tsx files in src...');
const tsFiles = walkDir(srcDir);
console.log(`Found ${tsFiles.length} TypeScript files.`);

let convertedCount = 0;

for (const filePath of tsFiles) {
  const isTsx = filePath.endsWith('.tsx');
  const newExt = isTsx ? '.jsx' : '.js';
  const newFilePath = filePath.slice(0, filePath.lastIndexOf('.')) + newExt;

  const content = fs.readFileSync(filePath, 'utf8');

  // Transpile TypeScript to JS/JSX using ts.transpileModule
  const transpiled = ts.transpileModule(content, {
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      removeComments: false,
    },
    fileName: filePath,
  });

  let jsCode = transpiled.outputText;

  // Clean up any empty import statements left over by type-only import removal e.g. import {} from "..."; or import type ...
  jsCode = jsCode.replace(/^import\s*\{\s*\}\s*from\s*['"].*?['"];?\r?\n?/gm, '');
  jsCode = jsCode.replace(/^import\s+type\s+.*?\r?\n?/gm, '');

  fs.writeFileSync(newFilePath, jsCode, 'utf8');
  fs.unlinkSync(filePath);
  convertedCount++;
  console.log(`Converted: ${path.relative(rootDir, filePath)} -> ${path.relative(rootDir, newFilePath)}`);
}

// Clean up root TypeScript files
const cleanupFiles = [
  path.join(rootDir, 'tsconfig.json'),
  path.join(rootDir, 'next-env.d.ts'),
  path.join(rootDir, 'tsconfig.tsbuildinfo'),
];

for (const file of cleanupFiles) {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`Removed: ${path.relative(rootDir, file)}`);
    } catch (e) {
      console.error(`Failed to remove ${file}:`, e.message);
    }
  }
}

console.log(`Successfully converted ${convertedCount} files from TypeScript to JavaScript!`);
