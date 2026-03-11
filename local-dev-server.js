const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'application/image/svg+xml'
};

const LOCAL_AUTHORING_HOME = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shinobi Evolution — Local Authoring</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #020617;
      color: #e2e8f0;
      font-family: Arial, sans-serif;
    }
    main {
      width: min(720px, calc(100vw - 32px));
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(15, 23, 42, 0.92);
      padding: 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
    }
    h1 {
      margin-top: 0;
      font-size: 24px;
    }
    p, li {
      line-height: 1.6;
    }
    code {
      background: rgba(255,255,255,0.08);
      padding: 2px 6px;
    }
    a {
      color: #7dd3fc;
    }
  </style>
</head>
<body>
  <main>
    <h1>Local Authoring Server</h1>
    <p>Le jeu principal tourne maintenant via Vite + React.</p>
    <ul>
      <li>Jeu principal: <a href="http://127.0.0.1:5173/">http://127.0.0.1:5173/</a></li>
      <li>Mapper React: <a href="http://127.0.0.1:5173/mapper">http://127.0.0.1:5173/mapper</a></li>
      <li>API locale de sauvegarde: <code>/api/save-mapping</code></li>
    </ul>
    <p>Démarre <code>npm run dev</code> pour le jeu et le mapper, puis garde ce serveur ouvert uniquement pour la sauvegarde locale.</p>
  </main>
</body>
</html>`;

const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/save-mapping') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { filePath, payload } = data;

                if (!filePath || !payload) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing filePath or payload' }));
                    return;
                }

                // Prevent directory traversal
                const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
                const absolutePath = path.join(ROOT, safePath);

                if (!absolutePath.startsWith(ROOT)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid path' }));
                    return;
                }

                fs.writeFile(absolutePath, JSON.stringify(payload, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error('Save error:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Failed to write file' }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: `Saved successfully to ${safePath}` }));
                });
            } catch (err) {
                console.error('Parse error:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON request' }));
            }
        });
        return;
    }

    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(LOCAL_AUTHORING_HOME);
        return;
    }

    // Static file serving
    let filePath = req.url;
    // Strip query parameters
    filePath = filePath.split('?')[0];

    // URL decoding
    filePath = decodeURIComponent(filePath);

    let extname = String(path.extname(filePath)).toLowerCase();
    let contentType = mimeTypes[extname] || 'application/octet-stream';

    const absolutePath = path.join(ROOT, filePath);

    fs.readFile(absolutePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`File not found: ${filePath}`, 'utf-8');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

});

server.listen(PORT, () => {
    console.log(`Local authoring server running at http://localhost:${PORT}/`);
    console.log(`Main game via Vite expected at http://127.0.0.1:5173/`);
    console.log(`Mapper save API active at /api/save-mapping`);
});
