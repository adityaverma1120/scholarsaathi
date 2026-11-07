import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' && (specifier.startsWith('.') || specifier.startsWith('/'))) {
      const parentDir = context.parentURL ? path.dirname(fileURLToPath(context.parentURL)) : process.cwd();
      const targetBase = path.resolve(parentDir, specifier);
      
      const candidates = ['.ts', '.tsx', '.js', '/index.ts', '/index.js'];
      for (const ext of candidates) {
        if (fs.existsSync(targetBase + ext)) {
          return nextResolve(specifier + ext, context);
        }
      }
    }
    throw err;
  }
}

