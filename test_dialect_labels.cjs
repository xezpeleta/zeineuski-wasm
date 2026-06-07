const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.text().includes('Error') || msg.text().includes('debug')) {
      console.log(`[${msg.type()}]`, msg.text());
    }
  });

  await page.goto('http://localhost:3000/zeineuski-wasm/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(15000);

  // Inject debug: check raw model labels
  const debugInfo = await page.evaluate(async () => {
    const { default: zein } = await import('/zeineuski-wasm/src/zeineuski.js');
    await zein.loadModels(m => console.log('debug load:', m));
    
    // Check what predict returns for a dialectal sentence
    const r = zein.predict("Baleike espediente judizialak itzuli biher izetie.");
    return {
      dialect: r.dialect,
      dialectName: r.dialectName,
      predictions: r.predictions,
      conf: r.confidence,
    };
  });

  console.log('Result:', JSON.stringify(debugInfo, null, 2));
  await browser.close();
})();
