import {expect, test} from '@playwright/test'

import {control, expectProbe, fieldOf, input, notificationCloseButtons, openFixture, readCalls} from './helpers'

/**
 * An `async` form, saving each change as it is made: e2e/fixtures/uniform/AsyncForm.vue.
 * Its API calls stay pending until the test settles them with the fixture's controls.
 */

const INITIAL = {theme: 'system', notifications: true, nickname: 'ada', bio: '', email: 'ada@example.com'}

test.describe('saving each change', () => {
  test.beforeEach(async ({page}) => {
    await openFixture(page, 'AsyncForm')
  })

  test('saves a change at once, sending only that field', async ({page}) => {
    await page.getByRole('button', {name: 'dark'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {theme: 'dark'}, status: 'pending'}])
  })

  test('shows a spinner on the saved field and keeps the form editable', async ({page}) => {
    await page.getByRole('button', {name: 'dark'}).click()

    await expectProbe(page, 'form', {submitting: true})
    await expectProbe(page, 'theme', {loading: true, disabled: false})
    await expectProbe(page, 'nickname', {loading: false, disabled: false})
    await expect(input(page, 'Nickname')).toBeEditable()

    await control(page, 'save')

    await expectProbe(page, 'form', {submitting: false, hasChanges: false})
    await expectProbe(page, 'theme', {loading: false, hasChanges: false, modelValue: 'dark'})
    await expectProbe(page, 'events', [{success: {...INITIAL, theme: 'dark'}}])
  })

  test('shows the saved message on the saved field', async ({page}) => {
    await input(page, 'Bio').fill('Mathematician')
    await input(page, 'Bio').press('Enter')
    await control(page, 'save')

    await expect(fieldOf(page, 'Bio').getByText('Saved')).toBeVisible()
    await expect(fieldOf(page, 'Nickname').getByText('Saved')).toHaveCount(0)
  })

  test('saves a text field when it is committed', async ({page}) => {
    await input(page, 'Bio').fill('Mathematician')

    // The input keeps a draft until Enter or blur.
    await expectProbe(page, 'bio', {modelValue: ''})
    expect(await readCalls(page)).toEqual([])

    await input(page, 'Bio').press('Enter')

    await expect.poll(() => readCalls(page)).toEqual([{payload: {bio: 'Mathematician'}, status: 'pending'}])
  })

  test('sends the changes made while saving once the save ends, in one call', async ({page}) => {
    await page.getByRole('button', {name: 'dark'}).click()
    await expect.poll(() => readCalls(page)).toHaveLength(1)

    await input(page, 'Bio').fill('Mathematician')
    await input(page, 'Bio').press('Enter')
    await input(page, 'Nickname').fill('grace')
    await input(page, 'Nickname').press('Enter')

    await expectProbe(page, 'bio', {modelValue: 'Mathematician'})
    await expectProbe(page, 'nickname', {modelValue: 'grace'})
    expect(await readCalls(page)).toHaveLength(1)

    await control(page, 'save')

    await expect.poll(() => readCalls(page)).toEqual([
      {payload: {theme: 'dark'}, status: 'resolved'},
      {payload: {nickname: 'grace', bio: 'Mathematician'}, status: 'pending'},
    ])

    // The first save's result does not take back the changes made meanwhile.
    await expectProbe(page, 'bio', {modelValue: 'Mathematician', hasChanges: true})

    await control(page, 'save')

    await expectProbe(page, 'form', {hasChanges: false, submitting: false})
    expect(await readCalls(page)).toHaveLength(2)
  })

  test('holds back an invalid field and saves the rest', async ({page}) => {
    await input(page, 'Nickname').fill('ab')
    await input(page, 'Nickname').press('Enter')

    // Shown at once, without a submit attempt and without a warning.
    await expectProbe(page, 'nickname', {errorMessage: 'At least 3 characters', modelValue: 'ab'})
    await expect(fieldOf(page, 'Nickname').getByText('At least 3 characters')).toBeVisible()
    await expect(page.getByText('Form contains invalid data')).toHaveCount(0)
    expect(await readCalls(page)).toEqual([])

    await page.getByRole('button', {name: 'dark'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {theme: 'dark'}, status: 'pending'}])

    await control(page, 'save')

    await expectProbe(page, 'theme', {hasChanges: false})
    await expectProbe(page, 'nickname', {hasChanges: true, modelValue: 'ab', errorMessage: 'At least 3 characters'})

    await input(page, 'Nickname').fill('abc')
    await input(page, 'Nickname').press('Enter')

    await expectProbe(page, 'nickname', {errorMessage: null})
    await expect.poll(() => readCalls(page)).toHaveLength(2)
    expect((await readCalls(page))[1]).toEqual({payload: {nickname: 'abc'}, status: 'pending'})
  })

  test('keeps the unsent changes when the API returns nothing', async ({page}) => {
    await input(page, 'Nickname').fill('ab')
    await input(page, 'Nickname').press('Enter')
    await page.getByRole('button', {name: 'dark'}).click()
    await expect.poll(() => readCalls(page)).toHaveLength(1)

    await control(page, 'resolve', undefined)

    await expectProbe(page, 'theme', {hasChanges: false, modelValue: 'dark'})
    await expectProbe(page, 'nickname', {hasChanges: true, modelValue: 'ab'})
    await expectProbe(page, 'form', {modelValueInit: {...INITIAL, theme: 'dark'}})
    await expectProbe(page, 'events', [{success: {theme: 'dark'}}])
  })

  test('shows a field error from the server', async ({page}) => {
    await input(page, 'Nickname').fill('grace')
    await input(page, 'Nickname').press('Enter')
    await expect.poll(() => readCalls(page)).toHaveLength(1)

    await control(page, 'reject', {nickname: ['This nickname is taken']})

    await expect(fieldOf(page, 'Nickname').getByText('This nickname is taken')).toBeVisible()
    await expectProbe(page, 'nickname', {hasChanges: true, loading: false})
    await expect(page.getByText('Error', {exact: true})).toBeVisible()
  })
})

