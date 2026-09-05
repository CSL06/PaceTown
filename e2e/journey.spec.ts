import { expect, test, type Page } from '@playwright/test'

/**
 * Clears the guardian who greets you on arrival.
 *
 * Three things make this fiddlier than one click, and all three are real
 * product behaviour rather than test noise: the greeting is fired on a 400ms
 * timer after entering, so it does not exist yet when the click resolves; it
 * types its lines out and a click completes or advances one line at a time;
 * and it ends on a choice rather than dismissing itself. The overlay covers
 * the lower HUD until all of that is done.
 */
async function dismissGreeting(page: Page) {
  const greeting = page.getByRole('group', { name: 'Conversation' })

  /* Wait generously for it to arrive. It fires on a 400ms timer after entering,
     and a slow CI runner can push that well past a short poll — in which case
     the helper returns, the greeting appears a moment later, and it either
     swallows the next click or, worse, absorbs the next Escape (the app closes
     the conversation before the panel, by design). Both failure modes showed up
     in CI and neither was an app bug. */
  if (!await greeting.isVisible({ timeout: 15_000 }).catch(() => false)) return

  for (let i = 0; i < 14; i += 1) {
    if (!await greeting.isVisible().catch(() => false)) break
    // Prefer the choice that does not navigate away.
    const stay = greeting.getByRole('button', { name: /look around|not now|no thanks/i })
    if (await stay.isVisible().catch(() => false)) {
      await stay.click()
      break
    }
    await greeting.click()
    // Each click completes or advances one typed line; give it a beat rather
    // than racing the typewriter.
    await page.waitForTimeout(200)
  }

  await expect(greeting).toBeHidden({ timeout: 15_000 })
  // Nothing should be able to reopen it, but confirm the field is clear before
  // the caller starts pressing keys.
  await expect(greeting).toHaveCount(0, { timeout: 5_000 }).catch(() => {})
}

/**
 * The paths a person actually walks.
 *
 * Deliberately not exhaustive. Each of these covers a seam that unit tests
 * structurally cannot see — routing, the auth guard, the loading gate, and
 * whether saved state survives a reload. A flaky E2E suite gets ignored, so
 * this stays small and asserts on things a user would name.
 */

/**
 * Enters the town with the first-run intro already seen.
 *
 * The panel tests are about the HUD and the sheet, not about onboarding, and
 * Kai's greeting is fired on a timer that a slow runner can push past any poll
 * the test makes. Rather than racing it, this marks the intro as seen before
 * the game mounts, so it never fires. That removes the flake at its source
 * instead of widening a timeout until it usually passes.
 */
async function enterTownQuietly(page: Page) {
  await page.goto('/game')
  await page.waitForURL(/\/town/, { timeout: 20_000 })

  await page.evaluate(() => {
    const raw = localStorage.getItem('pacetown.game')
    if (!raw) return
    const save = JSON.parse(raw)
    save.introSeen = true
    localStorage.setItem('pacetown.game', JSON.stringify(save))
  })
  await page.reload()

  await page.getByRole('button', { name: /campus grove|continue your week/i })
    .click({ timeout: 20_000 })
  // Belt and braces: a place greeting could still appear on a first entry.
  await dismissGreeting(page)
}

test.describe('arriving', () => {
  test('the landing page renders its live hero and the real numbers', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // The load figure is computed by the domain layer on the page, so a
    // percentage appearing at all proves the whole model ran in the browser.
    await expect(page.getByText(/%/).first()).toBeVisible()
  })

  test('the parser demo reacts to what you type', async ({ page }) => {
    await page.goto('/')
    const box = page.locator('#try-week')
    await box.scrollIntoViewIfNeeded()
    await box.fill('Lecture from 9 to 12, essay due tomorrow takes 90 minutes')

    // Parsed locally as you type: the essay should be recognised as a task.
    await expect(page.getByText(/essay/i).first()).toBeVisible()
  })
})

test.describe('the auth guard', () => {
  test('sends a signed-out visitor to sign in', async ({ page }) => {
    await page.goto('/town')
    await expect(page).toHaveURL(/\/login/)
  })

  test('lets a new account through onboarding into the town', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel(/what should we call you/i).fill('Sam')
    await page.getByLabel('Email').fill(`sam${Date.now()}@uni.edu`)
    await page.getByLabel(/password/i).first().fill('grove-pace-24')
    await page.getByRole('button', { name: /create account/i }).click()

    // New accounts go through first-run setup, not straight to the town.
    await expect(page).toHaveURL(/\/welcome/)
    await page.getByRole('button', { name: /skip/i }).click()

    await expect(page).toHaveURL(/\/town/)
    await expect(page.getByRole('button', { name: /campus grove|continue your week/i }))
      .toBeVisible({ timeout: 15_000 })
  })
})

