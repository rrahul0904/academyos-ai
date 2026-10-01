import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateStudyPack } from './src/study-ai.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

export function resolveRequestPath(urlPath) {
  const pathname = decodeURIComponent((urlPath || '/').split('?')[0]);
  const candidate = pathname === '/' ? '/public/index.html' : pathname;
  const normalized = normalize(candidate).replace(/^([.][.][/\\])+/, '');
  const filePath = resolve(root, `.${normalized.startsWith('/') ? normalized : `/${normalized}`}`);
  if (!filePath.startsWith(resolve(root))) return null;
  return filePath;
}

async function readJson(req, maxBytes = 220000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString('utf8');
  return body ? JSON.parse(body) : {};
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent((req.url || '/').split('?')[0]);

      if (req.method === 'GET' && pathname === '/api/study-provider') {
        const provider = String(process.env.STUDY_AI_PROVIDER || 'local').toLowerCase();
        sendJson(res, 200, {
          provider,
          configured: provider === 'local' || (provider === 'openai' && Boolean(process.env.OPENAI_API_KEY)),
          model: provider === 'openai' ? (process.env.OPENAI_MODEL || 'gpt-5.6-luna') : null
        });
        return;
      }

      if (req.method === 'POST' && pathname === '/api/study-pack') {
        try {
          const input = await readJson(req);
          const pack = await generateStudyPack(input);
          sendJson(res, 200, { pack });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Study-pack generation failed.';
          const status = /at least 40|20,000|body is too large|Unexpected token|JSON/.test(message) ? 400 : 502;
          sendJson(res, status, { error: message });
        }
        return;
      }

      if (pathname.startsWith('/api/')) {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }

      const filePath = resolveRequestPath(req.url);
      if (!filePath) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      try {
        const stats = statSync(filePath);
        if (!stats.isFile()) throw new Error('not a file');
        res.writeHead(200, {
          'content-type': types[extname(filePath)] || 'application/octet-stream',
          'cache-control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=300'
        });
        createReadStream(filePath).pipe(res);
      } catch {
        if (!extname(filePath)) {
          res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
          createReadStream(join(root, 'public', 'index.html')).pipe(res);
          return;
        }
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
      }
    } catch {
      sendJson(res, 500, { error: 'Internal server error' });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(port, host, () => {
    console.log(`AcademyOS AI running at http://${host}:${port}`);
  });
}
