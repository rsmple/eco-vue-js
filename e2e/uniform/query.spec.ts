import {expect, test} from '@playwright/test'

import {control, expectProbe, fieldOf, input, openFixture, readCalls, readProbe} from './helpers'

/**
 * A form that loads its model with `useQueryFn`: e2e/fixtures/uniform/QueryForm.vue.
 * Each load waits for `load()`, and `setCache()` stands in for another view saving the item.
 */

const MONSTERA = {id: 1, name: 'Monstera', color: 'green', care: {note: 'Water weekly'}}
const CACTUS = {id: 2, name: 'Cactus', color: 'grey', care: {note: 'Rarely'}}

const openLoaded = async (page: Parameters<typeof openFixture>[0], params: Record<string, string | true> = {}) => {
  await openFixture(page, 'QueryForm', params)
  await control(page, 'load')
  await expectProbe(page, 'form', {skeleton: false, modelValue: MONSTERA})
}

test('shows skeletons until the model loads', async ({page}) => {
  await openFixture(page, 'QueryForm')

  await expectProbe(page, 'loads', [{id: 1, status: 'pending'}])
  await expectProbe(page, 'form', {skeleton: true})
  await expectProbe(page, 'name', {skeleton: true})
  await expectProbe(page, 'note', {skeleton: true})

  await control(page, 'load')

  await expectProbe(page, 'name', {skeleton: false, modelValue: 'Monstera', hasChanges: false})
  await expectProbe(page, 'form', {skeleton: false, modelValue: MONSTERA, modelValueInit: MONSTERA, hasChanges: false})
  await expect(input(page, 'Name')).toHaveValue('Monstera')
})

test.describe('a new value of the loaded item', () => {
  test.beforeEach(async ({page}) => {
    await openLoaded(page)
  })

  test('is taken by the fields without changes', async ({page}) => {
    await control(page, 'setCache', 1, {name: 'Swiss cheese plant', color: 'yellow'})

    await expectProbe(page, 'form', {hasChanges: false, modelValue: {...MONSTERA, name: 'Swiss cheese plant', color: 'yellow'}})
    await expect(input(page, 'Name')).toHaveValue('Swiss cheese plant')
  })

  test('keeps the changes not saved yet', async ({page}) => {
    await input(page, 'Name').fill('Big monstera')

    await control(page, 'setCache', 1, {name: 'Swiss cheese plant', color: 'yellow'})

    await expectProbe(page, 'color', {modelValue: 'yellow', hasChanges: false})
    await expectProbe(page, 'name', {modelValue: 'Big monstera', hasChanges: true})
    await expectProbe(page, 'form', {modelValueInit: {...MONSTERA, name: 'Swiss cheese plant', color: 'yellow'}})
  })

  test('keeps the changes of an inner form with its own copy', async ({page}) => {
    await input(page, 'Care note').fill('Mist daily')

    await control(page, 'setCache', 1, {color: 'yellow'})

    await expectProbe(page, 'color', {modelValue: 'yellow'})
    await expectProbe(page, 'note', {modelValue: 'Mist daily', hasChanges: true})
  })
})

test.describe('another item', () => {
  test.beforeEach(async ({page}) => {
    await openLoaded(page)
  })

  test('keeps the current model while it loads, then takes it whole and drops the changes', async ({page}) => {
    await input(page, 'Name').fill('Big monstera')

    await page.getByRole('button', {name: 'Item 2'}).click()

    await expectProbe(page, 'loads', [{id: 1, status: 'done'}, {id: 2, status: 'pending'}])
    await expectProbe(page, 'name', {modelValue: 'Big monstera'})

    await control(page, 'load')

    await expectProbe(page, 'form', {modelValue: CACTUS, modelValueInit: CACTUS, hasChanges: false})
    await expect(input(page, 'Name')).toHaveValue('Cactus')
  })

  test('drops the changes of an inner form with its own copy', async ({page}) => {
    await input(page, 'Care note').fill('Mist daily')

    await page.getByRole('button', {name: 'Item 2'}).click()
    await control(page, 'load')

    await expectProbe(page, 'note', {modelValue: 'Rarely', hasChanges: false})
  })

  test('drops the changes when switching to an item already loaded', async ({page}) => {
    await page.getByRole('button', {name: 'Item 2'}).click()
    await control(page, 'load')
    await expectProbe(page, 'name', {modelValue: 'Cactus'})

    await input(page, 'Name').fill('Big cactus')
    await page.getByRole('button', {name: 'Item 1'}).click()

    await expectProbe(page, 'form', {modelValue: MONSTERA, hasChanges: false})
  })
})

test.describe('saving', () => {
  test('saves the changed fields and takes the result', async ({page}) => {
    await openLoaded(page)

    await input(page, 'Name').fill('Big monstera')
    await page.getByRole('button', {name: 'Save', exact: true}).click()

    await expect.poll(() => readCalls(page)).toEqual([{payload: {name: 'Big monstera'}, status: 'pending'}])

    await control(page, 'save')

    await expectProbe(page, 'form', {hasChanges: false, modelValue: {...MONSTERA, name: 'Big monstera'}})
  })

  test('shows the saved message when the save updates the cache before it resolves', async ({page}) => {
    await openLoaded(page, {cacheUpdate: true})

    await input(page, 'Name').fill('Big monstera')
    await page.getByRole('button', {name: 'Save', exact: true}).click()

    // The cache already holds the saved value, so the field has no changes left by the time the save resolves.
    await expectProbe(page, 'name', {hasChanges: false})

    await control(page, 'save')

    await expect(fieldOf(page, 'Name').getByText('Saved')).toBeVisible()
    await expect(fieldOf(page, 'Color').getByText('Saved')).toHaveCount(0)
  })

  test('shows the saved message on an async field when the save updates the cache', async ({page}) => {
    await openLoaded(page, {cacheUpdate: true, async: true})

    await input(page, 'Color').fill('variegated')
    await input(page, 'Color').press('Enter')

    await expect.poll(() => readCalls(page)).toEqual([{payload: {color: 'variegated'}, status: 'pending'}])

    await control(page, 'save')

    await expect(fieldOf(page, 'Color').getByText('Saved')).toBeVisible()
    await expectProbe(page, 'color', {hasChanges: false, modelValue: 'variegated'})
  })

  test('saves an inner form with its own copy on its own', async ({page}) => {
    await openLoaded(page)

    await input(page, 'Care note').fill('Mist daily')

    await page.getByRole('button', {name: 'Save care'}).click()

    await expect.poll(() => readProbe(page, 'careCalls')).toEqual([{payload: {note: 'Mist daily'}, status: 'pending'}])
    expect(await readCalls(page)).toEqual([])
  })
})
