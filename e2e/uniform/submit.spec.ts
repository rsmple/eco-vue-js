import {expect, test} from '@playwright/test'

import {control, expectProbe, fieldOf, input, notificationCloseButtons, openFixture, readCalls, readProbe} from './helpers'

/**
 * A form with its own copy of the model (`initData`) saved on submit: e2e/fixtures/uniform/SubmitForm.vue.
 * Its API calls stay pending until the test settles them with the fixture's controls.
 */

const INITIAL = {
  name: 'Ada',
  email: 'ada@example.com',
  nickname: '',
  address: {city: 'London', zip: ''},
  tags: ['math'],
  token: 'abc',
}

test.describe('changes', () => {
  test.beforeEach(async ({page}) => {
    await openFixture(page, 'SubmitForm')
  })

  test('starts without changes', async ({page}) => {
    await expectProbe(page, 'form', {hasChanges: false, submitting: false, modelValue: INITIAL, modelValueInit: INITIAL})
    await expectProbe(page, 'name', {modelValue: 'Ada', hasChanges: false, errorMessage: null, title: 'Name', required: true})
    await expect(page.getByRole('button', {name: 'Save'})).toBeDisabled()
  })

  test('marks a field and the form changed, and clears it when the value is restored', async ({page}) => {
    await input(page, 'Name').fill('Grace')

    await expectProbe(page, 'name', {modelValue: 'Grace', hasChanges: true})
    await expectProbe(page, 'email', {hasChanges: false})
    await expectProbe(page, 'form', {hasChanges: true, modelValue: {...INITIAL, name: 'Grace'}, modelValueInit: INITIAL})
    await expect(page.getByRole('button', {name: 'Save'})).toBeEnabled()

    await input(page, 'Name').fill('Ada')

    await expectProbe(page, 'name', {hasChanges: false})
    await expectProbe(page, 'form', {hasChanges: false})
  })

  test('marks a nested form and its parent changed', async ({page}) => {
    await input(page, 'Zip').fill('NW1')

    await expectProbe(page, 'zip', {hasChanges: true})
    await expectProbe(page, 'city', {hasChanges: false})
    await expectProbe(page, 'address', {hasChanges: true, modelValue: {city: 'London', zip: 'NW1'}})
    await expectProbe(page, 'form', {hasChanges: true})
  })

  test('tracks an array field through select and unselect', async ({page}) => {
    await page.getByRole('button', {name: 'tag poetry'}).click()

    await expectProbe(page, 'tags', {modelValue: ['math', 'poetry'], hasChanges: true})
    await expectProbe(page, 'form', {hasChanges: true})

    await page.getByRole('button', {name: 'tag poetry'}).click()

    await expectProbe(page, 'tags', {modelValue: ['math'], hasChanges: false})

    await page.getByRole('button', {name: 'tag math'}).click()

    await expectProbe(page, 'tags', {modelValue: [], hasChanges: true})
  })

  test('never reports changes of a `noChanges` field', async ({page}) => {
    await input(page, 'Token').fill('xyz')

    await expectProbe(page, 'token', {modelValue: 'xyz', hasChanges: null})
    await expectProbe(page, 'form', {hasChanges: false})
  })

  test('reports `hasValue` of required and mandatory fields', async ({page}) => {
    // Nickname is mandatory and empty: it does not count as missing, only as not filled.
    await expectProbe(page, 'nickname', {hasValue: null})
    await expectProbe(page, 'name', {hasValue: true})
    await expectProbe(page, 'form', {hasValue: true})

    await input(page, 'Nickname').fill('ada')
    await expectProbe(page, 'nickname', {hasValue: true})

    await input(page, 'Name').fill('')
    await expectProbe(page, 'name', {hasValue: false})
    await expectProbe(page, 'form', {hasValue: false})
  })

  test('takes the current model as the initial one with `initModel`', async ({page}) => {
    await input(page, 'Name').fill('Grace')
    await expectProbe(page, 'form', {hasChanges: true})

    await page.getByRole('button', {name: 'Keep as initial'}).click()

    await expectProbe(page, 'form', {hasChanges: false, modelValueInit: {...INITIAL, name: 'Grace'}})
    await expectProbe(page, 'name', {hasChanges: false})
  })
})

