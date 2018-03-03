// import puppeteer from 'puppeteer';
// import { catchErrorEvents, isPortFree, startTestServer } from '../lib.js';
// import { settingsTest } from './settings.spec.js';

// export { functionalTests };

// const PORT = 1337;
// const BASE_URL = route => `http://localhost:${PORT}${route}`;

// async function functionalTests() {
//   let server;
//   try {
//     let portFree = await isPortFree(PORT);
//     if (portFree) {
//       server = startTestServer(PORT);
//     }
//   } catch (e) {
//     console.error(e);
//   }

//   /**
//    * Init Puppeteer
//    */
//   const browser = await puppeteer.launch({
//     headless: true,
//     slowMo: 0
//   });

//   /**
//    * Test
//    */
//   try {
//     await settingsTest({
//       browser,
//       BASE_URL,
//       catchErrorEvents
//     });
//   } catch (e) {
//     console.error(e);
//   }

//   // await page.waitFor(5000);
//   server ? server.close() : '';
//   await browser.close();
// }
