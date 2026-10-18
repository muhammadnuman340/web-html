import puppeteer from 'puppeteer';

const url = 'https://numanx-studio-omega-converter.netlify.app/';
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
const started = Date.now();
try {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('OK', response?.status(), `${Date.now() - started}ms`, await page.title());
} catch (error) {
  console.log('ERR', error.message, `${Date.now() - started}ms`);
} finally {
  await browser.close();
}
