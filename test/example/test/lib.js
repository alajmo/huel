const express = require('express');
const net = require('net');
const path = require('path');

export { catchErrorEvents, isPortFree, startTestServer };

function startTestServer(port) {
  const server = express();
  server.use(
    '/',
    express.static(path.normalize(path.join(__dirname + '/../dist')))
  );
  server.get('*', (req, res) => {
    res.sendFile(path.join('dist', 'index.html'), { root: './' });
  });
  return server.listen(port);
}

function isPortFree(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', err => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

/**
 * @desc Initializes event listeners for Puppeteer.
 * Following events are tracked:
 *   - Errors
 *   - API Responses (POST)
 * @param {Object} page Puppeteer browser.newPage object
 * @param {Array<Object>} pageErrors
 * @param {Array<Object>} responses
 */
function catchErrorEvents({ page }) {
  let pageErrors = [];
  let responses = [];

  /**
   * Events
   */
  page.on('error', error => {
    pageErrors.push({ error });
  });

  page.on('pageerror', error => {
    pageErrors.push({ error });
  });

  page.on('console', msg => {
    // Use console.log for errors inside Angular (since they don't show up
    // in pageerror), use event pageerror for outside Angular.
    const { type, text } = msg;
    if (type === 'error') {
      pageErrors.push({ text });
    }
  });

  page.on('response', response => {
    const { method, url } = response.request();
    if (method === 'POST') {
      responses.push({ method, url, status: response.status });
    }
  });

  return Object.freeze({ pageErrors, responses });
}
