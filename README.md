# babel-plugin-transform-assets-import-to-string

> Babel plugin that transforms image assets import and requires to urls / cdn

[![npm][npm-badge]][npm-link]
[![Build Status][circle-badge]][circle-link]

## Table of Contents

* [About](#about)
* [Features](#features)
* [Requirements](#requirements)
* [Installation](#installation)
* [Usage](#usage)
  * [via babelrc](#via-babelrc)
  * [via Node API](#via-node-api)
* [Options](#options)
* [Examples](#examples)
  * [Basic URI Transformation](#basic-uri-transformation)
  * [File Copying with outputDir](#file-copying-with-outputdir)
  * [Path Preservation with preservePaths](#path-preservation-with-preservepaths)
  * [Disabling Hash](#disabling-hash)

## About

This [babel](https://babeljs.io/) plugin allows you to transform asset files into a string uri, allowing you to point your assets to CDN or other hosts, without needing to run your code through module bundlers.

This helps when doing _isomorphic_ / server-rendered applications.

```js
import image from '../path/assets/icon.svg';
const image1 = require('../path/assets/icon1.svg');

// to

const image = 'https://cdn.example.com/assets/icon.a1b2c3d4.svg';
const image1 = 'https://cdn.example.com/assets/icon1.e5f6g7h8.svg';

// Somewhere further down in your code:
//
// eg: JSX
// <img src={image} alt='' />
//
// eg: Other cases
// ajaxAsyncRequest(image)
```

See the spec for more [examples](https://github.com/yeojz/babel-plugin-transform-assets-import-to-string/blob/master/test/index.spec.ts).

## Features

- Transforms asset imports to CDN URLs with content hashing
- Supports both ES6 `import` and CommonJS `require()`
- Optional file copying to output directory during build
- Content-based hashing for cache busting (same content = same hash)
- Configurable file extensions and hash length
- Path structure preservation option
- TypeScript support

## Requirements

- Node.js 20 or higher
- Babel 7.20 or higher

## Installation

```
$> npm install babel-plugin-transform-assets-import-to-string --save-dev
```

This plugin requires `@babel/core` as a peer dependency. If you don't already have it installed:

```
$> npm install @babel/core --save-dev
```

## Usage

### via .babelrc

```json
{
  "plugins": [
    [
      "transform-assets-import-to-string",
      {
        "baseUri": "https://cdn.example.com/assets"
      }
    ]
  ]
}
```

### via Node API

```js
require('@babel/core').transform('code', {
  plugins: [
    [
      'transform-assets-import-to-string',
      {
        baseUri: 'https://cdn.example.com/assets'
      }
    ]
  ]
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUri` | `string` | `""` | URL prefix for transformed paths (e.g., `"https://cdn.example.com/assets"`) |
| `outputDir` | `string` | `undefined` | Directory to copy assets to during build. If not set, no files are copied. |
| `extensions` | `string[]` | `[".gif", ".jpeg", ".jpg", ".png", ".svg"]` | File extensions to transform. Leading `.` (dot) is required. |
| `hashLength` | `number` | `8` | Length of content hash in filename. Set to `0` to disable hashing. |
| `preservePaths` | `string` | `undefined` | Base path to strip while preserving directory structure. If not set, filenames are flattened. |

## Examples

### Basic URI Transformation

Transform imports to CDN URLs with content hashing:

```json
{
  "plugins": [
    [
      "transform-assets-import-to-string",
      {
        "baseUri": "https://cdn.example.com/assets"
      }
    ]
  ]
}
```

```js
// Input
import logo from './images/logo.svg';

// Output
const logo = 'https://cdn.example.com/assets/logo.a1b2c3d4.svg';
```

### File Copying with outputDir

Copy assets to a build directory during transformation:

```json
{
  "plugins": [
    [
      "transform-assets-import-to-string",
      {
        "baseUri": "https://cdn.example.com/assets",
        "outputDir": "./dist/assets"
      }
    ]
  ]
}
```

```js
// Input
import logo from './images/logo.svg';

// Output
const logo = 'https://cdn.example.com/assets/logo.a1b2c3d4.svg';
// File copied to: ./dist/assets/logo.a1b2c3d4.svg
```

### Path Preservation with preservePaths

Keep directory structure by specifying a base path to strip:

```json
{
  "plugins": [
    [
      "transform-assets-import-to-string",
      {
        "baseUri": "https://cdn.example.com",
        "outputDir": "./dist/static",
        "preservePaths": "src"
      }
    ]
  ]
}
```

```js
// Input (file at src/components/icons/logo.svg)
import logo from './icons/logo.svg';

// Output
const logo = 'https://cdn.example.com/components/icons/logo.a1b2c3d4.svg';
// File copied to: ./dist/static/components/icons/logo.a1b2c3d4.svg
```

Without `preservePaths`, all files are flattened to the root of `outputDir`.

### Disabling Hash

Use `hashLength: 0` to disable content hashing:

```json
{
  "plugins": [
    [
      "transform-assets-import-to-string",
      {
        "baseUri": "https://cdn.example.com/assets",
        "hashLength": 0
      }
    ]
  ]
}
```

```js
// Input
import logo from './images/logo.svg';

// Output
const logo = 'https://cdn.example.com/assets/logo.svg';
```

### Custom Extensions

Transform only specific file types:

```json
{
  "plugins": [
    [
      "transform-assets-import-to-string",
      {
        "baseUri": "https://cdn.example.com/assets",
        "extensions": [".svg", ".png"]
      }
    ]
  ]
}
```

## License

`babel-plugin-transform-assets-import-to-string` is [MIT licensed](./LICENSE)

[circle-badge]: https://img.shields.io/circleci/project/github/yeojz/babel-plugin-transform-assets-import-to-string/master.svg?style=flat-square
[circle-link]: https://circleci.com/gh/yeojz/babel-plugin-transform-assets-import-to-string
[npm-badge]: https://img.shields.io/npm/v/babel-plugin-transform-assets-import-to-string.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/babel-plugin-transform-assets-import-to-string
