const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const pageUrl = process.env.PAGE_URL;
if (!pageUrl) throw new Error('PAGE_URL is required');
const outDir = 'browser-report';
fs.mkdirSync(outDir, { recursive: true });

async function checkViewport(browser, name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(String(err)));

  const response = await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  if (!response || !response.ok()) throw new Error(`${name}: page returned ${response?.status()}`);
  await page.waitForSelector('h1', { state: 'visible' });
  await page.waitForFunction(() => document.querySelectorAll('#demoTable tr').length === 3);

  const title = await page.title();
  if (title !== 'AI Data Guard') throw new Error(`${name}: unexpected title: ${title}`);
  if ((await page.locator('h1').innerText()).trim() !== 'AI Data Guard') throw new Error(`${name}: h1 mismatch`);

  await page.click('[data-action="scan"]');
  await page.waitForFunction(() => document.querySelector('#resultBox')?.textContent.includes('4種類の注意項目'));
  if (await page.locator('#demoTable .flagged').count() < 4) throw new Error(`${name}: scan did not flag demo data`);

  await page.click('[data-action="mask"]');
  await page.waitForFunction(() => document.querySelector('#demoTable')?.textContent.includes('顧客_001'));
  if (await page.locator('#demoTable .masked').count() < 8) throw new Error(`${name}: mask action did not mask demo data`);

  await page.click('[data-action="prompt"]');
  await page.waitForFunction(() => document.querySelector('#resultBox')?.textContent.includes('AIへ聞く内容だけ'));

  const geometry = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    rows: document.querySelectorAll('#demoTable tr').length,
    actions: document.querySelectorAll('[data-action]').length,
    navItems: document.querySelectorAll('[data-nav]').length,
    serviceWorker: 'serviceWorker' in navigator
  }));
  if (geometry.bodyWidth > geometry.viewportWidth + 4) {
    throw new Error(`${name}: body overflows viewport (${geometry.bodyWidth} > ${geometry.viewportWidth})`);
  }
  if (consoleErrors.length || pageErrors.length) {
    throw new Error(`${name}: runtime errors: ${JSON.stringify({ consoleErrors, pageErrors })}`);
  }

  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
  await context.close();
  return geometry;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const mobile = await checkViewport(browser, 'mobile-390', { width: 390, height: 844 });
    const desktop = await checkViewport(browser, 'desktop-1280', { width: 1280, height: 900 });
    const report = { ok: true, pageUrl, checkedAt: new Date().toISOString(), mobile, desktop };
    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch(err => {
  fs.writeFileSync(path.join(outDir, 'failure.txt'), String(err?.stack || err));
  console.error(err);
  process.exit(1);
});
