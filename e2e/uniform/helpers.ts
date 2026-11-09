import {type Locator, type Page, expect} from '@playwright/test'

/**
 * Opens a fixture from e2e/fixtures/uniform, with its options as query params: `{fullPayload: true, api: 'sync'}`.
 * Fixtures render after hydration, so this waits for the probe the fixture always has.
 */
export const openFixture = async (page: Page, name: string, params: Record<string, string | true> = {}, readyProbe = 'calls') => {
  const search = new URLSearchParams({name: `uniform/${ name }`})

  for (const [key, value] of Object.entries(params)) search.set(key, value === true ? '' : value)

  await page.goto(`./e2e/fixtures/?${ search }`)
  await page.locator(`#probe-${ readyProbe }`).waitFor({state: 'attached'})
}

/** Reads the JSON a StateProbe renders, such as the scope a field's slot got. */
export const readProbe = async <Value = Record<string, unknown>>(page: Page, name: string): Promise<Value> => {
  return JSON.parse(await page.locator(`#probe-${ name }`).textContent() ?? 'null') as Value
}

/** Polls a probe until it matches `expected`: an object or array partially, as `toMatchObject` does, anything else exactly. */
export const expectProbe = (page: Page, name: string, expected: unknown, timeout?: number) => {
  const poll = expect.poll(() => readProbe<unknown>(page, name), {timeout})

  return expected instanceof Object ? poll.toMatchObject(expected as Record<string, unknown>) : poll.toBe(expected)
}

/** Calls a control the fixture exposed on `window.fixture`, such as `save` to resolve the oldest pending API call. */
export const control = (page: Page, name: string, ...args: unknown[]) => page.evaluate(([fn, list]) => {
  const fixture = (window as unknown as {fixture: Record<string, (...args: unknown[]) => unknown>}).fixture

  return fixture[fn as string]!(...list as unknown[])
}, [name, args] as const)

export type ApiCall = {payload: unknown, status: 'pending' | 'resolved' | 'rejected'}

export const readCalls = (page: Page, probe = 'calls') => readProbe<ApiCall[]>(page, probe)

/** The text input of a field, by its title. Required fields have a ` *` after it. */
export const input = (page: Page | Locator, title: string): Locator => page.getByRole('textbox', {name: new RegExp(`^${ title }( \\*)?$`)})

/** The field around the control with the title, where its error and messages are shown. */
export const fieldOf = (page: Page, title: string): Locator => page.locator('.group\\/field').filter({has: page.locator('label', {hasText: new RegExp(`^\\s*${ title }(\\s*\\*)?\\s*$`)})})

/** One close button per notification shown. */
export const notificationCloseButtons = (page: Page): Locator => page.getByRole('button', {name: 'Close notification'})
