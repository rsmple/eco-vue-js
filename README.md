# ui-kit

UI-Kit is a design system project for [Whitespots](https://whitespots.io/) projects. It provides a consistent look and feel by defining a set of reusable Vue components and icons.


## Usage

### Installation

1. Create a `.npmrc` file in the root directory of your project:
    1) Open a text editor and create a new file.
    2) Save the file as `.npmrc` in the root directory of your project.

2. Add the following lines to the `.npmrc` file:
    ```
    @whitespots:registry=https://gitlab.com/api/v4/packages/npm/
    //gitlab.com/api/v4/packages/npm/:_authToken=<personal_access_token>
    ```
3. Replace `<personal_access_token>` with the actual personal access token:
    1) Go to https://gitlab.com/-/profile/personal_access_tokens.
    2) Create a new personal access token with a name of your choice.
    3) Set the expiration date to one year from the current date.
    4) Select the `read_api` and `read_registry` scopes.
    5) Copy the personal access token to the `.npmrc` file, replacing `<personal_access_token>`.

4. Install the library:
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