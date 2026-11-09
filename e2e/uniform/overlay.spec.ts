import {type Page, expect, test} from '@playwright/test'

import {control, expectProbe, input, openFixture, readCalls} from './helpers'

/**
 * Forms inside WTabs: e2e/fixtures/uniform/TabsForm.vue. The states reach the tab buttons: red with an error,
 * green when an inactive tab has values (`showHasValue`), and a dot while it has changes.
 */
test.describe('in tabs', () => {
  const tab = (page: Page, title: string) => page.getByRole('button', {name: title, exact: true})
  const changesDot = (page: Page, title: string) => tab(page, title).locator('.rounded-full.bg-tone-fill')
  const current = async (page: Page) => JSON.parse(await page.locator('#probe-current').textContent() ?? '""') as string

  test('reports changes to the tab the field is in', async ({page}) => {
    await openFixture(page, 'TabsForm')

    await expect(changesDot(page, 'Profile')).toHaveCount(0)

    await input(page, 'Name').fill('Grace')

    await expect(changesDot(page, 'Profile')).toHaveCount(1)
    await expect(changesDot(page, 'Address')).toHaveCount(0)
  })

  test('reports whether the required fields of a tab have values', async ({page}) => {
    await openFixture(page, 'TabsForm')

    await expect(tab(page, 'Address')).not.toHaveClass(/tone-positive/)

    await tab(page, 'Address').click()
    await input(page, 'City').fill('Paris')
    await tab(page, 'Profile').click()

    await expect(tab(page, 'Address')).toHaveClass(/tone-positive/)
  })

  test('passes the states to the `title` slot of the tab', async ({page}) => {
    await openFixture(page, 'TabsForm')

    await expectProbe(page, 'tab-address', {hasChanges: false, hasError: false, hasValue: false})

    await tab(page, 'Address').click()
    await input(page, 'City').fill('Paris')

    await expectProbe(page, 'tab-address', {hasChanges: true, hasValue: true})

    await input(page, 'City').fill('')
    await page.getByRole('button', {name: 'Save'}).click()

    await expect(tab(page, 'Address')).toHaveClass(/tone-negative/)
    await expectProbe(page, 'tab-address', {hasChanges: false, hasError: true, hasValue: false})
  })

  test('switches to the tab with an error on submit', async ({page}) => {
    await openFixture(page, 'TabsForm')

    await page.getByRole('button', {name: 'Save'}).click()

    await expect(tab(page, 'Address')).toHaveClass(/tone-negative/)
    await expect(tab(page, 'Profile')).not.toHaveClass(/tone-negative/)
    await expect.poll(() => current(page)).toBe('address')
    await expect(input(page, 'City')).toBeVisible()
    expect(await readCalls(page)).toEqual([])
  })

  test('stays on the tab with `noSwitchOnInvalid`', async ({page}) => {
    await openFixture(page, 'TabsForm', {noSwitch: true})

    await page.getByRole('button', {name: 'Save'}).click()

    await expect(tab(page, 'Address')).toHaveClass(/tone-negative/)
    // The switch would come after a short debounce.
    await page.waitForTimeout(300)
    expect(await current(page)).toBe('profile')
  })

  test('reports the states given with `initHasValue` and `initHasError`', async ({page}) => {
    await openFixture(page, 'TabsForm')

    await expect(tab(page, 'Extra')).not.toHaveClass(/tone-positive/)

    await control(page, 'setExtra', true, false)
    await expect(tab(page, 'Extra')).toHaveClass(/tone-positive/)

    await control(page, 'setExtra', null, true)
    await expect(tab(page, 'Extra')).toHaveClass(/tone-negative/)
    await expect.poll(() => current(page)).toBe('extra')
  })
})

