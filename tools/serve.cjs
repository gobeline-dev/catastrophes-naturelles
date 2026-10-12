const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const name = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (!['index.html', 'style.css', 'app.js', 'content.js', 'scenes.js', 'tectonics.js', 'vendor/three.module.js', 'vendor/three.core.js'].includes(name)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const type = name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html';
  res.setHeader('Content-Type', `${type}; charset=utf-8`);
  res.end(fs.readFileSync(path.join(root, name)));
}).listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173'));
