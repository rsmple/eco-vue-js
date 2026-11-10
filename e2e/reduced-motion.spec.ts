import {expect, test} from '@playwright/test'

/**
 * Under reduced motion the Tailwind base turns transitions off. Components that wait for Vue's `after-enter` /
 * `after-leave` must still finish, and nothing may transition that did not ask to.
 */
test.use({reducedMotion: 'reduce'})

test('a theme switch starts no transitions', async ({page}) => {
  await page.goto('./components/tabs', {waitUntil: 'networkidle'})

  const count = await page.evaluate(() => new Promise<number>(resolve => {
    let started = 0
    document.addEventListener('transitionrun', () => started++, true)
    document.documentElement.classList.toggle('dark')
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(started)))
  }))

  expect(count).toBe(0)
})

test('WTabs finishes switching', async ({page}) => {
  await page.goto('./components/tabs', {waitUntil: 'networkidle'})

  await page.getByRole('button', {name: 'Security'}).first().click()

  await expect(page.getByText('Password, two-factor authentication and active sessions.', {exact: true})).toBeVisible()
  await expect(page.getByText('Name, avatar and contact details.', {exact: true})).toBeHidden()
  await expect(page.locator('[class*="overflow-anchor"]')).toHaveCount(0)
})

test('WExpansion collapses', async ({page}) => {
  await page.goto('./components/expansion', {waitUntil: 'networkidle'})

  const toggle = page.getByText('Show details').first()
  const details = page.getByText('Sprouted', {exact: true})

  await toggle.click()
  await expect(details).toBeVisible()

  await toggle.click()
  await expect(details).toBeHidden()
})

test('WBottomSheet scrolls its content into view once open', async ({page}) => {
  await page.goto('./components/bottom-sheet', {waitUntil: 'networkidle'})

  await page.getByRole('button', {name: 'Basil'}).first().click()

  await expect(page.getByText('Rosemary', {exact: true})).toBeInViewport()
})