/** A form in a modal: e2e/fixtures/uniform/ModalOpener.vue opens e2e/fixtures/uniform/parts/PersonModal.vue. */
test.describe('in a modal', () => {
  // The backdrop is the close button: a click beside the dialog.
  const close = (page: Page) => page.getByRole('button', {name: 'Close modal'}).click({position: {x: 5, y: 5}})
  const dialogTitle = (page: Page) => page.getByText('Edit person')

  test('closes at once without changes', async ({page}) => {
    await openFixture(page, 'ModalOpener')
    await page.getByRole('button', {name: 'Open form'}).click()
    await expect(dialogTitle(page)).toBeVisible()
    // The class of WModalWrapper goes to the modal.
    await expect(page.getByRole('dialog')).toHaveClass(/w-modal-wrapper-w-120/)

    await close(page)

    await expect(dialogTitle(page)).toHaveCount(0)
    await expectProbe(page, 'closed', 1)
  })

  test('asks before closing with unsaved changes', async ({page}) => {
    await openFixture(page, 'ModalOpener')
    await page.getByRole('button', {name: 'Open form'}).click()

    await input(page, 'Name').fill('Grace')
    await close(page)

    await expect(page.getByText('Close without saving?')).toBeVisible()
    await expect(dialogTitle(page)).toBeVisible()

    await page.getByRole('button', {name: 'Close', exact: true}).click()

    await expect(dialogTitle(page)).toHaveCount(0)
  })

  test('asks before closing while saving, and closes without asking once saved', async ({page}) => {
    await openFixture(page, 'ModalOpener')
    await page.getByRole('button', {name: 'Open form'}).click()

    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Save'}).click()
    await expect.poll(() => readCalls(page)).toHaveLength(1)

    // Escape leaves a modal open, and while the changes are being saved they still count as unsaved.
    await page.keyboard.press('Escape')
    await close(page)
    await expect(page.getByText('Close without saving?')).toBeVisible()
    await page.getByRole('button', {name: 'Cancel'}).click()
    await expect(page.getByText('Close without saving?')).toHaveCount(0)
    await expect(dialogTitle(page)).toBeVisible()

    await control(page, 'save')
    await close(page)

    await expect(page.getByText('Close without saving?')).toHaveCount(0)
    await expect(dialogTitle(page)).toHaveCount(0)
  })

  test('never asks before closing an `async` form', async ({page}) => {
    await openFixture(page, 'ModalOpener', {async: true})
    await page.getByRole('button', {name: 'Open form'}).click()

    await input(page, 'Name').fill('Grace')
    await input(page, 'Name').press('Enter')
    await expect.poll(() => readCalls(page)).toHaveLength(1)
    await control(page, 'save')

    await close(page)

    await expect(page.getByText('Close without saving?')).toHaveCount(0)
    await expect(dialogTitle(page)).toHaveCount(0)
  })
})

test.describe('in a stepper', () => {
  test.beforeEach(async ({page}) => {
    await openFixture(page, 'ModalOpener')
    await page.getByRole('button', {name: 'Open stepper'}).click()
    await expect(input(page, 'Name')).toBeVisible()
  })

  test('moves on without saving when nothing changed', async ({page}) => {
    await page.getByRole('button', {name: 'Next'}).click()

    await expect(input(page, 'City')).toBeVisible()
    expect(await readCalls(page)).toEqual([])
  })

  test('saves a step with `requireSave` before moving on', async ({page}) => {
    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Next'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {name: 'Grace'}, status: 'pending'}])
    await expect(input(page, 'Name')).toBeVisible()

    await control(page, 'save')

    await expect(input(page, 'City')).toBeVisible()
  })

  test('stays on the step when its save fails', async ({page}) => {
    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Next'}).click()
    await expect.poll(() => readCalls(page)).toHaveLength(1)

    await control(page, 'reject', {name: ['Taken']})

    await expect(page.getByText('Taken')).toBeVisible()
    await expect(input(page, 'Name')).toBeVisible()
    await expect(input(page, 'City')).toBeHidden()
  })

  test('does not move on from a step with invalid fields', async ({page}) => {
    await input(page, 'Name').fill('')
    await page.getByRole('button', {name: 'Next'}).click()

    await expect(page.getByText('Form contains invalid data')).toBeVisible()
    await expect(input(page, 'Name')).toBeVisible()
    expect(await readCalls(page)).toEqual([])
  })

  test('submits the form from the last step', async ({page}) => {
    await page.getByRole('button', {name: 'Next'}).click()
    await input(page, 'City').fill('Paris')
    await page.getByRole('button', {name: 'Submit'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {city: 'Paris'}, status: 'pending'}])
  })
})
