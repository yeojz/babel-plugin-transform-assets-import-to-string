# babel-plugin-transform-assets-import-to-string

[![Greenkeeper badge](https://badges.greenkeeper.io/yeojz/babel-plugin-transform-assets-import-to-string.svg)](https://greenkeeper.io/)
> Babel plugin that transforms image assets import and requires to urls / cdn

[![npm][npm-badge]][npm-link]
[![Build Status][circle-badge]][circle-link]

## Table of Contents

-   [About](#about)
-   [Installation](#installation)
-   [Usage](#usage)
    -   [via babelrc](#via-babelrc)
    -   [via Node API](#via-node-api)

## About

This [babel](https://babeljs.io/) plugin allows you to transform asset files into a string uri, allowing you to point your assets to CDN or other hosts, without needing to run your code through module bundlers.

This helps when doing _isomorphic_ / server-rendered applications.

```js
import image from '../path/assets/icon.svg';
const image1 = require('../path/assets/icon1.svg');

// to

const image = 'http://your.cdn.address/assets/icon.svg';
const image1 = 'http://your.cdn.address/assets/icon1.svg';

// Somewhere further down in your code:
//
// eg: JSX
// <img src={image} alt='' />
//
// eg: Other cases
// ajaxAsyncRequest(image)
```

See the spec for more [examples](https://github.com/yeojz/babel-plugin-transform-assets-import-to-string/blob/master/test/index.spec.js).

## Installation

```
$> npm install babel-plugin-transform-assets-import-to-string --save
```

## Usage

### via .babelrc
```json
{
  "plugins": [["transform-assets-import-to-string", {
    "baseDir": "/assets",
    "baseUri": "http://your.cdn.address"
  }]]
}
```

### via Node API

```js
require("babel-core").transform("code", {
  plugins: [["transform-assets-import-to-string", {
    "baseDir": "/assets",
    "baseUri": "http://your.cdn.address"
  }]]
});
```

By default, it will transform the following extensions: `.gif, .jpeg, .jpg, .png, .svg` if `extensions` option is not defined. To configure a custom list, just add the `extensions` array as an option.

__Note:__ leading `.` (dot) is required.

```json
{
  "plugins": [
    ["transform-assets-import-to-string", {
      "extensions": [".jpg", ".png"]
    }]
  ]
}
```

## License

`babel-plugin-transform-assets-import-to-string` is [MIT licensed](./LICENSE)

[circle-badge]: https://img.shields.io/circleci/project/github/yeojz/babel-plugin-transform-assets-import-to-string/master.svg?style=flat-square
[circle-link]: https://circleci.com/gh/yeojz/babel-plugin-transform-assets-import-to-string

[npm-badge]: https://img.shields.io/npm/v/babel-plugin-transform-assets-import-to-string.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/babel-plugin-transform-assets-import-to-string
