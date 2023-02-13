# ui-kit

UI-Kit is a design system project for [Whitespots](https://whitespots.io/) projects. It provides a consistent look and feel by defining a set of reusable Vue components and icons.


## Usage

### Installation
```
npm i @whitespots/ui-kit
```

The library should now be installed in your project.

Note: The personal access token is private and should not be committed with changes. You will need to create a new token after its expiration.

### Tailwind configuration

1. Add the following lines to the `content` section in your [Tailwind configuration file](https://tailwindcss.com/docs/content-configuration):
    ```
    content: [
      './node_modules/@whitespots/ui-kit/dist/components/**/*.vue.js}',
      './node_modules/@whitespots/ui-kit/dist/components/**/*.js}',
    ]
    ```
2. Add the library's [Tailwind preset](https://tailwindcss.com/docs/presets) to your configuration file:
    ```
    presets: [
      require('@whitespots/ui-kit/tailwind-base/index.cjs'),
    ]
    ```

### Import components

Here's an example of how to import the WButton component:
```
import WButton from '@whitespots/ui-kit/dist/components/Button/WButton.vue'
```

### Import icons

The icons in the library are functional Vue components generated from SVG files during build.

Here's an example of how to import an icon named IconCheck:
```
import IconCheck from '@whitespots/ui-kit/dist/assets/icons/default/IconCheck'
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