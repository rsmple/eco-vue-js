# eco-vue-js

## Usage

### Installation
```
npm i eco-vue-js
```

### Tailwind configuration

1. Add the library's [Tailwind preset](https://tailwindcss.com/docs/presets) to your [Tailwind configuration file](https://tailwindcss.com/docs/content-configuration):
    ```
    import tailwindBase from 'eco-vue-js/tailwind-base'

    presets: [
      tailwindBase,
    ]
    ```

2. Add the following lines to the `content` section in your configuration file:
    ```
    content: [
      ...tailwindBase.content,
    ]
    ```

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