test.describe('validation', () => {
  test.beforeEach(async ({page}) => {
    await openFixture(page, 'SubmitForm')
  })

  test('shows no error before a submit attempt', async ({page}) => {
    await input(page, 'Email').fill('nope')

    await expectProbe(page, 'email', {modelValue: 'nope', errorMessage: null})
    await expect(fieldOf(page, 'Email').getByText('Enter a valid email')).toHaveCount(0)
  })

  test('blocks an invalid submit, shows the errors and lists them in a warning', async ({page}) => {
    await input(page, 'Name').fill('')
    await input(page, 'City').fill('')
    await page.getByRole('button', {name: 'Save'}).click()

    await expect(fieldOf(page, 'Name').getByText('A value is required')).toBeVisible()
    await expect(fieldOf(page, 'City').getByText('A value is required')).toBeVisible()
    await expectProbe(page, 'email', {errorMessage: null})

    // The warning lists the fields by title, nested under the title of their form.
    await expect(page.getByText('Form contains invalid data')).toBeVisible()
    await expect(page.getByText('- Name: A value is required')).toBeVisible()
    await expect(page.getByText('- Address:')).toBeVisible()
    await expect(page.getByText('- City: A value is required')).toBeVisible()

    expect(await readCalls(page)).toEqual([])
    await expectProbe(page, 'form', {submitting: false, hasChanges: true})
  })

  test('checks `required` before the validators', async ({page}) => {
    await input(page, 'Email').fill('')
    await page.getByRole('button', {name: 'Save'}).click()

    await expectProbe(page, 'email', {errorMessage: 'A value is required'})
  })

  test('joins the messages of several failing validators', async ({page}) => {
    await input(page, 'Email').fill('admin')
    await page.getByRole('button', {name: 'Save'}).click()

    await expectProbe(page, 'email', {errorMessage: 'Enter a valid email, This email is reserved'})
    await expect(fieldOf(page, 'Email').getByText('Enter a valid email, This email is reserved')).toBeVisible()
  })

  test('updates a shown error as the value changes and clears it once valid', async ({page}) => {
    await input(page, 'Email').fill('admin')
    await page.getByRole('button', {name: 'Save'}).click()
    await expectProbe(page, 'email', {errorMessage: 'Enter a valid email, This email is reserved'})

    await input(page, 'Email').fill('admin@example.com')
    await expectProbe(page, 'email', {errorMessage: 'This email is reserved'})

    await input(page, 'Email').fill('grace@example.com')
    await expectProbe(page, 'email', {errorMessage: null})
    await expect(fieldOf(page, 'Email').getByText('This email is reserved')).toHaveCount(0)
  })

  test('shows the errors without submitting on `doValidate`', async ({page}) => {
    await input(page, 'Nickname').fill('a')
    await page.getByRole('button', {name: 'Validate'}).click()

    await expectProbe(page, 'nickname', {errorMessage: 'At least 3 characters'})
    await expect(page.getByText('Form contains invalid data')).toHaveCount(0)
    expect(await readCalls(page)).toEqual([])
  })

  test('submits once the errors are fixed', async ({page}) => {
    await input(page, 'Name').fill('')
    await page.getByRole('button', {name: 'Save'}).click()
    await expectProbe(page, 'name', {errorMessage: 'A value is required'})

    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Save'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {name: 'Grace'}, status: 'pending'}])
  })
})

test('scrolls to the first invalid field', async ({page}) => {
  await openFixture(page, 'SubmitForm', {spacer: true})

  await input(page, 'Name').fill('')
  await page.getByRole('button', {name: 'Save'}).click()

  await expect(input(page, 'Name')).toBeInViewport()
})

