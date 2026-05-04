const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const dir = path.join(__dirname, 'SCREENSHOTS');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  // 既存ファイルの最大番号を取得
  const existing = fs.readdirSync(dir).map(f => parseInt(f)).filter(n => !isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  const num = String(next).padStart(4, '0');

  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}__${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
  const filename = `${num}_${ts}.png`;
  const outPath = path.join(dir, filename);

  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const url = 'file://' + path.resolve(__dirname, 'memo-app.html');
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log(`保存しました: SCREENSHOTS/${filename}`);
})();