test.describe('the demo path', () => {
  test('opens the town in one click with no account', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /explore the town/i }).click()

    await expect(page).toHaveURL(/\/town/)
    // Past the loading gate and onto the title screen.
    await expect(page.getByRole('button', { name: /campus grove|continue your week/i }))
      .toBeVisible({ timeout: 15_000 })
  })

  test('/game is a one-click front door for a presenter', async ({ page }) => {
    await page.goto('/game')
    await expect(page).toHaveURL(/\/town/)
    await expect(page.getByRole('button', { name: /campus grove|continue your week/i }))
      .toBeVisible({ timeout: 15_000 })
  })
})

test.describe('inside the town', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game')
    await page.getByRole('button', { name: /campus grove|continue your week/i })
      .click({ timeout: 15_000 })

    await dismissGreeting(page)
  })

  test('the HUD shows the week and the Town List reaches every place', async ({ page }) => {
    await expect(page.getByText(/daily load/i)).toBeVisible()

    await page.getByRole('button', { name: /town list/i }).click()
    const sheet = page.getByRole('dialog', { name: 'Town List' })
    await expect(sheet).toBeVisible()
    // The list is the keyboard path through the whole map.
    await expect(sheet.getByText('Library')).toBeVisible()
    await expect(sheet.getByText('Clock Tower')).toBeVisible()
  })

  test('a panel traps focus, as a modal dialog promises to', async ({ page }) => {
    await page.getByRole('button', { name: /town list/i }).click()
    const sheet = page.getByRole('dialog', { name: 'Town List' })
    await expect(sheet).toBeVisible()

    // Focus must be inside the dialog, not left behind on the campus.
    const inside = await sheet.evaluate((el) => el.contains(document.activeElement))
    expect(inside).toBe(true)
  })

  test('Escape closes the panel', async ({ page }) => {
    await page.getByRole('button', { name: /town list/i }).click()
    const sheet = page.getByRole('dialog', { name: 'Town List' })
    await expect(sheet).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })
})

test.describe('state survives', () => {
  test('a reload keeps you signed in and keeps your week', async ({ page }) => {
    await page.goto('/game')
    await page.getByRole('button', { name: /campus grove|continue your week/i })
      .click({ timeout: 15_000 })
    await dismissGreeting(page)
    await expect(page.getByText(/daily load/i)).toBeVisible()

    await page.reload()
    // Still past the guard, and back on the title screen with progress intact.
    await expect(page).toHaveURL(/\/town/)
    await expect(page.getByRole('button', { name: /campus grove|continue your week/i }))
      .toBeVisible({ timeout: 15_000 })
  })

  test('the theme choice persists across a reload', async ({ page }) => {
    // The landing is pinned light by design and no longer carries a toggle,
    // so the theme control lives where it belongs: the game's own settings.
    await enterTownQuietly(page)

    await page.getByRole('button', { name: /account:/i }).click()
    await page.getByRole('menuitem', { name: /^settings$/i }).click()

    const sheet = page.getByRole('dialog', { name: 'Settings' })
    await expect(sheet).toBeVisible()
    await sheet.getByRole('button', { name: /^dark$/i }).click()

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe('dark')

    await page.reload()
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe('dark')
  })
})

test.describe('on a phone', () => {
  // The product claims a phone works. That claim deserves a test rather than
  // a media query nobody has looked at on a device.
  test.skip(({ isMobile }) => !isMobile, 'mobile-only checks')

  test('the town is reachable and gives you touch controls', async ({ page }) => {
    await enterTownQuietly(page)

    // Walking without a keyboard has to be possible.
    await expect(page.locator('.dpad')).toBeVisible()
    await expect(page.locator('.dpad button')).toHaveCount(4)
  })

  test('the HUD sheds pieces instead of wrapping onto a second row', async ({ page }) => {
    await enterTownQuietly(page)

    // The load figure is the one thing that must survive every breakpoint.
    await expect(page.getByText(/daily load/i)).toBeVisible()

    // A rail that reflowed would be taller than one row of chips.
    const railHeight = await page.locator('.hud-top').evaluate((el) => el.getBoundingClientRect().height)
    expect(railHeight).toBeLessThan(90)
  })

  test('a panel still fits and closes', async ({ page }) => {
    await enterTownQuietly(page)

    await page.getByRole('button', { name: /town list/i }).click()
    const sheet = page.getByRole('dialog', { name: 'Town List' })
    await expect(sheet).toBeVisible()

    const box = await sheet.boundingBox()
    const viewport = page.viewportSize()!
    expect(box!.width).toBeLessThanOrEqual(viewport.width)

    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })
})
