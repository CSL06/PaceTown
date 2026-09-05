/**
 * Real CSS coverage, via Chrome DevTools through Playwright.
 *
 * A text scan cannot answer this question: classes like `cos-sky-overcast` are
 * built as `cos-${equipped.sky}` and `is-${mood}`, so grep reports them dead
 * when they are not. This drives the actual app and asks the browser which
 * bytes were used.
 *
 * Coverage is collected **per route and then unioned**. That detail matters:
 * Chrome resets CSS coverage on navigation, so a single start/stop spanning
 * several `goto` calls reports mostly the last page and makes shared
 * stylesheets look almost entirely unused. A byte counts as used if any route
 * used it.
 *
 * The output is still evidence, not a verdict. Coverage only sees states the
 * walkthrough reached — `:hover`, error banners, and cosmetics nobody has
 * bought will read as unused without being dead. This deletes nothing.
 *
 *   node tools/css-coverage.mjs
 */

import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:4173'

/** Merge overlapping ranges so a byte used twice is not counted twice. */
function merge(ranges) {
  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const out = []
  for (const r of sorted) {
    const last = out[out.length - 1]
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end)
    else out.push({ ...r })
  }
  return out
}

function bytesOf(ranges) {
  return merge(ranges).reduce((n, r) => n + (r.end - r.start), 0)
}

/** url -> { size, ranges[] } accumulated across every route. */
const seen = new Map()

async function record(browser, name, drive) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.coverage.startCSSCoverage()
  try {
    await drive(page)
  } catch (err) {
    console.error(`  ! ${name}: ${err.message.split('\n')[0]}`)
  }
  const coverage = await page.coverage.stopCSSCoverage()
  for (const entry of coverage) {
    const prev = seen.get(entry.url) ?? { size: entry.text.length, ranges: [] }
    prev.size = Math.max(prev.size, entry.text.length)
    prev.ranges.push(...entry.ranges)
    seen.set(entry.url, prev)
  }
  await page.close()
  console.log(`  visited ${name}`)
}

async function clearGreeting(page) {
  const greeting = page.getByRole('group', { name: 'Conversation' })
  for (let i = 0; i < 8; i += 1) {
    if (!await greeting.isVisible().catch(() => false)) return
    const stay = greeting.getByRole('button', { name: /look around|not now/i })
    if (await stay.isVisible().catch(() => false)) { await stay.click(); return }
    await greeting.click()
  }
}

const browser = await chromium.launch()
console.log('\nwalking the app...')

await record(browser, 'landing (light)', async (page) => {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 350) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 50))
    }
  })
  await page.locator('#try-week').fill('Lecture 9 to 12, essay due tomorrow 90 minutes').catch(() => {})
  for (const name of ['Mira', 'Sky', 'Sol', 'Goh']) {
    await page.getByRole('tab', { name: new RegExp(name, 'i') }).click().catch(() => {})
  }
  await page.getByRole('button', { name: /sound off|sound on/i }).hover().catch(() => {})
})

await record(browser, 'landing (dark)', async (page) => {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /switch to dark theme/i }).click().catch(() => {})
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(300)
})

await record(browser, 'sign in / sign up', async (page) => {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.getByLabel(/password/i).first().focus().catch(() => {})
  await page.getByRole('button', { name: /continue with google/i }).click().catch(() => {})
  await page.waitForTimeout(200)
  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' })
})

await record(browser, 'mentor demo', async (page) => {
  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
})

await record(browser, 'onboarding', async (page) => {
  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' })
  await page.getByLabel(/what should we call you/i).fill('Coverage').catch(() => {})
  await page.getByLabel('Email').fill(`cov${Date.now()}@uni.edu`).catch(() => {})
  await page.getByLabel(/password/i).first().fill('grove-pace-24').catch(() => {})
  await page.getByRole('button', { name: /create account/i }).click().catch(() => {})
  await page.waitForURL(/welcome/, { timeout: 10_000 }).catch(() => {})
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: /^continue$/i }).click().catch(() => {})
    await page.waitForTimeout(150)
  }
})

await record(browser, 'the town and its panels', async (page) => {
  await page.goto(`${BASE}/game`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /campus grove|continue your week/i })
    .click({ timeout: 20_000 }).catch(() => {})
  await clearGreeting(page)

  const sheet = page.getByRole('dialog', { name: 'Town List' })
  await page.getByRole('button', { name: /town list/i }).click().catch(() => {})
  const places = await sheet.locator('.tl-row').count().catch(() => 0)
  for (let i = 0; i < places; i += 1) {
    await page.getByRole('button', { name: /town list/i }).click().catch(() => {})
    await sheet.locator('.tl-row').nth(i).click().catch(() => {})
    await page.waitForTimeout(140)
    await page.keyboard.press('Escape').catch(() => {})
  }
  // The dock flyouts and the settings/shop panels.
  await page.locator('.dock-face').first().click().catch(() => {})
  await page.waitForTimeout(150)
})

await browser.close()

let total = 0
let used = 0
const rows = []
for (const [url, data] of seen) {
  const hit = bytesOf(data.ranges)
  total += data.size
  used += hit
  const name = decodeURIComponent(url.split('/').pop() ?? url)
  rows.push({
    name: name.length > 40 ? `${name.slice(0, 37)}...` : name,
    size: data.size,
    hit,
    pct: data.size ? (hit / data.size) * 100 : 0,
  })
}

console.log('\nCSS coverage, unioned across every route\n')
for (const r of rows.sort((a, b) => b.size - a.size)) {
  console.log(
    `  ${r.name.padEnd(42)} ${(r.size / 1024).toFixed(1).padStart(7)} KB` +
    `  used ${r.pct.toFixed(0).padStart(3)}%` +
    `  unused ${((r.size - r.hit) / 1024).toFixed(1).padStart(6)} KB`,
  )
}
console.log(
  `\n  TOTAL ${(total / 1024).toFixed(1)} KB, used ${((used / total) * 100).toFixed(0)}%, ` +
  `unused ${((total - used) / 1024).toFixed(1)} KB\n`,
)
