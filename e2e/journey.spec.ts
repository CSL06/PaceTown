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
async function dismissGreeting(page: Page, { appearWithin = 15_000 } = {}) {
  const greeting = page.getByRole('group', { name: 'Conversation' })

  /* A *real* wait for it to arrive. The previous version asked
     `isVisible({ timeout })`, which looks like a wait and is not: `isVisible`
     resolves against the current DOM and ignores the option entirely, so it
     returned in about 4ms. The greeting then landed on its 400ms timer with a
     panel already open, and absorbed the Escape the test was about to press —
     the app closes a conversation before a panel, by design. Measured, not
     guessed: see the probe in the commit message.

     Callers that have suppressed the intro pass a short window, since for them
     a greeting is possible but not expected. */
  try {
    await greeting.waitFor({ state: 'visible', timeout: appearWithin })
  } catch {
    return // It is not coming. Nothing to dismiss.
  }

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
  // The intro is suppressed above, so none is expected — keep the window short.
  await dismissGreeting(page, { appearWithin: 1500 })
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
    /* The *primary* hero action plays. It used to lead to sign-up, which put
       three gates between a visitor and anything the product does well. This
       asserts the strong version: the first button on the page reaches the
       town, without an account. */
    await page.goto('/')
    await page.getByRole('button', { name: /start today.s mission/i }).click()

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
  /* These tests are about the HUD and the sheet, not about onboarding, so they
     enter with the intro already seen. Racing Kai's 400ms greeting is what made
     this group flaky: it would appear over an open panel and eat the Escape. */
  test.beforeEach(async ({ page }) => {
    await enterTownQuietly(page)
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

/**
 * Steers the avatar toward a world point by holding a direction in short
 * bursts and re-reading its position between them.
 *
 * Deliberately a convergence loop rather than a fixed sequence of timed key
 * presses: movement is delta-time based, so a fixed press on a loaded runner
 * covers a different distance than it does locally. This checks where it
 * actually got to and keeps nudging, which makes it independent of speed.
 */
async function walkTo(page: Page, tx: number, ty: number, steps = 60) {
  const read = () => page.evaluate(() => {
    const a = document.querySelector<HTMLElement>('.stage .avatar')
    return a ? { px: parseFloat(a.style.left), py: parseFloat(a.style.top) } : null
  })
  for (let i = 0; i < steps; i += 1) {
    const at = await read()
    if (!at) return null
    const dx = tx - at.px
    const dy = ty - at.py
    if (Math.abs(dx) < 0.9 && Math.abs(dy) < 0.9) return at
    const key = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft')
      : (dy > 0 ? 'ArrowDown' : 'ArrowUp')
    await page.keyboard.down(key)
    await page.waitForTimeout(110)
    await page.keyboard.up(key)
    await page.waitForTimeout(45)
  }
  return read()
}

/**
 * The demo route, end to end: spawn in the Council courtyard, walk to Sky,
 * talk to her, open her feature, come back.
 *
 * The property that matters here is the one that is easy to regress and
 * invisible to a unit test: pressing E beside someone you walked to must not
 * teleport you to their doorstep.
 */
test.describe('the demo route', () => {
  test.beforeEach(async ({ page }) => {
    await enterTownQuietly(page)
  })

  test('walk to Sky, talk, open Warm Cup, and come back', async ({ page }) => {
    const avatar = () => page.evaluate(() => {
      const a = document.querySelector<HTMLElement>('.stage .avatar')
      return a ? { px: parseFloat(a.style.left), py: parseFloat(a.style.top) } : null
    })

    // Spawn is the paving below the Council planter.
    expect(await avatar()).toEqual({ px: 49.8, py: 75 })

    // West along the plaza, then north onto the café terrace.
    await walkTo(page, 30, 74)
    const arrived = await walkTo(page, 27.5, 60.6)
    expect(arrived, 'should have reached the café terrace').not.toBeNull()

    await expect(page.locator('.prompt')).toContainText(/Talk to Sky/i, { timeout: 10_000 })

    // Pressing E here must not move the avatar.
    const before = await avatar()
    await page.keyboard.press('e')
    await expect(page.getByRole('group', { name: 'Conversation' })).toBeVisible({ timeout: 10_000 })
    expect(await avatar(), 'walking up to Sky then pressing E must not teleport').toEqual(before)

    // Ambient routines hold while someone is talking.
    expect(await page.evaluate(() =>
      [...document.querySelectorAll('.cast.idle')].every((c) => c.classList.contains('hold')),
    )).toBe(true)

    // Through the greeting and into Sky's own feature.
    const convo = page.getByRole('group', { name: 'Conversation' })
    const yes = page.getByRole('button', { name: /^yes$/i })
    for (let i = 0; i < 8; i += 1) {
      if (await page.locator('.recovery-scene').isVisible().catch(() => false)) break
      if (await yes.isVisible().catch(() => false)) await yes.click()
      else if (await convo.isVisible().catch(() => false)) await convo.click()
      await page.waitForTimeout(250)
    }
    await expect(page.locator('.recovery-scene')).toBeVisible({ timeout: 10_000 })

    // And back out to the campus, standing where we left off.
    await page.getByRole('button', { name: /leave activity|^leave$/i }).click()
    await expect(page.locator('.stage')).toBeVisible({ timeout: 10_000 })
    expect(await avatar()).toEqual(before)
  })

  test('travelling from the Town List still moves you', async ({ page }) => {
    // The no-teleport rule must not have broken travel, which is the only way
    // to reach places on the far side of town.
    await page.getByRole('button', { name: /town list/i }).click()
    await page.getByRole('dialog', { name: 'Town List' }).locator('.tl-row')
      .filter({ hasText: 'Calm Corner' }).first().click()
    await expect(page.evaluate(() => {
      const a = document.querySelector<HTMLElement>('.stage .avatar')
      return a ? { px: parseFloat(a.style.left), py: parseFloat(a.style.top) } : null
    })).resolves.toEqual({ px: 69.5, py: 79 })
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
