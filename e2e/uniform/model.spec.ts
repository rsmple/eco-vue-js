import {expect, test} from '@playwright/test'

import {control, expectProbe, input, openFixture, readCalls} from './helpers'

/** A form without its own copy of the model, edited through `update:model-value`: e2e/fixtures/uniform/ControlledForm.vue. */
test.describe('controlled model', () => {
  const INITIAL = {name: 'Ada', address: {city: 'London'}}

  test.beforeEach(async ({page}) => {
    await openFixture(page, 'ControlledForm')
  })

  test('emits a change with the path of keys to it', async ({page}) => {
    await input(page, 'Name').fill('Grace')

    await expectProbe(page, 'events', [{update: 'Grace', fields: ['name']}])
    await expectProbe(page, 'model', {...INITIAL, name: 'Grace'})
    await expectProbe(page, 'name', {modelValue: 'Grace', hasChanges: true})
    await expectProbe(page, 'form', {hasChanges: true})
  })

  test('emits a change of a nested form with the whole path', async ({page}) => {
    await input(page, 'City').fill('Paris')

    await expectProbe(page, 'events', [{update: 'Paris', fields: ['address', 'city']}])
    await expectProbe(page, 'model', {name: 'Ada', address: {city: 'Paris'}})
    await expectProbe(page, 'city', {hasChanges: true})
  })

  test('emits a value set by path with `updateModelValueInner`', async ({page}) => {
    await page.getByRole('button', {name: 'Set street'}).click()

    await expectProbe(page, 'events', [{update: 'Baker St', fields: ['address', 'street']}])
    await expectProbe(page, 'model', {name: 'Ada', address: {city: 'London', street: 'Baker St'}})
  })

  test('compares with `modelValueInit` and asks the parent to take the model as initial', async ({page}) => {
    await input(page, 'Name').fill('Grace')
    await expectProbe(page, 'form', {hasChanges: true, modelValueInit: INITIAL})

    await page.getByRole('button', {name: 'Keep as initial'}).click()

    await expectProbe(page, 'events', [{update: 'Grace', fields: ['name']}, 'init-model'])
    await expectProbe(page, 'form', {hasChanges: false})
  })

  test('submits the changes and asks the parent to take the model as initial', async ({page}) => {
    await input(page, 'Name').fill('Grace')
    await page.getByRole('button', {name: 'Save'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {name: 'Grace'}, status: 'pending'}])

    await control(page, 'save')

    await expectProbe(page, 'events', [{update: 'Grace', fields: ['name']}, 'init-model', {success: {...INITIAL, name: 'Grace'}}])
    await expectProbe(page, 'form', {hasChanges: false})
  })
})

/** A field holding an array, edited with `select`, `unselect` and `modelValueList`: e2e/fixtures/uniform/ListForm.vue. */
test.describe('array model', () => {
  test.beforeEach(async ({page}) => {
    await openFixture(page, 'ListForm')
  })

  const names = (page: Parameters<typeof openFixture>[0]) => page.getByRole('listitem').locator('span')

  test('keeps the keys of the items that stay', async ({page}) => {
    await expect(names(page)).toHaveText(['a', 'b', 'c'])

    const keysBefore = await page.getByRole('listitem').evaluateAll(items => items.map(item => (item as HTMLElement).title))

    await page.getByRole('button', {name: 'Remove b'}).click()

    await expect(names(page)).toHaveText(['a', 'c'])
    expect(await page.getByRole('listitem').evaluateAll(items => items.map(item => (item as HTMLElement).title))).toEqual([keysBefore[0], keysBefore[2]])

    await page.getByRole('button', {name: 'Add'}).click()

    await expect(names(page)).toHaveText(['a', 'c', 'new 1'])

    const keysAfter = await page.getByRole('listitem').evaluateAll(items => items.map(item => (item as HTMLElement).title))

    expect(keysAfter.slice(0, 2)).toEqual([keysBefore[0], keysBefore[2]])
    expect(keysBefore).not.toContain(keysAfter[2])
  })

  test('tracks changes of the items and their order', async ({page}) => {
    await page.getByRole('button', {name: 'Add'}).click()
    await expectProbe(page, 'items', {hasChanges: true})

    await page.getByRole('button', {name: 'Remove new 1'}).click()
    await expectProbe(page, 'items', {hasChanges: false})

    await page.getByRole('button', {name: 'Reverse'}).click()
    await expectProbe(page, 'items', {hasChanges: true, modelValue: [{name: 'c'}, {name: 'b'}, {name: 'a'}]})

    await page.getByRole('button', {name: 'Reverse'}).click()
    await expectProbe(page, 'items', {hasChanges: false})
  })

  test('sends the changed array whole', async ({page}) => {
    await page.getByRole('button', {name: 'Remove a'}).click()
    await page.getByRole('button', {name: 'Save'}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {items: [{name: 'b'}, {name: 'c'}]}, status: 'pending'}])

    await control(page, 'save')

    await expectProbe(page, 'form', {hasChanges: false})
  })
})
