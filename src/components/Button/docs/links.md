---
group: Actions
description: WLink and WLinkArrow text links, and WRouterLink that works with or without vue-router.
---

# Links

`WLink` is a link inside text, with an icon in a colored chip before it — a link icon by default, or `icon`. The text is `text` or the default slot. It is a router link with `to` and a plain link with `href`; `target` and `rel` go on the link either way. `semanticType` sets the color, primary by default.

`WLinkArrow` is a quiet "more" link with an arrow after the text, e.g. under a short list: `<WLinkArrow :to="{name: RouteName.PLANTS}" text="All plants" />`.

`WRouterLink` renders the app's `RouterLink` with `to`, and a plain `a` with `href` otherwise — also in an app without vue-router. The kit's links and buttons are built on it.

<!-- @example Button/Links -->

<DocsDemo name="Button/Links" />

```vue
<template>
  <p class="max-w-xl leading-relaxed">
    Each plant links to its
    <WLink
      href="https://en.wikipedia.org/wiki/Monstera_deliciosa"
      text="Monstera deliciosa"
      target="_blank"
      rel="noopener"
    />
    article. The
    <WLink
      href="https://www.rhs.org.uk/plants"
      target="_blank"
      rel="noopener"
      :semantic-type="SemanticType.INFO"
      :icon="markRaw(IconArchiveBook)"
    >
      RHS plant guide
    </WLink>
    explains how to care for it.
  </p>
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WLink from 'eco-vue-js/dist/components/Link/WLink.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
</script>
```

<!-- @example-end -->

## API

<!-- @api WLink -->

### WLink

```ts
import WLink from 'eco-vue-js/dist/components/Link/WLink.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | — | URL of the link, when there is no `to`. |
| `target` | `"_self" \| "_blank" \| "_parent" \| "_top"` | — | `target` attribute of the link. |
| `rel` | `string` | — | `rel` attribute of the link. |
| `text` | `string` | — | Text of the link. The default slot replaces it. |
| `semanticType` | `SemanticType` | `SemanticType.PRIMARY` | Color of the text and the icon's chip. |
| `icon` | `SVGComponent` | — | Icon before the text, in a chip. Defaults to a link icon. |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Text of the link, replacing `text`. |

<!-- @api-end -->

<!-- @api WLinkArrow -->

### WLinkArrow

```ts
import WLinkArrow from 'eco-vue-js/dist/components/Link/WLinkArrow.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Text of the link. The default slot replaces it. |
| `to` | `RouteLocationRaw` | **required** | Router location — renders a router link. Needs vue-router installed in the app. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Text of the link, replacing `text`. |

<!-- @api-end -->

<!-- @api WRouterLink -->

### WRouterLink

```ts
import WRouterLink from 'eco-vue-js/dist/components/RouterLink/WRouterLink.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | — | URL of a plain link, used when `to` is empty. |
| `to` | `RouteLocationRaw` | **required** | Router location — renders a router link. Needs vue-router installed in the app. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the link. |

<!-- @api-end -->
