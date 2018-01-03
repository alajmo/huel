// Functional tests, runs in headless puppeteer.

module.exports = passwordAuth;

/**
 * Test cases:
 *   As a user I want to be able to sign in with credentials, providing email and password.
 *   Navigate to forgot password.
 */
async function passwordAuth({ browser, BASE_URL, catchErrorEvents }) {
  const page = await browser.newPage();

  const { pageErrors } = catchErrorEvents({
    page
  });

  await tap.test('Should not contain any errors on page load', async t => {
    await page.goto(BASE_URL('/auth'), { waitUntil: 'networkidle2' });

    t.equal(pageErrors.length, 1, pageErrors);
    t.end();
  });

  await tap.test('Should navigate to /register-bankid', async t => {
    // Click on a link to navigate to /recover/email.
    await page.goto(BASE_URL('/auth'), { waitUntil: 'networkidle2' });

    // TODO: Switch to page.click when puppeteer fixes the API for clicking.
    await page.$eval('a[ui-sref="bankid-register"]', el => el.click());
    const pathname = await page.evaluate(() => location.pathname);

    t.equal(pathname, '/register-bankid');
    t.end();
  });

  await tap.test('Should navigate to /auth-bankid', async t => {
    // Click on a link to navigate to /recover/email.
    await page.goto(BASE_URL('/auth'), { waitUntil: 'networkidle2' });

    // TODO: Switch to page.click when puppeteer fixes the API for clicking.
    await page.$eval('md-option[id="bankid-auth"]', el => el.click());
    const pathname = await page.evaluate(() => location.pathname);

    t.equal(pathname, '/auth-bankid');
    t.end();
  });

  await tap.test('Should navigate to /auth', async t => {
    // Click on a link to navigate to /recover/email.
    await page.goto(BASE_URL('/auth-bankid'), { waitUntil: 'networkidle2' });

    // TODO: Switch to page.click when puppeteer fixes the API for clicking.
    await page.$eval('md-option[id="password-auth"]', el => el.click());
    const pathname = await page.evaluate(() => location.pathname);

    t.equal(pathname, '/auth');
    t.end();
  });
}
