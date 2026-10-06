/**
 * The illustration on each Open Graph card, one per sidebar group: a small scene of what the group's components
 * render, drawn on a 200×200 grid. Fills come from classes the card template defines (`s`, `s2`, `s3` for white
 * surfaces, `ink`/`ink2` for content on them, `acc` and `ok` for accents), so the palette lives in one place.
 */
import type {Group} from '../docs/.vitepress/sidebar.ts'

import {readFileSync} from 'node:fs'
import path from 'node:path'

/** The logo's leaf as a flat shape: its shading paths (fixed black and white overlays) are dropped. */
export const LEAF = readFileSync(path.resolve(import.meta.dirname, '../docs/public/logo.svg'), 'utf8')
  .replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '')
  .replace(/<path[^>]*fill="#(000|fff)"[^>]*\/>/g, '')

const art = (body: string) => `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${ body }</svg>`

const check = (x: number, y: number, size: number, className = 'ln-w') =>
  `<path class="${ className }" d="M${ x } ${ y + size * 0.5 } l${ size * 0.35 } ${ size * 0.35 } l${ size * 0.65 } -${ size * 0.75 }"/>`

export const GROUP_ART: Record<Group, string> = {
  // A page of prose around a code block, with a bookmark.
  Guide: art(`
    <rect class="s3" x="22" y="26" width="132" height="164" rx="14" transform="rotate(-6 88 108)"/>
    <rect class="s" x="40" y="14" width="136" height="172" rx="14"/>
    <path class="acc" d="M146 14h16v34l-8-7-8 7z"/>
    <rect class="ink" x="58" y="34" width="72" height="12" rx="6"/>
    <rect class="ink2" x="58" y="58" width="100" height="7" rx="3.5"/>
    <rect class="ink2" x="58" y="72" width="80" height="7" rx="3.5"/>
    <rect class="ink" x="58" y="90" width="100" height="58" rx="9"/>
    <rect class="acc-l" x="68" y="102" width="22" height="7" rx="3.5"/>
    <rect class="s2" x="95" y="102" width="40" height="7" rx="3.5"/>
    <rect class="ok" x="78" y="116" width="34" height="7" rx="3.5"/>
    <rect class="s2" x="68" y="130" width="52" height="7" rx="3.5"/>
    <rect class="ink2" x="58" y="160" width="92" height="7" rx="3.5"/>
  `),

  // An app shell: header bar, nav bar and content cards.
  Layout: art(`
    <rect class="s3" x="12" y="22" width="176" height="156" rx="14"/>
    <path class="s2" d="M12 36a14 14 0 0 1 14-14h148a14 14 0 0 1 14 14v14H12z"/>
    <circle class="s" cx="28" cy="36" r="5"/>
    <rect class="s" x="140" y="31" width="34" height="10" rx="5"/>
    <path class="s" d="M12 50h44v128H26a14 14 0 0 1-14-14z"/>
    <rect class="acc" x="22" y="64" width="24" height="8" rx="4"/>
    <rect class="ink2" x="22" y="80" width="24" height="8" rx="4"/>
    <rect class="ink2" x="22" y="96" width="18" height="8" rx="4"/>
    <rect class="ink2" x="22" y="112" width="24" height="8" rx="4"/>
    <rect class="s" x="66" y="60" width="112" height="44" rx="9"/>
    <rect class="ink" x="78" y="72" width="50" height="8" rx="4"/>
    <rect class="ink2" x="78" y="86" width="80" height="6" rx="3"/>
    <rect class="s" x="66" y="112" width="52" height="56" rx="9"/>
    <rect class="s" x="126" y="112" width="52" height="56" rx="9"/>
    <rect class="acc" x="76" y="150" width="32" height="8" rx="4"/>
    <circle class="ok" cx="152" cy="140" r="14"/>
  `),

  // Buttons in three tones and a cursor pressing the primary one.
  Actions: art(`
    <rect class="ln-w2" x="26" y="30" width="118" height="38" rx="19"/>
    <rect class="s2" x="54" y="45" width="62" height="8" rx="4"/>
    <rect class="s" x="26" y="82" width="148" height="46" rx="23"/>
    <circle class="acc" cx="54" cy="105" r="9"/>
    <rect class="ink" x="72" y="100" width="76" height="10" rx="5"/>
    <circle class="s" cx="45" cy="161" r="19"/>
    <path class="ln-acc" d="M45 153v16M37 161h16"/>
    <rect class="s3" x="74" y="142" width="70" height="38" rx="19"/>
    <rect class="s2" x="90" y="157" width="38" height="8" rx="4"/>
    <path class="cursor" d="M150 108l0 38 10-9 7 15 7-3-7-15 13-1z"/>
  `),

  // A text input with a caret, a toggle, checkboxes and a slider.
  Controls: art(`
    <rect class="s" x="20" y="24" width="160" height="42" rx="11"/>
    <rect class="ink2" x="34" y="41" width="58" height="8" rx="4"/>
    <rect class="acc" x="98" y="34" width="3" height="22" rx="1.5"/>
    <rect class="s" x="20" y="86" width="68" height="36" rx="18"/>
    <circle class="acc" cx="70" cy="104" r="13"/>
    <rect class="s" x="104" y="86" width="36" height="36" rx="10"/>
    ${ check(112, 94, 20, 'ln-acc') }
    <rect class="ln-w2" x="148" y="88" width="32" height="32" rx="9"/>
    <rect class="s3" x="20" y="152" width="160" height="8" rx="4"/>
    <rect class="s" x="20" y="152" width="98" height="8" rx="4"/>
    <circle class="s" cx="118" cy="156" r="14"/>
    <circle class="acc" cx="118" cy="156" r="6"/>
  `),

  // An info card with an avatar and progress, chips, a counter badge and a loading skeleton.
  Display: art(`
    <rect class="s" x="18" y="22" width="164" height="92" rx="16"/>
    <circle class="acc" cx="50" cy="54" r="17"/>
    <rect class="ink" x="76" y="44" width="70" height="9" rx="4.5"/>
    <rect class="ink2" x="76" y="59" width="50" height="7" rx="3.5"/>
    <rect class="ink2" x="34" y="88" width="132" height="8" rx="4"/>
    <rect class="acc" x="34" y="88" width="88" height="8" rx="4"/>
    <rect class="ok" x="160" y="14" width="32" height="24" rx="12"/>
    <rect class="s" x="169" y="20" width="4" height="12" rx="2"/>
    <rect class="s" x="177" y="20" width="6" height="12" rx="3"/>
    <rect class="s" x="18" y="128" width="72" height="28" rx="14"/>
    <circle class="ok" cx="34" cy="142" r="5"/>
    <rect class="ink" x="45" y="138" width="34" height="8" rx="4"/>
    <rect class="s2" x="98" y="128" width="56" height="28" rx="14"/>
    <rect class="s3" x="18" y="170" width="120" height="10" rx="5"/>
    <rect class="s3" x="146" y="170" width="36" height="10" rx="5"/>
  `),

  // A list with a header and a selected row.
  Data: art(`<g transform="translate(4 -14)">
    <rect class="s3" x="22" y="26" width="148" height="14" rx="7"/>
    <rect class="s" x="12" y="40" width="168" height="148" rx="14"/>
    <rect class="ink" x="28" y="56" width="34" height="8" rx="4"/>
    <rect class="ink" x="80" y="56" width="40" height="8" rx="4"/>
    <rect class="ink" x="138" y="56" width="26" height="8" rx="4"/>
    <rect class="ink2" x="12" y="74" width="168" height="2"/>
    <rect class="ink2" x="28" y="88" width="14" height="14" rx="4"/>
    <rect class="ink2" x="52" y="91" width="56" height="8" rx="4"/>
    <rect class="ok" x="138" y="90" width="26" height="10" rx="5"/>
    <rect class="acc-bg" x="18" y="112" width="156" height="32" rx="9"/>
    <rect class="acc" x="28" y="121" width="14" height="14" rx="4"/>
    ${ check(31, 124, 8) }
    <rect class="ink" x="52" y="124" width="66" height="8" rx="4"/>
    <rect class="acc" x="138" y="123" width="26" height="10" rx="5"/>
    <rect class="ink2" x="28" y="154" width="14" height="14" rx="4"/>
    <rect class="ink2" x="52" y="157" width="46" height="8" rx="4"/>
    <rect class="ink2" x="138" y="156" width="26" height="10" rx="5"/>
  </g>`),

  // A modal over the page, with a notification toast below.
  Overlays: art(`
    <rect class="s3" x="12" y="14" width="150" height="124" rx="12"/>
    <rect class="s3" x="26" y="30" width="60" height="8" rx="4"/>
    <rect class="s3" x="26" y="46" width="100" height="6" rx="3"/>
    <rect class="shadow" x="40" y="60" width="148" height="104" rx="14"/>
    <rect class="s" x="40" y="54" width="148" height="104" rx="14"/>
    <rect class="ink" x="56" y="72" width="66" height="10" rx="5"/>
    <path class="ln-ink" d="M166 72l8 8M174 72l-8 8"/>
    <rect class="ink2" x="56" y="94" width="112" height="7" rx="3.5"/>
    <rect class="ink2" x="56" y="108" width="84" height="7" rx="3.5"/>
    <rect class="ln-ink2" x="84" y="128" width="40" height="18" rx="9"/>
    <rect class="acc" x="130" y="128" width="44" height="18" rx="9"/>
    <rect class="s" x="12" y="170" width="120" height="24" rx="12"/>
    <circle class="ok" cx="26" cy="182" r="6"/>
    <rect class="ink2" x="40" y="178" width="76" height="8" rx="4"/>
  `),

  // Braces around a few lines of code.
  Utilities: art(`
    <path class="ln-w-xl" d="M64 34c-18 0-14 22-14 40 0 14-8 26-20 26 12 0 20 12 20 26 0 18-4 40 14 40"/>
    <path class="ln-w-xl" d="M136 34c18 0 14 22 14 40 0 14 8 26 20 26-12 0-20 12-20 26 0 18 4 40-14 40"/>
    <rect class="s" x="76" y="74" width="48" height="12" rx="6"/>
    <rect class="ok" x="88" y="94" width="36" height="12" rx="6"/>
    <rect class="s2" x="76" y="114" width="28" height="12" rx="6"/>
  `),

  // A grid of glyph tiles, the kit's leaf in the middle.
  Assets: art(`
    <rect class="s3" x="18" y="18" width="50" height="50" rx="12"/><circle class="ln-w" cx="43" cy="43" r="11"/>
    <rect class="s3" x="75" y="18" width="50" height="50" rx="12"/><path class="ln-w" d="M100 32l12 21H88z"/>
    <rect class="s3" x="132" y="18" width="50" height="50" rx="12"/><path class="ln-w" d="M157 31v24M145 43h24"/>
    <rect class="s3" x="18" y="75" width="50" height="50" rx="12"/><rect class="ln-w" x="32" y="89" width="22" height="22" rx="6"/>
    <rect class="s" x="75" y="75" width="50" height="50" rx="12"/>
    <svg class="leaf" x="84" y="84" width="32" height="32" viewBox="0 0 24 24">${ LEAF }</svg>
    <rect class="s3" x="132" y="75" width="50" height="50" rx="12"/>${ check(146, 92, 22) }
    <rect class="s3" x="18" y="132" width="50" height="50" rx="12"/><path class="ln-w" d="M30 162l8-10 8 6 10-14"/>
    <rect class="s3" x="75" y="132" width="50" height="50" rx="12"/><path class="ln-w" d="M100 144l13 13-13 13-13-13z"/>
    <rect class="s3" x="132" y="132" width="50" height="50" rx="12"/><circle class="s" cx="146" cy="157" r="4"/><circle class="s" cx="157" cy="157" r="4"/><circle class="s" cx="168" cy="157" r="4"/>
  `),

  // Fanned cards: a form on top, with a done badge.
  Recipes: art(`
    <rect class="s3" x="30" y="34" width="124" height="150" rx="14" transform="rotate(-12 92 109)"/>
    <rect class="s2" x="38" y="28" width="124" height="150" rx="14" transform="rotate(-5 100 103)"/>
    <rect class="s" x="50" y="22" width="124" height="156" rx="14"/>
    <rect class="ink" x="66" y="40" width="58" height="10" rx="5"/>
    <rect class="ink2" x="66" y="62" width="34" height="6" rx="3"/>
    <rect class="ln-ink2" x="66" y="74" width="92" height="20" rx="6"/>
    <rect class="ink2" x="66" y="104" width="40" height="6" rx="3"/>
    <rect class="ln-ink2" x="66" y="116" width="92" height="20" rx="6"/>
    <rect class="acc" x="104" y="148" width="54" height="18" rx="9"/>
    <circle class="ok" cx="168" cy="30" r="20"/>
    ${ check(158, 21, 20) }
  `),
}

