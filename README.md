[![npm (scoped)](https://img.shields.io/npm/v/@lirx/mdi.svg)](https://www.npmjs.com/package/@lirx/mdi)
![npm](https://img.shields.io/npm/dm/@lirx/mdi.svg)
![NPM](https://img.shields.io/npm/l/@lirx/mdi.svg)
![npm type definitions](https://img.shields.io/npm/types/@lirx/mdi.svg)

## lirx/mdi

Generates icons from [MaterialDesign](https://github.com/Templarian/MaterialDesign) to [@lirx/dom](https://github.com/lirx-js/dom) components.

## 📦 Installation

```bash
yarn add @lirx/mdi
# or
npm install @lirx/mdi --save
```

This library supports:

- **common-js** (require): transpiled as es5, with .cjs extension, useful for old nodejs versions
- **module** (esm import): transpiled as esnext, with .mjs extension (requires node resolution for external packages)

In a **node** environment the library works immediately (no extra tooling required),
however, in a **browser** environment, you'll probably need to resolve external imports thought a bundler like
[snowpack](https://www.snowpack.dev/),
[rollup](https://rollupjs.org/guide/en/),
[webpack](https://webpack.js.org/),
etc...
or directly using [skypack](https://www.skypack.dev/):
[https://cdn.skypack.dev/@lirx/mdi](https://cdn.skypack.dev/@lirx/mdi)

## How to build icons

```shell
cd ./tools/icons-generator
npm run build
```