test.describe('payload', () => {
  test('sends only the changed fields, and only the changed keys of a nested form', async ({page}) => {
    await openFixture(page, 'SubmitForm')

    await input(page, 'Name').fill('Grace')
    await input(page, 'Zip').fill('NW1')
    await page.getByRole('button', {name: 'Save'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {name: 'Grace', address: {zip: 'NW1'}}, status: 'pending'}])
  })

  test('sends a changed array whole', async ({page}) => {
    await openFixture(page, 'SubmitForm')

    await page.getByRole('button', {name: 'tag poetry'}).click()
    await page.getByRole('button', {name: 'Save'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {tags: ['math', 'poetry']}, status: 'pending'}])
  })

  test('sends the whole model with `fullPayload`', async ({page}) => {
    await openFixture(page, 'SubmitForm', {fullPayload: true})

    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Save'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {...INITIAL, name: 'Grace'}, status: 'pending'}])
  })

  test('sends the whole object of a nested form with `fullPayload` when anything in it changed', async ({page}) => {
    await openFixture(page, 'SubmitForm', {addressFull: true})

    await input(page, 'Zip').fill('NW1')
    await page.getByRole('button', {name: 'Save'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {address: {city: 'London', zip: 'NW1'}}, status: 'pending'}])
  })
})

test.describe('saving', () => {
  test.beforeEach(async ({page}) => {
    await openFixture(page, 'SubmitForm')
  })

  test('disables the fields while saving and ignores another submit', async ({page}) => {
    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Save'}).click()

    await expectProbe(page, 'form', {submitting: true})
    await expectProbe(page, 'name', {disabled: true, loading: false})
    await expectProbe(page, 'city', {disabled: true})
    await expect(input(page, 'Name')).toBeDisabled()

    expect(await control(page, 'submit')).toBe(false)
    expect(await readCalls(page)).toHaveLength(1)

    await control(page, 'save')

    await expectProbe(page, 'form', {submitting: false})
    await expectProbe(page, 'name', {disabled: false})
  })

  test('takes the result as the new initial model and emits `success`', async ({page}) => {
    await input(page, 'Name').fill('grace')
    await input(page, 'Zip').fill('NW1')
    await page.getByRole('button', {name: 'Save'}).click()

    // The server normalizes the name.
    const saved = {...INITIAL, name: 'Grace', address: {city: 'London', zip: 'NW1'}}

    await control(page, 'resolve', saved)

    await expectProbe(page, 'form', {hasChanges: false, modelValue: saved, modelValueInit: saved})
    await expect(input(page, 'Name')).toHaveValue('Grace')
    await expectProbe(page, 'events', [{success: saved}])
  })

  test('shows the saved message on the changed fields only', async ({page}) => {
    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Save'}).click()
    await control(page, 'save')

    await expect(fieldOf(page, 'Name').getByText('Saved')).toBeVisible()
    await expect(fieldOf(page, 'Email').getByText('Saved')).toHaveCount(0)
  })

  test('unwraps a raw response', async ({page}) => {
    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Save'}).click()
    await control(page, 'saveResponse')

    const saved = {...INITIAL, name: 'Grace'}

    await expectProbe(page, 'events', [{success: saved}])
    await expectProbe(page, 'form', {hasChanges: false, modelValueInit: saved})
  })

  test('takes the payload when the API returns nothing', async ({page}) => {
    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Save'}).click()
    await control(page, 'resolve', undefined)

    await expectProbe(page, 'events', [{success: {name: 'Grace'}}])
    await expectProbe(page, 'form', {hasChanges: false, modelValue: {...INITIAL, name: 'Grace'}})
  })

  test('keeps the changes after a save with `noInit`', async ({page}) => {
    await openFixture(page, 'SubmitForm', {noInit: true})

    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Save'}).click()
    await control(page, 'save')

    await expectProbe(page, 'events', [{success: {...INITIAL, name: 'Grace'}}])
    await expectProbe(page, 'form', {hasChanges: true, modelValueInit: INITIAL})
  })
})