/** Fills and strokes the art's classes stand for; on the card they sit on the primary gradient tile. */
export const ART_STYLE = `
  .s { fill: white; }
  .s2 { fill: oklch(100% 0 0 / 0.55); }
  .s3 { fill: oklch(100% 0 0 / 0.22); }
  .ink { fill: oklch(30% 0.1 286.8); }
  .ink2 { fill: oklch(30% 0.1 286.8 / 0.22); }
  .acc { fill: oklch(55% 0.2 286.8); }
  .acc-l { fill: oklch(78% 0.12 286.8); }
  .acc-bg { fill: oklch(55% 0.2 286.8 / 0.12); }
  .leaf { color: oklch(55% 0.2 286.8); }
  .ok { fill: oklch(80% 0.15 165); }
  .shadow { fill: oklch(15% 0.1 286.8 / 0.35); filter: blur(8px); }
  .cursor { fill: white; stroke: oklch(30% 0.1 286.8); stroke-width: 4; stroke-linejoin: round; }
  [class^="ln-"] { fill: none; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
  .ln-w { stroke: white; }
  .ln-w2 { stroke: oklch(100% 0 0 / 0.6); stroke-width: 4; }
  .ln-w-xl { stroke: white; stroke-width: 12; }
  .ln-acc { stroke: oklch(55% 0.2 286.8); }
  .ln-ink { stroke: oklch(30% 0.1 286.8); stroke-width: 3.5; }
  .ln-ink2 { stroke: oklch(30% 0.1 286.8 / 0.25); stroke-width: 2.5; }
`
