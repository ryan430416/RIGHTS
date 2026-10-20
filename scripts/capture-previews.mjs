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
  await page.waitForTimeout(400)
  const file = path.join(outDir, name)
  await page.screenshot({ path: file, fullPage: false })
  const metrics = await page.evaluate(() => {
    const btn = document.querySelector('.action-button')
    const slot = document.querySelector('.card-slot')
    const img = document.querySelector('.portal-bg-image')
    const box = (el) => {
      const r = el.getBoundingClientRect()
      return { y: Math.round(r.y), bottom: Math.round(r.bottom), w: Math.round(r.width) }
    }
    return {
      bg: img?.currentSrc || '',
      btn: box(btn),
      slot: box(slot),
      visibleH1: document.querySelectorAll('h1:not(.visually-hidden)').length,
      titleClear: slot.getBoundingClientRect().y > innerHeight * 0.4,
      btnInView: btn.getBoundingClientRect().bottom <= innerHeight,
    }
  })
  console.log(name, metrics)
  await context.close()
  return file
}

await shoot('desktop-home.png', { width: 1440, height: 900 }, false)
await shoot('mobile-home.png', { width: 390, height: 844 }, true)

// result screen on desktop
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
  await page.waitForTimeout(1900)
  await page.screenshot({ path: path.join(outDir, 'desktop-result.png'), fullPage: false })
  console.log('desktop-result.png ok')
  await context.close()
}

await browser.close()
console.log('done', outDir)
