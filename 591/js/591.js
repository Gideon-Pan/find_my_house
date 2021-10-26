const axios = require('axios')

// like bs4
const cheerio = require('cheerio')
const moment = require('moment')
// like selenium
const puppeteer = require('puppeteer')

const url = 'https://rent.591.com.tw/'
// functions

const sleep = (t) => {
  return new Promise((resolve, reject) => {
    setTimeout(()=> {
      resolve()
    }, t * 1000)
  })
}

async function getAll() {
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()
  await page.goto(url)
  await sleep(2.5)
  // const body = await page.$('body')
  const content = await page.content()
  const $ = cheerio.load(content)
  console.log($('div .item-price-text').html())
  
  // $.root().html()
  // console.log('$.root().html(): ', $.root().html());
  await browser.close()
}

getAll()
