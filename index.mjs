import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const browser = await puppeteer.launch({ headless: 'new', userDataDir: './user-data' });
const page = await browser.newPage();

console.log('🔄 started scraping...');
await page.goto('https://bhalogari.com');

const search = await page.waitForSelector('[class="search-box search-container"] > div > div > input')

await search.type('car');
await search.type(String.fromCharCode(13));
await page.waitForSelector('.rated-car-elm-container > .card-two');

const cars = await page.$$eval('.card-two > a', anchors => {
    return anchors.map(anchor => {
        const brand = anchor.querySelector('.brand')?.innerText;
        const category = anchor.querySelector('.card-two-category > ul > li > span')?.innerText;
        const modelYear = anchor.querySelector('.card-two-category > ul > li:nth-child(2) > span')?.innerText;
        const price = anchor.querySelector('.card-two-title-price > h4')?.innerText;
        const model = anchor.querySelector('.card-two-title-price > h3')?.innerText;
        const image = anchor.querySelector('.card-two-img > img')?.src;

        return { brand, category, modelYear, price, model, image };
    });
});
await fs.writeFile('./db.json', JSON.stringify(cars, null, 2));
await browser.close();
console.log('✅ finished scraping...');