const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const HTTPS_PORT = 2001;       // iPhone等からのアクセス用（Web Share API はHTTPS必須）
const HTTP_PORT  = 2000;       // 証明書を信頼させる前の一時アクセス用フォールバック
const ROOT = __dirname;
const CERT_DIR = path.join(ROOT, 'certs');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.csv':  'text/csv; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.md':   'text/markdown; charset=utf-8',
};

// POST ボディを読む
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// /screenshot エンドポイント
async function handleScreenshot(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const { id, name, url } = body;
    if (!url) { res.writeHead(400); res.end('url required'); return; }

    const puppeteer = require('puppeteer');
    const screenshotsDir = path.join(ROOT, 'SCREENSHOTS');
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

    // ファイル名: {id}_{name}.png（日本語をそのまま使用）
    const safeName = String(name).replace(/[\/\\:*?"<>|]/g, '_');
    const filename = `${id}_${safeName}.png`;
    const outPath = path.join(screenshotsDir, filename);

    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: outPath, fullPage: true });
    await browser.close();

    const webPath = '/SCREENSHOTS/' + encodeURIComponent(filename);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ path: webPath, filename }));
  } catch (e) {
    console.error(e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

// HTTP/HTTPS 共通のリクエストハンドラ
async function handler(req, res) {
  // CORS ヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // POST /screenshot
  if (req.method === 'POST' && req.url === '/screenshot') {
    await handleScreenshot(req, res);
    return;
  }

  let urlPath = req.url.split('?')[0];

  if (urlPath === '/') {
    const files = fs.readdirSync(ROOT).filter(f => !f.startsWith('.'));
    const items = files.map(f => `<li><a href="/${f}">${f}</a></li>`).join('\n');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html><body><ul>\n${items}\n</ul></body></html>`);
    return;
  }

  const filePath = path.join(ROOT, decodeURIComponent(urlPath));

  // ルートディレクトリ外へのアクセスを禁止
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// 証明書があれば HTTPS（2001）を起動。Web Share API はセキュアコンテキスト必須のため。
const keyPath  = path.join(CERT_DIR, 'key.pem');
const certPath = path.join(CERT_DIR, 'cert.pem');
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const opts = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
  https.createServer(opts, handler).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running at https://localhost:${HTTPS_PORT}/`);
  });
  // HTTP（2000）も残す：iPhoneに証明書を信頼させる前のフォールバック用
  http.createServer(handler).listen(HTTP_PORT, () => {
    console.log(`HTTP  server running at http://localhost:${HTTP_PORT}/`);
  });
} else {
  // 証明書が無い場合は従来通り HTTP のみ（2001）
  http.createServer(handler).listen(HTTPS_PORT, () => {
    console.log(`HTTP server running at http://localhost:${HTTPS_PORT}/  (証明書が無いためHTTP）`);
  });
}
