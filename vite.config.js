import { cp, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function copyAssetsPlugin() {
  return {
    name: 'copy-app-assets-and-legacy-runtime',
    apply: 'build',
    async writeBundle() {
      const root = process.cwd();
      const copies = [
        ['assets', 'dist/assets'],
        ['js', 'dist/js'],
      ];

      for (const [sourceDir, targetDir] of copies) {
        const sourcePath = resolve(root, sourceDir);
        const targetPath = resolve(root, targetDir);
        await mkdir(dirname(targetPath), { recursive: true });
        await cp(sourcePath, targetPath, { recursive: true, force: true });
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
    copyAssetsPlugin(),
    localApiPlugin(),
  ],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