test('saves with an API method that returns without a promise', async ({page}) => {
  await openFixture(page, 'SubmitForm', {api: 'sync'})

  await input(page, 'Name').fill('Grace')
  await page.getByRole('button', {name: 'Save'}).click()

  await expectProbe(page, 'events', [{success: {...INITIAL, name: 'Grace'}}])
  await expectProbe(page, 'form', {hasChanges: false, submitting: false})
})

test.describe('server errors', () => {
  test.beforeEach(async ({page}) => {
    await openFixture(page, 'SubmitForm')

    await input(page, 'Email').fill('grace@example.com')
    await input(page, 'City').fill('Paris')
    await page.getByRole('button', {name: 'Save'}).click()
  })

  test('shows field errors on their fields, nested ones too', async ({page}) => {
    await control(page, 'reject', {email: ['This email is already taken'], address: {city: ['Unknown city']}})

    await expect(fieldOf(page, 'Email').getByText('This email is already taken')).toBeVisible()
    await expect(fieldOf(page, 'City').getByText('Unknown city')).toBeVisible()
    await expectProbe(page, 'name', {errorMessage: null})

    await expect(page.getByText('Error', {exact: true})).toBeVisible()
    await expectProbe(page, 'form', {submitting: false, hasChanges: true})
    await expectProbe(page, 'events', [])
  })

  test('clears a server error once the field is edited', async ({page}) => {
    await control(page, 'reject', {email: ['This email is already taken']})
    await expectProbe(page, 'email', {errorMessage: 'This email is already taken'})

    await input(page, 'Email').fill('grace2@example.com')

    await expectProbe(page, 'email', {errorMessage: null})
  })

  test('shows `detail` in the notification', async ({page}) => {
    await control(page, 'reject', {detail: 'You cannot edit this profile'})

    await expect(page.getByText('You cannot edit this profile')).toBeVisible()
  })

  test('shows `non_field_errors` in the notification', async ({page}) => {
    await control(page, 'reject', {non_field_errors: ['Too many changes', 'Try later']})

    await expect(page.getByText('Too many changes. Try later')).toBeVisible()
  })

  test('ignores a cancelled request', async ({page}) => {
    await control(page, 'cancel')

    await expectProbe(page, 'form', {submitting: false, hasChanges: true})
    await expect(notificationCloseButtons(page)).toHaveCount(0)
    await expectProbe(page, 'email', {errorMessage: null})
  })

  test('can be submitted again after a failure', async ({page}) => {
    await control(page, 'reject', {detail: 'Server is busy'})
    await expectProbe(page, 'form', {submitting: false})

    await page.getByRole('button', {name: 'Save'}).click()

    await expect.poll(() => readCalls(page)).toEqual([
      {payload: {email: 'grace@example.com', address: {city: 'Paris'}}, status: 'rejected'},
      {payload: {email: 'grace@example.com', address: {city: 'Paris'}}, status: 'pending'},
    ])
  })
})

test('passes `readonly`, `disabled` and `skeleton` to every field', async ({page}) => {
  await openFixture(page, 'SubmitForm')

  for (const state of ['readonly', 'disabled', 'skeleton'] as const) {
    await control(page, 'setState', state)

    for (const field of ['name', 'city', 'tags']) {
      await expectProbe(page, field, {readonly: state === 'readonly', disabled: state === 'disabled', skeleton: state === 'skeleton'})
    }

    await expectProbe(page, 'form', {readonly: state === 'readonly', disabled: state === 'disabled', skeleton: state === 'skeleton'})
  }

  await control(page, 'setState', 'editable')
  await expectProbe(page, 'name', {readonly: false, disabled: false, skeleton: false})

  expect(await readProbe(page, 'form')).toMatchObject({hasChanges: false})
})
