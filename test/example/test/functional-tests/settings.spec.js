import tap from 'tap';

export { settingsTest };

/**
 * Test cases:
 *   -
 */
async function settingsTest({ browser, BASE_URL, catchErrorEvents }) {
  const page = await browser.newPage();

  const { pageErrors } = catchErrorEvents({
    page
  });

  await tap.test('Should not contain any errors on page load', async t => {
    await page.goto(BASE_URL('/'), { waitUntil: 'networkidle2' });

    t.equal(pageErrors.length, 0, pageErrors);
    t.end();
  });
}
