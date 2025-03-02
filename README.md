# eco-vue-js

## Development

### Local testing

1. Register the library globally:
    ```
    npm link
    ```
2. Run development build with HMR:
    ```
    npm ci
    npm run dev
    ```
3. Creates a symlink to the built library in project
    ```
    npm link eco-vue-js
    ```

### Updating the bundle

To automatically add imports for new components or icons added to the library, run the command
```
npm run write-imports
```
This will update the files in the `/imports` directory and add new exports to the `package.json` file.