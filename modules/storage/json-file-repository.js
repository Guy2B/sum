import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export class JsonFileRepository {
  constructor(filePath) { this.filePath = filePath; }
  async load() { try { return JSON.parse(await readFile(this.filePath, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return {}; throw error; } }
  async save(snapshot) { await mkdir(dirname(this.filePath), { recursive: true }); await writeFile(this.filePath, JSON.stringify(snapshot, null, 2), 'utf8'); return snapshot; }
}
