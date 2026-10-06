/**
 * Renders a 1200×630 Open Graph card for every docs page into `<outDir>/og/`, after VitePress has built the site.
 * One card template is loaded once and refilled per page: the group chip, the page title, its description, its
 * address and the group's illustration (build/docs-og-art.ts) on a tile; the home page shows the leaf there. Locally the browser comes from the Playwright cache (`npx playwright-core install chromium`); on CI it is the
 * Google Chrome that GitHub's Ubuntu runners have preinstalled.
 */
import {chromium} from 'playwright-core'

import {readFileSync} from 'node:fs'
import {mkdir} from 'node:fs/promises'
import path from 'node:path'

import {ART_STYLE, GROUP_ART, LEAF} from './docs-og-art.ts'

export type OgCard = {
  /** The page path without base and extension, '' for the home page; the card is written to og/<path or index>.jpg. */
  path: string
  title: string
  description: string
  group?: string
}

const ROOT = path.resolve(import.meta.dirname, '..')

const read = (file: string) => readFileSync(path.join(ROOT, file))

const leaf = `<svg viewBox="0 0 24 24">${ LEAF }</svg>`

const font = (file: string) => `url(data:font/woff2;base64,${ read(file).toString('base64') }) format("woff2-variations")`

export const ogImagePath = (pagePath: string) => `og/${ pagePath.replace(/\/$/, '/index') || 'index' }.jpg`

const template = (host: string) => /* html */ `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face { font-family: MontSerrat; font-weight: 100 900; src: ${ font('docs/.vitepress/theme/fonts/montserrat-latin-wght-normal.woff2') }; }
  @font-face { font-family: RobotoMono; font-weight: 100 700; src: ${ font('docs/.vitepress/theme/fonts/roboto-mono-latin-wght-normal.woff2') }; }

  :root {
    --primary: oklch(55% 0.17 286.8);
    --primary-soft: oklch(72% 0.13 286.8);
    --bg: oklch(19% 0.045 286.8);
  }

  * { box-sizing: border-box; margin: 0; }

  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    position: relative;
    font-family: MontSerrat, sans-serif;
    color: white;
    background:
      radial-gradient(900px 600px at 105% -10%, oklch(55% 0.17 286.8 / 0.55), transparent 60%),
      radial-gradient(700px 500px at -10% 120%, oklch(45% 0.14 250 / 0.35), transparent 60%),
      var(--bg);
  }

  /* A faint dot grid, fading out towards the text. */
  .grid {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(oklch(100% 0 0 / 0.14) 1.5px, transparent 1.5px);
    background-size: 32px 32px;
    mask-image: linear-gradient(115deg, transparent 35%, black 85%);
  }

  /* The illustration tile, with two blank cards fanned out behind it. */
  .tile { position: absolute; right: 90px; top: 50%; translate: 0 -50%; width: 300px; height: 300px; }
  .tile i { position: absolute; inset: 0; border-radius: 64px; border: 1px solid oklch(100% 0 0 / 0.14); background: oklch(100% 0 0 / 0.04); }
  .tile i:nth-child(1) { rotate: -14deg; translate: -40px 10px; }
  .tile i:nth-child(2) { rotate: -6deg; translate: -18px 4px; background: oklch(100% 0 0 / 0.06); }

  .tile b {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border-radius: 64px;
    color: white;
    background: linear-gradient(145deg, oklch(66% 0.16 286.8), oklch(45% 0.18 286.8));
    box-shadow: 0 40px 80px oklch(10% 0.08 286.8 / 0.6), inset 0 1px 0 oklch(100% 0 0 / 0.35);
  }

  .tile svg { width: 230px; height: 230px; overflow: visible; }
  .tile svg[viewBox="0 0 24 24"] { width: 190px; height: 190px; }
  ${ ART_STYLE }

  .content {
    position: absolute;
    inset: 64px 72px;
    display: flex;
    flex-direction: column;
  }

  .brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 700; letter-spacing: -0.01em; }
  .brand svg { width: 44px; height: 44px; color: var(--primary-soft); }
  .home .brand svg { display: none; }
  .brand span { color: oklch(100% 0 0 / 0.5); font-weight: 500; }

  .main { margin-top: auto; margin-bottom: auto; max-width: 640px; }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 20px;
    border-radius: 999px;
    background: oklch(55% 0.17 286.8 / 0.25);
    border: 1px solid oklch(72% 0.13 286.8 / 0.4);
    color: oklch(88% 0.06 286.8);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  .chip:empty { display: none; }

  h1 { font-size: 88px; font-weight: 800; line-height: 1.02; letter-spacing: -0.035em; text-wrap: balance; }
  h1.long { font-size: 68px; }
  h1.longer { font-size: 56px; }
  h1.wrapped + p { -webkit-line-clamp: 2; }

  p {
    margin-top: 26px;
    font-size: 29px;
    line-height: 1.4;
    color: oklch(100% 0 0 / 0.7);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-wrap: pretty;
  }

  .url { font-family: RobotoMono, monospace; font-size: 22px; color: oklch(100% 0 0 / 0.45); }
  .url b { color: var(--primary-soft); font-weight: 500; }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="tile"><i></i><i></i><b></b></div>
  <div class="content">
    <div class="brand">${ leaf }EcoVue <span>UI Library</span></div>
    <div class="main">
      <div class="chip"></div>
      <h1></h1>
      <p></p>
    </div>
    <div class="url">${ host }<b></b></div>
  </div>
</body>
</html>`

export const renderOgImages = async (outDir: string, host: string, cards: OgCard[]) => {
  const browser = await chromium.launch(process.env.CI ? {channel: 'chrome'} : {})

  try {
    const page = await browser.newPage({viewport: {width: 1200, height: 630}})
    await page.setContent(template(host))
    await page.evaluate(() => document.fonts.ready)

    for (const card of cards) {
      await page.evaluate(({card, art}) => {
        document.body.classList.toggle('home', !card.path)
        document.querySelector('.chip')!.textContent = card.group ?? ''
        document.querySelector('.tile b')!.innerHTML = art

        const title = document.querySelector('h1')!
        title.textContent = card.title
        title.classList.toggle('long', card.title.length > 22)
        title.classList.toggle('longer', card.title.length > 36)
        // A title on two lines leaves room for two lines of description.
        title.classList.remove('wrapped')
        title.classList.toggle('wrapped', title.offsetHeight > parseFloat(getComputedStyle(title).fontSize) * 1.5)

        // A word joiner after each hyphen keeps names like `w-*` or eco-vue-js on one line.
        document.querySelector('p')!.textContent = card.description.replaceAll('-', '-\u2060')
        document.querySelector('.url b')!.textContent = card.path
      }, {card, art: (card.group && GROUP_ART[card.group as keyof typeof GROUP_ART]) || leaf})

      const file = path.join(outDir, ogImagePath(card.path))
      await mkdir(path.dirname(file), {recursive: true})
      // JPEG keeps the gradients at a fraction of PNG's size.
      await page.screenshot({path: file, type: 'jpeg', quality: 90})
    }
  } finally {
    await browser.close()
  }
}
