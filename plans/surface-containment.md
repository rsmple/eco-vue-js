# Surface containment

Living plan for letting a theme choose how content is contained — flat, card or glass — instead of the kit assuming the page and every block share one background. Builds on [color roles](color-roles.md): the scopes there are the mechanism, this adds the page/container split and shape tokens. Update the status table and the log as work lands; decisions go in [Decisions](#decisions) with a date.

| Phase | Status |
| --- | --- |
| 0. Spike | done — findings below; items 1–3 to settle before phase 1 |
| 1. Foundation in `tailwind-base` | not started |
| 2. Kit and playground | not started |
| 3. Consumers | not started |

## Goals

- A theme picks a layout style — `flat`, `card` or `glass` — and content blocks and app chrome follow without code changes in the app.
- Consistency: a small, fixed vocabulary of containers whose look comes from the theme only. Today every block picks its own radius, padding and border, and they drift; the migration replaces those choices instead of preserving them.
- Flat is the default, and releasing the foundation changes nothing until a consumer adopts the containers. Adopting them changes looks on purpose — see [Starting point](#starting-point-not-a-reference).
- Everything that paints an opaque background to cover content (sticky columns, list headers, soft tones mixed over the surface) keeps matching the container it sits in, in every style.
- Glass is a configuration of card, not a third code path.

Non-goals: the structure of the page layout (which bars exist, the grid of the main area), density, and the marketing pages of whitespots-io. How the bars look and where they sit within the layout style is in scope.

## Terms

There is no single standard name for the flat ↔ carded axis. Design systems model it as surface levels:

- Material 3: surface container roles `surfaceContainerLowest` … `surfaceContainerHighest`; cards come as elevated, filled and outlined.
- Atlassian: `elevation.surface`, `.raised`, `.overlay`, `.sunken`.
- Primer: `bgColor-default`, `-muted`, `-inset` (formerly `canvas-default`, `-subtle`, `-inset`).
- Fluent / Windows 11: Mica base with Layer surfaces; Acrylic for blur. Apple: materials, and Liquid Glass (2025).
- Common speech: "flat design" vs "card-based layout"; "glassmorphism" for translucent blurred cards.

Here: **layout style** (`flat | card | glass`) for the setting, **canvas** for the page background, **section** and **card** for the two container kinds below.

## Starting point, not a reference

The portal, auditor and the kit never had a container approach, so their blocks are not a design to reproduce. The [inventory](#inventory) shows the drift: four radii (`rounded-lg` to `-3xl`) for the same kind of block, padding from `p-3` to `p-6`, two border colors for one outline (`border-gray-100`, `border-line-subtle`), filled and outlined tiles side by side on one dashboard.

So the model is designed top-down, and the inventory is a review list, not a mapping table:

- Each existing block becomes a section, a card, a tone area (banners on `bg-tone-soft`), or nothing — and loses its own radius, padding, border and shadow classes. The tokens decide those.
- A block that fits none of the kinds is a question for the model, not a local exception: either the model gets a kind, or the block gets redesigned.
- The color diff harness lists the visible changes of a migration for review; it does not gate on zero.
- After the migration, an optional rule in the shipped eslint config flags container-like class combinations (radius + padding + background or border) outside the kit, as planned for raw palette classes in color roles.

## Model

### Canvas

A new role, the page background. Today `--role-surface` is documented as "Page and cards" — one value for both. `canvas` defaults to `surface`, so flat stays as is; a card theme sets it a step off (`gray-50` under white cards, or darker than the cards in dark mode). `body` paints `canvas`.

### Two container kinds

The measurements below show two different things consumers build, and they need different flat behavior:

| Kind | What it is | Flat | Card | Glass |
| --- | --- | --- | --- | --- |
| **section** (`surface-section`) | Page-level content area: a list page's list, a form, a settings group | nothing: no background, padding or radius | `surface`, padding, radius, line or shadow | translucent `surface` + blur, light edge, shadow |
| **card** (`surface-card`) | A block that is visible in every style: dashboard tiles, stat cards, report blocks | filled: one step off the surface (`surface-subtle`), as appsec's tiles are today | one step off what it sits on: `surface` on the canvas, `surface-subtle` inside a section | glass on the canvas, filled inside a glass section |

"One step off what it sits on" is a variable each scope sets: the canvas sets `--w-surface-step` to the card color, a section or card sets it to `surface-subtle`. A card in a card is filled, never a second glass layer.

Both are scopes in the color-roles sense: they paint their background and re-map `--w-surface` for their subtree, as `surface-muted` and `surface-raised` do already. That is what keeps sticky columns (`WListHeader.vue`, `ListItem.vue`, `WList.vue` paint `bg-surface`), soft tones (mixed over `--w-surface`) and on-colors right inside them, with no change to those components.

### Shape tokens

Set per theme, like the existing `w-*` sizes; all zero / none by default for sections.

| Token | Section | Card |
| --- | --- | --- |
| padding | `--w-section-padding` | `--w-card-padding` |
| radius | `--w-section-rounded` | `--w-card-rounded` |
| edge | `--w-section-border` (width; color is `line-subtle`) | `--w-card-border` |
| shadow | `--w-section-shadow` | `--w-card-shadow` |
| blur | `--w-section-blur` | `--w-card-blur` |

Filled vs outlined vs elevated cards (Material's three) become token choices: appsec has filled tiles (`bg-surface-subtle rounded-xl p-3`, WrtTile) and outlined ones (`bg-surface border-line-subtle rounded-xl`, StatTile) side by side today; a theme would pick one look for both.

On phones a section drops its radius and takes the page inset as padding, reaching the screen edges — what WInfoCard does on a page already.

### Frames

The kit already has a frame concept for overlays: `--w-frame-padding` and `w-frame-bleed` let tabs, info cards and embedded fields reach a modal's or dropdown's edges. A section is a frame on the page: it sets `--w-frame-padding` to its padding, so WTabs and WInfoCard bleed to its edges without new code.

Catch: WInfoCard and WTabs pick frame vs page behavior from `useOverlayFrame()` (an injection: modal, dropdown, sheet), and on a page they bleed by `--inner-margin` instead. Whether the padding is zero is a theme (CSS) fact the injection can't see. Proposed: express the page case in CSS too — the main area sets `--w-frame-padding` to the page inset on phones — so components use one CSS path and a section only overrides the variable. Settle in the spike.

### App chrome

WHeaderBar, WNavBar and WActionsBar are raised surfaces, and today they are locked to the flat look: docked to the screen edges, square, separated from the page by a shadow or nothing. In card and glass styles they become cards themselves:

| | Flat | Card | Glass |
| --- | --- | --- | --- |
| Position | docked to the screen edges | floating: a gap from the screen edges and from each other | floating |
| Shape | square, no edge | rounded on all sides, `line-subtle` edge, shadow | rounded, light edge, shadow |
| Background | `canvas` | `surface` (or `surface-raised` in dark mode) | translucent + blur — content scrolls under the header, the most natural glass element |

Tokens, separate from the section ones since chrome is a raised surface: `--w-chrome-gap`, `--w-chrome-rounded`, `--w-chrome-border`, `--w-chrome-shadow`, `--w-chrome-blur`. Flat sets the gap and radius to zero.

What the kit has to build on:

- `--left-margin` and `--right-margin` already offset WNavBar and WActionsBar from the screen edge, and `--w-left-inner` / `--w-right-inner` add them into the page insets — the gap can go through them.
- WHeaderBar has no top or side offset; it gets the gap on top and between the nav and the actions bar.
- `--w-top-inner` (sticky list headers, scroll offsets) is `--header-height` today; with a floating header it adds the gap.
- Content scrolling through the gap above a floating header: in glass that is the point; in card the header's fixed backing (the element sized by `--header-height-padding` today) paints `canvas` over the gap.
- The background of WNavBar and WActionsBar is painted by consumers today — appsec's `styles.css` has `.w-nav-bar { @apply bg-surface xl:shadow-none shadow-md }` and the same for the actions bar. That moves into the kit, or chrome can't follow the layout style.
- Phones: the nav is a drawer over a backdrop and the actions bar slides in; in card and glass they float as sheets with the gap. Whether the header stays docked on phones, where the gap costs height, is open.

### Glass

Glass needs two values where card has one:

- **paint** — the translucent color plus `backdrop-filter`, on the section or card itself;
- **effective `--w-surface`** — opaque: the paint mixed over the canvas (`color-mix` of the paint over a canvas reference color). Sticky parts, soft tones, on-colors and contrast checks use this one, since nothing can be mixed over or measured against a translucent color.

The canvas needs something to blur: a gradient from primary and the data hues, generated by the playground; aspm (`OrbitBackground`) and traio (`GeometricBackground`) have branded backgrounds on their login pages already.

Known risks, for the spike:

- Sticky columns over scrolling rows inside a glass section: the effective opaque color differs slightly from the blurred paint around it. Alternative: sticky parts take their own `backdrop-filter`; with the parent a backdrop root, they blur only the section's content — check engines.
- Cost of many blurred layers (a dashboard has ~12 tiles) on low-end hardware and while scrolling.
- Contrast: text on glass is checked against the effective color over the darkest and the lightest part of the canvas, not one value.
- Dark mode: glass over a near-black canvas barely reads; the generator likely lightens the paint or the edge there.

## Inventory

What exists, to plan the migration — not a target look (see [Starting point](#starting-point-not-a-reference)). Measured 2026-10-14 by scanning templates for class strings: every class string with a radius, padding ≥ 3 and a background, border or shadow counts as container-like (chips and buttons excluded by padding).

### The fleet

aspm (both fronts) and traio (both fronts) contain 2–3 `.vue` files each: they are branded shells over `@whitespots/portal` (appsec-portal-app) and `@whitespots/auditor`, adding a theme. So the code to migrate is appsec-portal-app, auditor and whitespots-io; the layout style gets **chosen** in the shells, per brand.

| Repo | Kit | `.vue` files | Container-like strings | Page background |
| --- | --- | --- | --- | --- |
| appsec-portal-app | 0.25.2 | 1123 | 78 in 55 files | `bg-surface` on `html` |
| auditor | 0.25.2 | 115 | 2 in 1 file | via portal styles |
| aspm, traio (shells) | 0.15.6 | 2–3 | — | `bg-default` / `bg-default-dark` on body; pre-roles |
| whitespots-io | 0.23.1 | 137 (+ 193 `.astro`) | 102 in 57 files | `bg-default` / `bg-default-dark` |

### appsec-portal-app

- **Page shell**: `MainView.vue` renders a bare `<main>` with page insets; route views render straight into it on the body background. No layout component sits between the shell and the content — the section boundary has to be added per view, or in a small number of view wrappers (`ProductViewWrapper` and similar).
- **Container-like strings**: by kind 37 background only, 18 background + border, 16 border only, 7 with shadow. Radius `rounded-xl` 34, `-2xl` 17, `-3xl` 15, `-lg` 9. Padding `p-4` 22, `p-6` 18, `px-4` 12, `p-3` 10, `p-3.5` 9.
- **Backgrounds**: `bg-surface-subtle` 14 (filled cards — DashboardCharts tiles), `bg-tone-soft` 13 (banners — stay as they are, they are tone areas, not containers), `bg-gray-50` 11 + `bg-gray-850` 4 (palette pairs the color-roles codemod left: `surface-subtle`), `bg-surface` 8 (outlined cards with `border-line-subtle` / `border-gray-100`).
- **Kit containers**: WInfoCard 92, WModalWrapper 62, WFieldWrapper 53, WList 27, WTabs 18, WPage 8, WExpansion 5.
- **Sticky**: 79 class strings, 15 of them paint `bg-surface` — they follow a section's re-mapped surface. One `backdrop-blur`.
- 41 components named like containers (`*Card`, `*Tile`, `*Panel`, `*Container`, …): InsightCard, StatTile, WrtTile, ScannerCard, AuditCard, LicenseCard, GlobalSettingsCard, … — the review list for "is this a section, a card, or neither".

### auditor

Almost flat: one modal with two `bg-surface-subtle rounded-3xl p-4` blocks. WInfoCard 10, WModalWrapper 4, WList 2. Migrates in an afternoon once appsec has settled the pattern.

### whitespots-io

- Already card-styled: outlined cards on a same-colored page — `bg-default dark:bg-gray-900` 28/23, `border-line-subtle` 27, `rounded-2xl` 46, `p-6` 29. Still palette pairs, not roles.
- Already glass in places: 13 strings with `backdrop-blur`, translucent `bg-default/40 dark:bg-gray-900/60`, sticky bars on `bg-default/70`.
- The store and inspector app (`engine/store/…`) is in scope; the marketing sections (`site/…`, `.astro`) are not.

### The kit itself

13 container-like strings, mostly docs examples. Real ones: WDatePicker (`bg-surface rounded-xl`), WInfoCardNegative, NotifyCard, TooltipContainer — overlays and notifications, which stay as they are (`surface-raised`). The kit has no page-level container component today.

## Rollout to consumers

- Foundation and kit ship with flat as default: no visual change, a minor release.
- appsec first: wrap the content area of each route view (or its wrapper) in a section, turn the filled and outlined tiles into cards, replace the leftover `bg-gray-50 dark:bg-gray-850` pairs, drop the nav and actions bar backgrounds from `styles.css`. Visible changes in flat are expected wherever a block had its own radius, padding or border; the color diff and screenshots list them for review.
- auditor next, same pattern.
- aspm and traio pick a layout style in their theme — blocked on their upgrade from 0.15.6 to the color roles (color-roles phase 5).
- whitespots-io's app part last; its outlined cards become `surface-card` with a border token.

## Phases

### 0. Spike

- [x] `canvas`, `surface-section`, `surface-card` and the tokens in a scratch copy of `roles.css`; check that flat gives 0 differences in the color diff harness (`build/color-roles/color-diff.ts`).
- [x] Card theme on the docs site: a list page, a form and the home gallery; sticky columns and the list header inside a section.
- [x] Glass: effective-surface derivation, sticky parts (opaque vs nested blur) in Chromium, Firefox and WebKit, native and lowered CSS; scroll cost of ~12 blurred tiles.
- [x] Frames: the CSS-only page frame (`--w-frame-padding` on the main area) for WInfoCard and WTabs, phones included.
- [x] Floating chrome in the docs layout: header, nav and actions bar with the gap; sticky list header and scroll offsets under a floating header; the gap above it in card and glass; nav drawer on phones.

#### Spike findings (2026-10-14)

Built on the `surface-containment` branch: `tailwind-base/css/surfaces.css` (canvas role, `surface-section`, `surface-card`, section / card / chrome tokens, chrome geometry on `.w-header-bar`, `.w-nav-bar`, `.w-actions-bar`), gap-aware `--w-left-inner` / `--w-right-inner` / `--w-top-inner` and a new `--w-header-inner` in `internal-classes.ts`, card and glass presets in the docs (`:root[data-layout]` in `style.css`), and the page `/spike/surfaces` (stat cards, a settings section with WInfoCard and WTabs, the plant list in a section). Screenshots in Chromium, Firefox and WebKit, desktop and phone, light and dark.

What holds:

- **Flat is unchanged.** Color diff of the docs, main vs the branch, 54 pages in light and dark: the only change is the header backing's border color (`currentColor` → `line-subtle`) on a border 0px wide, plus a port in an asset URL. Nothing visible.
- **One opacity token gives all three styles.** A container paints its base color at `--w-*-opacity` and re-maps `--w-surface` to `color-mix(base opacity%, canvas)`: 0 is flat (invisible, surface = canvas), 1 is card, 0.55 is glass. No style switch in code; presets are token sets. Nested containers are forced opaque, so the mix is always over the canvas and never chains.
- **Card style works as is**: white sections and stat cards on a canvas 0.035 L darker, floating header and nav with a 0.75rem gap, header title aligned with the content through the page insets. Soft tones (WInfoCard warning) and inputs follow the re-mapped surface.
- **Glass works in all three engines**, light and dark: translucent tiles and sections over a generated gradient (primary, fuchsia, teal radials, `background-attachment: fixed`), blur, a 1px edge. Dark needs the edge — without it sections dissolve.
- **Floating chrome from tokens**: `--w-chrome-float` (0/1) and `--w-chrome-gap` position the header backing, the nav, its toggle and the actions bar; the header's spread ring (`0 0 0 gap canvas`) hides content scrolling through the gap in card style, and is transparent in glass. `WInfiniteListWrapper` sticks at `--w-header-inner`, so the list header lands under a floating header.
- **The CSS-only frame mostly works**: a section sets `--w-frame-padding`; on phones it bleeds by `--inner-margin` and pads by it, which is what WInfoCard's page branch already assumes — WInfoCard reaches the section edges without a change.

What breaks — to solve before phase 1:

1. **List chrome assumes the page is the frame.** WList's sticky columns, their gutter masks (`w---left-inner` / `w---right-inner` absolute boxes beside them) and the stuck header backdrop are sized by the page insets. Inside a section they spill out of it: a white band from the screen edge across the canvas gap at the header row, over the nav card in WebKit, and over the floating header's ring when stuck. A section has to redefine the insets for its subtree, as `.w-modal-wrapper *` does — but on a page it needs **two** values the modal gets away with as one: the sticky offset (viewport → section content, page inset + section padding) and the gutter the mask covers (canvas from the screen edge, then section paint over the padding). Proposed: `--w-left-gutter` / `--w-right-gutter` for the masks, a two-stop mask background, `--w-width-inner` falling out of the redefined insets.
2. **Wide lists in a section.** A list wider than the section can't scroll inside it (`overflow-x: auto` makes the section the scroll container and the header stops sticking to the window); `overflow-x: clip` hides the overflow. Options: the section grows with the list (`min-width: 100%; width: max-content`) and the window scrolls, as today; or lists fit their section (columns hide) and the section never scrolls. Decide with 1.
3. **Glass and sticky columns don't mix.** Sticky cells paint the opaque effective color — clear stripes over the translucent section, as predicted. Blurring them likely doesn't help (not tried): inside a section with `backdrop-filter`, a backdrop root, they can't see the canvas. Workable: a section holding a list is opaque in every style (`--w-section-opacity: 1` set by the list or a `surface-section-solid` variant), and glass stays for chrome, tiles and sections without sticky parts. Since the canvas is a smooth gradient, sections may not need `backdrop-filter` at all — only the chrome does, where content scrolls under it; to compare side by side.
4. **WTabs inside a section on phones** adds its page inset (`sm-not:pl---inner-margin`) on top of the section's padding — the tab bar is indented twice. WTabs' page branch has to become the frame branch (`w-frame-bleed px-(--w-frame-padding)`), i.e. the page sets `--w-frame-padding` too, as the plan proposed.
5. **Consumers pad the header themselves** (`pl---nav-bar-width`, the docs' `pl-[calc(var(--left-margin)+var(--nav-bar-width))]`). With a gap that padding must come from `--w-left-inner`; in phase 1 the header should align its title with the content on its own and the consumer padding goes.
6. **JS still measures the docked header.** `InfiniteListHeaderHeight` (`getTopOffset`) and the wrapper's IntersectionObserver (`rootMargin`) use the header element's height, not `--w-header-inner`: off by twice the gap when floating. Harmless while the header doesn't grow (below), but scroll-to-top math is off.
7. **Opaque stripes in glass, beyond sticky columns**: the card list's striped rows on phones (`sm-not:even:bg-surface-subtle`) and the stuck toolbar are opaque over a translucent section. Same answer as 3.

Fixed after review (2026-10-14):

- **Closed nav left a line**: below xl the closed nav collapsed to 0fr, but a grid track can't shrink an edge, so the border stayed. WNavBar now opens and closes with a `clip-path` wipe instead of `grid-template-columns`: nothing is laid out narrower, the shadow is kept (the clip reaches 2rem past the box), and clipped parts take no clicks.
- **Page gutter**: sections reach into the gutter (`--w-page-bleed`, with `--w-section-padding` set to the gutter) so their edges line up with the bars and their content with the page; `w-page-bleed` does the same for a row of cards. Phones: the bars dock (gap 0) and sections span the screen, so the content has the same insets as in flat — no extra padding.
- **Header growth**: docked, the header grows over a stuck list toolbar (`headerPadding`) so two blurred bars read as one and rows blur under both. Floating, it keeps its height (`--w-chrome-float` cancels the padding) and the stuck toolbar paints the surface (`.w-infinite-list-header`). The growth was also what painted the white band over the gap when stuck.

To experiment with for 1 (the gutter masks): they exist because rows scrolled sideways would show beside the sticky columns. `overflow-x: clip` on the section keeps sticky working (it doesn't make a scroll container, unlike `hidden`/`auto`) but leaves nothing to scroll sideways, so it only fits lists that fit. JS-positioned columns lag behind scrolling. Untried: masks with a two-stop background (canvas to the section edge, section paint over the padding); a `clip-path` on rows driven by a scroll timeline (`animation-timeline: scroll(root inline)`) so the clip follows the scroll on the compositor — Chromium and Safari 26 only, Firefox behind a flag.

List clipping experiment (2026-10-14), on `/spike/surfaces` with the plant list scrolling with the page (`scroll-page`; the docs shell's `overflow-x: clip` is lifted on that page):

- **A page list is its own section.** A list that scrolls with the page (not in a modal, a scrolling element or `minHeight`) can't sit in a `surface-section`: the section is as wide as the frame and the rows scroll past it. WList paints the surface itself instead: a `.w-list-page-surface` behind the rows, sticky sideways and sized to the frame plus the section padding, with the section tokens. The list re-maps `--w-surface` like a section. Lists that don't scroll with the page sit entirely inside their container.
- **Clip, tried and dropped.** Rows and the stuck header clipped to the frame by a `clip-path` animated on `scroll(nearest inline)`, with a JS fallback in Firefox. It cut correctly in all three engines, but the clip edge visibly trails scrolling, in CSS and JS alike: Chromium doesn't run that animation on the compositor, while sticky positioning is.
- **Masks that paint what's behind them.** The masks stay, and so do the sticky columns' backgrounds. Instead of `bg-surface`, everything that hides rows in a page list (masks, sticky columns, the stuck header) paints `--w-page-backdrop` at `background-attachment: fixed`. That paint is the canvas color, the canvas picture (`--w-canvas-image`, a new token: glass themes put their gradient there, and `body` paints it fixed too), and the section's fill and edges as bands over the frame. Attached to the viewport, it lines up with the surface wherever the element is. The masks are sticky, so they keep step with scrolling. In glass the sticky columns, gutter and stuck toolbar now look like the surface, with no stripes, in Chromium, Firefox and WebKit, light and dark. Flat paints the same color as before.
- **Limits of the paint.** Blur isn't reproduced, which barely shows over a smooth canvas. `saturate()` can't be reproduced either, so the glass preset dropped it. The surface's shadow is drawn by a separate frame over the rows (`w-list-page-frame`), so the masks don't cover it: an outer shadow paints only outside the box. Fixed backgrounds aren't supported on iOS Safari, where they paint as scrolling. Fixed backgrounds may make Chromium scroll on the main thread: in sync, but possibly less smooth; not measured. In flat the gradients are all transparent but still fixed, so flat may pay that cost for nothing. Chromium moves a sticky column's layer without repainting it when rows above open or close, so its fixed backdrop stays where it was until the next scroll: WList flips a no-op `background-origin` on resize to repaint it.
- **The stuck header reaches the page header.** Floating, the stuck list header paints the backdrop in a `::before` over itself and up to the top of the screen. It goes under the header bar for that (z 5 instead of 20), so no rows show in the gap above it or around the header card's corners. Docked (flat) it stays clear and above the header bar, which grows behind it (`opacity: var(--w-chrome-float)` on the pseudo). Trade-off: while stuck, rows no longer blur by under the header card; to drop that, the pseudo would stop at the card's bottom edge.
- **Grain.** A noise tile layered into the glass canvas (`data-canvas="noise"` on the spike). Colors match: mean brightness of the sticky column vs the surface is 46.0 vs 45.7 in dark, 233.2 vs 233.1 in light. Grain doesn't fully match, because the surface blurs it and the copy can't. The sticky column carries about twice the grain of the surface in light (standard deviation 0.9 vs 0.45), and about the same in dark (1.7 vs 1.6). At 22% noise that barely shows. If a theme wants strong grain: draw it over the glass too (sections, cards and chrome paint the same fixed noise on top), so the copies match exactly and the blur still shows in the gradient.
- **Kit bug found: a scroll jump leaves the list header unstuck.** WInfiniteListWrapper learns it is stuck from an IntersectionObserver on a 0-height indicator. A jump from below the viewport to above it (scroll restoration, anchors, `scrollTo`) is "not intersecting" both times, so no callback fires and `isIntersecting` stays true. Flat has it too: the header bar doesn't grow. Gradual scrolling works.
- **The scroll range.** The page list carries the right inset as padding (`min-width: calc(100% + inset)`, a negative end margin), so the last column scrolls clear of the sticky menu column. The surface takes a negative end margin, because a sticky box stops at its container's content edge.
- **Page content beside a wide list.** Sticky page content (`sticky left---left-inner max-w---width-inner`) only holds if its parent is as wide as the list. In the portal it is: `<main>` is the item in a `1fr` grid track, which grows to the list's width. A sticky box stays inside its parent's box, not the grid area, so the grid itself isn't enough. The spike now copies that structure.
- **Phones.** In card and glass the page list runs to the screen edges (`--w-page-bleed` on the content): the section spans the screen and the cards pad themselves. Striped card rows are as see-through as the section (`--w-list-stripe`; opaque in flat, which paints no section). The stuck toolbar keeps 0.5rem under the docked header bar. The docked header bar keeps only its bottom edge. Flat is unchanged.
- **Nav items and the group dropdown follow the nav's rounding.** Floating, items keep 0.5rem off the nav's end (on the item: the nav's content has a fixed width), the nav pads 0.25rem top and bottom, and the hover pill's radius is the nav's less the inset (`--w-nav-item-rounded`), so the curves run parallel. The active marker becomes a pill inset from the edge. The group dropdown shares `.w-nav-bar` for its paint, which had also given it the fixed bar's height, top and radius (clipped items, square in flat): `.w-nav-bar-dropdown` resets those, and takes the nav's radius floating and `rounded-xl` docked, as before the spike. Flat is pixel-identical apart from that restored dropdown radius.
- **The floating nav's edge is an inset shadow, and the phone drawer is docked.** A border widened the nav past `--nav-bar-width` (its width is its content's), so the gap to the page was 2px narrower than the gap at the screen's right edge. On phones the drawer runs from the docked header to the bottom edge, flush with the screen, and keeps only the edge toward the page, as the header does; it stays glass.
- **The phone drawer runs to the screen's top, and the nav scrolls again.** Below `sm` the nav starts at the top, as docked, its content under the header. The clip-path wipe had dropped the nav's `grid`, which stretched its content to the nav's height: without it a consumer's `h-full overflow-y-auto` scroller had no height and a long nav could not scroll. Restored.
- **The page has a bottom inset.** The kit sets the page's left, right and top insets (`--w-left-inner`, `--w-right-inner`, `--w-header-inner`) but nothing at the bottom, so a section that ends the page ran into the screen's bottom edge while the bars keep `--w-chrome-gap` off it. `w-page-pb` pads the app's main area by the chrome gap: 0 docked, so flat and phones are unchanged. Consumers add it to their main area.
- **A floating nav can wrap its items.** `--w-nav-height: auto` (set by the docs' card and glass) makes the nav as tall as its items, capped at the chrome gap above the screen's bottom edge, past which they scroll; it lays its content out as a flex column so the consumer's scroller shrinks to the cap. Pinning items to the bottom needs the full height, the default. The room under the last item moved into the kit, on the scroller so it scrolls with the items: 1rem docked and in the phone drawer, 0.25rem floating to match the gap above the first item. Consumers drop their own `pb-4`. Flat is byte-identical.

### 1. Foundation in `tailwind-base`

- [ ] `canvas` role, `--w-surface-step`, section and card shape tokens, utilities; `body` on `canvas`.
- [ ] Chrome tokens; WHeaderBar, WNavBar and WActionsBar paint their own background and take the gap, radius, edge and blur from them. Flat: as today, on `canvas`.
- [ ] `--w-top-inner` and the page insets include the chrome gap.
- [ ] Role equivalence test extended: section and card in flat equal today's classes; re-mapped surface inside both.

### 2. Kit and playground

- [ ] Components for the two kinds, if utilities aren't enough (frame provide/inject, phone behavior): WSection, WCard — names to settle.
- [ ] Playground: a Layout group — style (flat / card / glass) and the shape tokens; presets with each style; glass generates the canvas gradient.
- [ ] Generator contrast checks against the effective surface for glass.
- [ ] Theming guide: layout styles, with the three side by side.

### 3. Consumers

- [ ] appsec-portal-app (see [Rollout](#rollout-to-consumers)).
- [ ] auditor.
- [ ] aspm, traio: choose a style per brand.
- [ ] whitespots-io app part.

## Decisions

- 2026-10-14: existing blocks in the kit, portal and auditor are not a reference. The migration maps them onto the container kinds and drops their own shape classes; visible changes are reviewed, not avoided.
- 2026-10-14: app chrome (header, nav, actions bar) follows the layout style — docked in flat, floating cards in card and glass.

Open:

- Names: `canvas`, `section`, `card`, "layout style", `chrome`.
- Utilities only, or WSection / WCard components (a component can provide the frame and handle phones).
- ~~Whether a WList on a list page is its own section, or sits in one~~ — its own section: a page list paints the section surface itself; a contained list sits entirely inside its container.
- One card look, or a filled / outlined variant kept for cards inside sections.
- ~~Floating chrome on phones~~ — spike: docked on phones (gap 0 in the presets), sections span the screen.

## Log

- 2026-10-14: plan written; consumers measured (Inventory).
- 2026-10-14: consistency over preservation; app chrome added to the model.
- 2026-10-14: spike on the `surface-containment` branch — flat unchanged, card and glass render in three engines; list chrome inside sections, wide lists and glass sticky columns are the open problems (Spike findings). Not measured yet: scroll cost of blurred tiles, nav drawer on phones.
- 2026-10-14: WNavBar opens with a `clip-path` wipe. Page lists paint their own section surface. Clipping rows with a scroll timeline lagged and was dropped. Masks and sticky columns paint the viewport-fixed backdrop instead.
- 2026-10-14: stuck list header paints the backdrop up to the page header when floating; grain tested on the glass canvas; scroll-jump bug in the list header observer found.
