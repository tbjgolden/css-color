# Examples

## Basics

```js
parseColor((type, c1, c2, c3, a) => {
  // type === 'rgb';
  // c1 === 127;
  // c2 === 0;
  // c3 === 60;
  // a = 0.5;
}, 'rgba(127, 0, 60, 0.5)')

parseColor((type, c1, c2, c3, a) => {
  // type === 'hsl';
  // c1 === 180;
  // c2 === 50;
  // c3 === 25;
  // a = 0.75;
}, 'hsla(0.5turn 50% 25% 75%)')
```

## Constructing your own color classes

```js
class MyColor {
    constructor(red, green, blue, alpha) {...}
}

const instanceOfMyColor = parseColor((type, c1, c2, c3, a) => {
    if (type !== 'rgb') {
        // You could use a color conversion library here, or just throw an error
    } else {
        return new MyColor(c1, c2, c3, a);
    }
}, 'rgba(127, 0, 60, 0.5)');
```

If you're feeling fancy, you can bind the parser to a callback and create your
own "factory" function:

```js
class MyColor {
    constructor(red, green, blue, alpha) {...}
}

const colorFactory = parseColor.bind(null, (type, c1, c2, c3, a) => {
    if (type !== 'rgb') {
        // You could use a color conversion library here, or just throw an error
    } else {
        return new MyColor(c1, c2, c3, a);
    }
});

const color1 = colorFactory('rgba(127, 0, 60, 0.5)');
const color2 = colorFactory('#fc08dc');
// and so on...
```
