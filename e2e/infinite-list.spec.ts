import {type Locator, expect, test} from '@playwright/test'

let demo: Locator

test.beforeEach(async ({page}) => {
  await page.goto('./recipes/list-with-fields')

  // The demo box is the list's scroll container.
  demo = page.locator('.demo', {has: page.getByRole('list')})

  await demo.getByRole('listitem').first().waitFor()
  await demo.scrollIntoViewIfNeeded()
  await demo.hover()
})

test('reaches the last page on a fast scroll to the bottom', async ({page}) => {
  // The last of the 320 plants in docs/examples/recipes/plant-list/models/Plant.ts, on page 32.
  const lastPlant = demo.getByRole('listitem').filter({has: page.getByText('Sorrel 4', {exact: true})})

  // Wheeling on without waiting for pages to load.
  await expect(async () => {
    await page.mouse.wheel(0, 4000)
    await expect(lastPlant).toBeInViewport({timeout: 50})
  }).toPass({intervals: [16], timeout: 30_000})
})

test('loads the rows in view after a jump into the middle', async () => {
  await demo.evaluate(element => element.scrollTop = element.scrollHeight / 2)

  // Skeleton rows have no listitem role, so the rows in view are the loaded ones.
  await expect.poll(() => demo.evaluate(element => {
    const box = element.getBoundingClientRect()

    return [...element.querySelectorAll('[role="listitem"]')].filter(item => {
      const rect = item.getBoundingClientRect()

      return rect.bottom > box.top && rect.top < box.bottom
    }).length
  }), {timeout: 10_000}).toBeGreaterThan(5)
})
