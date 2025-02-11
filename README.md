# eco-vue-js

eco-vue-js is a design system project for [Whitespots](https://whitespots.io/) projects. It provides a consistent look and feel by defining a set of reusable Vue components and icons.


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
import IconCheck from 'eco-vue-js/dist/assets/icons/default/IconCheck'
```

## Development

### Local testing

1. Build library:
    ```
    npm i
    npm run build
    ```
2. Create a `.tgz` file and copy absolute path to it:
    ```
    npm pack
    ```
3. Install library from created `.tgz`
    ```
    npm i --save <absolute_path_to_file>
    ```

### Updating the bundle

To automatically add imports for new components or icons added to the library, run the command
```
npm run write-imports
```
This will update the files in the `/imports` directory and add new exports to the `package.json` file.