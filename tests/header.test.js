const puppeteer = require('puppeteer');

let browser, page;

beforeEach( async () => {
  browser = await puppeteer.launch({ //ouverture brower
    headless: true, //false => on veut voir la UI apparaitre, true, on ne verra pas la UI dans Chromium
    args: ['--no-sandbox']  //pour augmenter rapidité des tests de Travis
  });
  page = await browser.newPage();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await browser.close()
});

test('Adds two numberse', () => {
  const sum = 1+2;
  expect(sum).toEqual(3);
 });

test('The header has the correct text', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);

  expect(text).toEqual('Blogster');
});


test('clicking login starts oauth flow', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});
