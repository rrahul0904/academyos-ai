import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function createServer() {
  return http.createServer((req, res) => {
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
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(port, host, () => {
    console.log(`AcademyOS AI running at http://${host}:${port}`);
  });
}
