import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const errors = []
const failed = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
page.on('requestfailed', (r) => failed.push(`${r.url()} — ${r.failure()?.errorText}`))
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`) })

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 300) {
    window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40))
  }
})

const bg = await page.evaluate(() => {
  const lp = document.querySelector('.lp')
  return {
    lpBackground: lp ? getComputedStyle(lp).backgroundColor : 'no .lp',
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    htmlBackground: getComputedStyle(document.documentElement).backgroundColor,
    ptBg: getComputedStyle(document.documentElement).getPropertyValue('--pt-bg').trim(),
  }
})

const overflow = await page.evaluate(() => {
  const w = document.documentElement.clientWidth
  return [...document.querySelectorAll('*')]
    .filter((el) => el.getBoundingClientRect().right > w + 2)
    .slice(0, 6)
    .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`)
})

const brokenImgs = await page.evaluate(() =>
  [...document.querySelectorAll('img')]
    .filter((i) => i.complete && i.naturalWidth === 0)
    .map((i) => i.getAttribute('src')))

console.log('\n=== LANDING PAGE AUDIT ===')
console.log('\nbackgrounds:'); for (const [k, v] of Object.entries(bg)) console.log(`  ${k}: ${v}`)
console.log('\nconsole errors:', errors.length); errors.slice(0, 8).forEach((e) => console.log('  -', e.slice(0, 140)))
console.log('\nfailed requests:', failed.length); failed.slice(0, 8).forEach((f) => console.log('  -', f.slice(0, 140)))
console.log('\nhorizontal overflow:', overflow.length); overflow.forEach((o) => console.log('  -', o))
console.log('\nbroken images:', brokenImgs.length); brokenImgs.forEach((b) => console.log('  -', b))
await browser.close()
