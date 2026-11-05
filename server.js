// Servidor HTTPS local para testar o leitor no celular (mesma rede Wi-Fi).
// Uso: node server.js   ->  abra https://<IP-do-PC>:8443 no celular
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8443;
const ROOT = __dirname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const options = { pfx: fs.readFileSync(path.join(ROOT, 'cert', 'local.pfx')), passphrase: 'barcode' };

https.createServer(options, (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'https://x').pathname);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT) || file.includes(path.sep + 'cert' + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor HTTPS rodando na porta ${PORT}`);
  for (const list of Object.values(os.networkInterfaces()))
    for (const a of list) if (a.family === 'IPv4' && !a.internal) console.log(`  https://${a.address}:${PORT}`);
  console.log(`  https://localhost:${PORT}`);
});
