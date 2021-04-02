# `css-color-l4`

[![npm version](https://img.shields.io/npm/v/css-color-l4.svg?style=flat-square)](https://www.npmjs.com/package/css-color-l4)
[![test coverage](https://img.shields.io/badge/dynamic/json?style=flat-square&color=brightgreen&label=coverage&query=%24.total.branches.pct&suffix=%25&url=https%3A%2F%2Funpkg.com%2Fcss-color-l4%2Fcoverage%2Fcoverage-summary.json)](https://www.npmjs.com/package/css-color-l4)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tbjgolden/css-color-l4/Release?style=flat-square)](https://github.com/tbjgolden/css-color-l4/actions?query=workflow%3ARelease)

> **CSS Color Module Level 4\-compliant color string parser**

(forked from adroitwhiz/css-color and translated to TypeScript)

`css-color-l4` is a CSS Color Module Level 4-compliant CSS color value parser.
It parses any color values defined in the CSS Color Module Level 4, and refuses
to parse any other values. This is to ensure complete consistency with, for
instance, web browsers. In comparison, most other JS color parsers both fail to
parse color values that browsers will accept.

Key points:

- this library is well tested around edge cases
- this library doesn't include any color conversion functionality

## Limitations

- The `color()` function syntax is currently not supported.
- `currentcolor` is currently not supported.
- System colors (i.e. like `VisitedText`) are currently not supported. (Named
  colors like `red` are supported)

## Usage

```js
const { parseColor } = require('css-color-l4')

const color = parseColor('hsl(3051e-2, 80%, 35%)')

/*
color = {
  type: 'hsl',
  h: 31,
  s: 80,
  l: 35,
  alpha: 1
}
*/
```

## Installation

```sh
npm install css-color-l4 --save
# yarn add css-color-l4
```

Alternatively, there are also client web builds available:

```html
<!-- window.CSSColor -->
<script src="https://unpkg.com/css-color-l4/dist/css-color-l4.umd.js"></script>
```

## Documentation

- [`Docs`](docs)
- [`API`](docs/api)

## License

MIT

<!-- Original starter readme: https://github.com/tbjgolden/create-typescript-react-library -->
