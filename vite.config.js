import { cp, lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function copyRuntimeStatic(copyEntries, cleanEntries = copyEntries) {
  return {
    name: 'copy-runtime-static',
    apply: 'build',
    async buildStart() {
      const root = process.cwd();
      const distDir = resolve(root, 'dist');

      await Promise.all(
        cleanEntries.map(async (entry) => {
          const targetPath = resolve(distDir, entry);
          await rm(targetPath, { force: true, recursive: true });
        })
      );
    },
    async writeBundle() {
      const root = process.cwd();
      const distDir = resolve(root, 'dist');

      for (const entry of copyEntries) {
        const sourcePath = resolve(root, entry);
        const targetPath = resolve(distDir, entry);

        if (!existsSync(sourcePath)) continue;
        const sourceStats = await lstat(sourcePath);

        await mkdir(dirname(targetPath), { recursive: true });
        await cp(sourcePath, targetPath, {
          force: true,
          recursive: sourceStats.isDirectory(),
        });
      }
    },
  };
}

function localApiPlugin() {
  return {
    name: 'mapper-local-api',
    configureServer(server) {
      server.middlewares.use('/api/save-mapping', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { filePath, payload } = data;

            if (!filePath || !payload) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing filePath or payload' }));
              return;
            }

            const fullPath = resolve(process.cwd(), filePath);
            await writeFile(fullPath, JSON.stringify(payload, null, 2), 'utf-8');

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, savedTo: fullPath }));
          } catch (err) {
            console.error('API Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyRuntimeStatic(['assets', 'js'], ['assets', 'js', 'css', 'mapper.html']),
    localApiPlugin(),
  ],
  build: {
    emptyOutDir: false,
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
