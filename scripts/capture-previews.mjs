import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve('previews')
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const url = 'http://127.0.0.1:5173/'

async function shoot(name, viewport, isMobile = false) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: isMobile ? 2 : 1,
    isMobile,
    hasTouch: isMobile,
  })
  const page = await context.newPage()
  await page.addInitScript(() => {
    localStorage.removeItem('rights-draw-tab-lock')
    localStorage.removeItem('rights-draw-progress-v2')
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => {
    const btn = document.querySelector('.action-button')
    return btn && !btn.disabled && btn.textContent?.includes('開始抽卡')
  })
  // allow WebGL scene a moment to paint
  await page.waitForTimeout(1200)
  const file = path.join(outDir, name)
  await page.screenshot({ path: file, fullPage: false })

  const metrics = await page.evaluate(() => {
    const heroBg = getComputedStyle(document.querySelector('.portal-bg-image') || document.body).backgroundImage
    const imgTags = [...document.images].map((img) => img.currentSrc)
    const canvas = document.querySelector('canvas')
    const fallback = document.querySelector('.ruin-fallback')
    return {
      titles: [...document.querySelectorAll('h1')].map((el) => el.textContent),
      hasCanvas: Boolean(canvas),
      hasFallback: Boolean(fallback),
      heroImgTags: imgTags.filter((src) => /hero|portal|banner|visuals/i.test(src)),
      usesPortalBgClass: Boolean(document.querySelector('.portal-bg-image')),
      btnInView: (() => {
        const btn = document.querySelector('.action-button')
        if (!btn) return false
        const r = btn.getBoundingClientRect()
        return r.bottom <= innerHeight && r.top >= 0
      })(),
      scrollWidthOk: document.documentElement.scrollWidth <= innerWidth + 1,
      heroBg,
    }
  })
  console.log(name, metrics)
  await context.close()
  return file
}

await shoot('desktop-home.png', { width: 1440, height: 900 }, false)
await shoot('mobile-home.png', { width: 390, height: 844 }, true)

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.addInitScript(() => {
    localStorage.removeItem('rights-draw-tab-lock')
    localStorage.removeItem('rights-draw-progress-v2')
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => {
    const btn = document.querySelector('.action-button')
    return btn && !btn.disabled
  })
  await page.click('.action-button')
  await page.waitForFunction(() => document.querySelector('.arena-result'))
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(outDir, 'desktop-result.png'), fullPage: false })
  console.log('desktop-result.png ok')
  await context.close()
}

await browser.close()
console.log('done', outDir)
