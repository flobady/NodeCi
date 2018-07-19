// const puppeteer = require('puppeteer'); // permet de créer des browser windows et d'interagir avec lui via du javascript, pas besoin de l'importer car on la déjà dans Page
// const Page =  require('puppeteer/lib/Page'); //on avait ça avant mais maintenant on a enrichi la class via le proxy customPage
const Page = require('./helpers/page');

let page; //let browser on l'a dans Page

beforeEach( async () => {
  page = await Page.build(); // cette page est notre proxy qui nous donne acces à browser puppeter, page de puppeter, et customPage
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close()
});

test('Adds two numbers', () => {
  const sum = 1+2;
  expect(sum).toEqual(3);
 });

test('The header has the correct text', async () => {
  // const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  // on le remplace par:
  const text = await page.getContentsOf('a.brand-logo');

  expect(text).toEqual('Blogster');
});


test('clicking login starts oauth flow', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {

  await page.login();

  // on se crée un DOM selector
  const text = await page.getContentsOf('a[href="/auth/logout"]');
  expect(text).toEqual('Logout');
});


