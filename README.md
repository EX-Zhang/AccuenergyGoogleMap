# Accuenergy

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Modules Used

vue3-google-map

vxe-table

bootstrap

## Files Related

### src/main.js

import the modules bootstrap and VXETable

### src/App.vue

The main file includes the html elements, css and js script

### vite.config.js

Includes the proxies for CORS purpose

## How to use files generate with command "npm run build"

All the files should be run with a web server software like nginx.

The proxy should be setted like the file vite.config.js for the web server software.

