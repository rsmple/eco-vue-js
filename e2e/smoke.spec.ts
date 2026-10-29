import {expect, test} from '@playwright/test'

import path from 'node:path'

import {buildSidebar} from '../docs/.vitepress/sidebar.ts'

const pages = ['/', ...buildSidebar(path.resolve(import.meta.dirname, '..')).flatMap(group => group.items?.map(item => item.link!) ?? [])]

/** Pages with a known problem, expected to fail until it is fixed — the test turns red once the page passes. */
const KNOWN_ISSUES: Record<string, {reason: string, when?: (browserName: string) => boolean}> = {
  // Not the kit: Node ships newer CLDR data than the macOS system ICU. WebKit on Linux formats it as Node does.
  '/components/report-pages': {
    reason: 'dates are formatted "30 Sept" by Node\'s ICU on the server and "30 Sep" by WebKit\'s on macOS',
    when: browserName => browserName === 'webkit' && process.platform === 'darwin',
  },
}

for (const link of pages) {
  test(`${ link } renders and hydrates without errors`, async ({page, browserName}) => {
    const issue = KNOWN_ISSUES[link]
    test.fail(!!issue && (!issue.when || issue.when(browserName)), issue?.reason)

    // Hydration mismatches are reported as a console error in production builds.
    const errors: string[] = []
    page.on('console', message => message.type() === 'error' && errors.push(message.text()))
    page.on('pageerror', error => errors.push(error.message))

    await page.goto('.' + link, {waitUntil: 'networkidle'})

    await expect(page.getByText(/^Example not found:/)).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
