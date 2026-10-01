# eco-vue-js

Docs, with live demos and a theme playground: https://rsmple.github.io/eco-vue-js/

For AI coding assistants, the docs of the installed version are in the package as Markdown: start at
`node_modules/eco-vue-js/docs/llms.txt`. The latest version's docs are also online as
[llms.txt](https://rsmple.github.io/eco-vue-js/llms.txt) and
[llms-full.txt](https://rsmple.github.io/eco-vue-js/llms-full.txt).

## Usage

### Installation
```
npm i eco-vue-js
```

### Tailwind configuration

Requires Tailwind CSS v4. Import the library's base after Tailwind itself in your CSS entry:
```css
@import "tailwindcss";
@import "eco-vue-js/tailwind-base/base.css";
```

It brings the theme (colors, sizes, breakpoints, animations), the `w-*` utilities and the variants with
it, and registers the library's components as a source, so no Tailwind configuration file is needed.

### Import components

Here's an example of how to import the WButton component:
```
import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
```

### Import icons

The icons in the library are functional Vue components generated from SVG files during build.

Here's an example of how to import an icon named IconCheck:
```
import IconCheck from 'eco-vue-js/dist/assets/icons/IconCheck'
```