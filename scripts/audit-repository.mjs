import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbidden = [
  'backend',
  'functions/node_modules',
  'functions/.env.project-sum-b961a',
  'functions/Select-String',
  'functions/Write-Host',
  'functions/}Get-ChildItem',
  'functions/}firebase'
];

const failures = forbidden.filter((entry) => fs.existsSync(path.join(root, entry)));
const required = [
  'app.html',
  'app.js',
  'modules/intelligence',
  'functions/index.js',
  'functions/src/intelligence',
  'firestore.rules',
  'firestore.indexes.json'
];
const missing = required.filter((entry) => !fs.existsSync(path.join(root, entry)));

if (failures.length || missing.length) {
  if (failures.length) console.error('Forbidden repository entries:', failures.join(', '));
  if (missing.length) console.error('Missing active entries:', missing.join(', '));
  process.exit(1);
}
console.log('Repository structure audit passed.');