test('waits until the whole form is valid with `fullPayload`, and sends all of it', async ({page}) => {
  await openFixture(page, 'AsyncForm', {fullPayload: true})

  await input(page, 'Nickname').fill('ab')
  await input(page, 'Nickname').press('Enter')
  await page.getByRole('button', {name: 'dark'}).click()

  await expectProbe(page, 'theme', {modelValue: 'dark'})
  expect(await readCalls(page)).toEqual([])
  await expect(notificationCloseButtons(page)).toHaveCount(0)

  await input(page, 'Nickname').fill('abc')
  await input(page, 'Nickname').press('Enter')

  await expect.poll(() => readCalls(page)).toEqual([{payload: {...INITIAL, theme: 'dark', nickname: 'abc'}, status: 'pending'}])
})

for (const confirm of ['sync', 'async'] as const) {
  test.describe(`confirm before a change (${ confirm } getter)`, () => {
    test.beforeEach(async ({page}) => {
      await openFixture(page, 'AsyncForm', {confirm})
    })

    test('drops the change on cancel', async ({page}) => {
      await page.getByRole('switch', {name: 'Email notifications'}).click()

      await expect(page.getByText('Turn off notifications?')).toBeVisible()
      expect(await readCalls(page)).toEqual([])

      await page.getByRole('button', {name: 'Cancel'}).click()

      await expect(page.getByText('Turn off notifications?')).toHaveCount(0)
      await expect(page.getByRole('switch', {name: 'Email notifications'})).toHaveAttribute('aria-checked', 'true')
      await expectProbe(page, 'notifications', {modelValue: true, hasChanges: false})
      expect(await readCalls(page)).toEqual([])
    })

    test('applies and saves the change on accept', async ({page}) => {
      await page.getByRole('switch', {name: 'Email notifications'}).click()
      await page.getByRole('button', {name: 'Turn off'}).click()

      await expect.poll(() => readCalls(page)).toEqual([{payload: {notifications: false}, status: 'pending'}])
      await expectProbe(page, 'notifications', {modelValue: false})
    })

    test('applies a change at once when the getter returns nothing', async ({page}) => {
      await page.getByRole('switch', {name: 'Email notifications'}).click()
      await page.getByRole('button', {name: 'Turn off'}).click()
      await control(page, 'save')
      await expectProbe(page, 'notifications', {modelValue: false, hasChanges: false})

      await page.getByRole('switch', {name: 'Email notifications'}).click()

      await expect.poll(() => readCalls(page)).toHaveLength(2)
      await expect(page.getByText('Turn off notifications?')).toHaveCount(0)
    })
  })
}

test('drops the draft of a text field on a cancelled confirm', async ({page}) => {
  await openFixture(page, 'AsyncForm')

  await input(page, 'Email').fill('grace@example.com')
  await input(page, 'Email').press('Enter')

  // One confirm, though the input commits on Enter and again on the blur the confirm causes.
  await expect(page.getByRole('heading', {name: 'Change the email?'})).toHaveCount(1)

  await page.getByRole('button', {name: 'Cancel'}).click()

  await expect(input(page, 'Email')).toHaveValue('ada@example.com')
  await expectProbe(page, 'email', {modelValue: 'ada@example.com', hasChanges: false})
  expect(await readCalls(page)).toEqual([])
})
