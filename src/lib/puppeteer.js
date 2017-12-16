import puppeteer from 'puppeteer';
import lib from './lib.js';

const PORT = 1337;
const BASE_URL = route => `http://localhost:${PORT}${route}`;

export { init };

async function init() {
  let server;
  try {
    let portFree = await lib.isPortFree(PORT);
    if (portFree) {
      server = lib.startTestServer(PORT);
    }
  } catch (e) {
    console.error(e);
  }

  /**
   * Init Puppeteer
   */
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 0
  });

  /**
   * Test
   */
  try {
    await auth({
      browser,
      BASE_URL,
      catchErrorEvents: lib.catchErrorEvents
    });

    await passwordAuth({
      browser,
      credentials,
      BASE_URL,
      catchErrorEvents: lib.catchErrorEvents
    });
  } catch (e) {
    console.error(e);
  }

  // await page.waitFor(5000);
  server ? server.close() : '';
  await browser.close();
}
