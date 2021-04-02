# Argument Order and Ranges

The parser function takes two arguments, a callback which is passed the parsed
color values as arguments and the color string to be parsed (this API is
designed to minimize garbage-collector pressure). It returns the callback's
return value.

If the color could not be successfully parsed, the callback will be called with
`null` as its only argument. Otherwise:

The first argument passed to the callback is the type of color, one of `rgb`,
`hex`, `keyword`, `hsl`, `hwb`, `lab`, `lch`, or `device-cmyk`.

The next 3 arguments (or 4 if the color is of type `device-cmyk`) are the color
channel values.

The red, green, and blue channel values (passed in that order for `rgb`, `hex`,
and `keyword`) are all numbers (though not necessarily integers--percentage
color values, for instance, usually don't map to integers) that range from 0
to 255.

The hue channel value, the first one passed for both `hsl` and `hwb` and the
last one passed for `lch`, is a number that ranges from 0 to 360.

The saturation, lightness, white, and black values (the next two arguments for
`hsl` and `hwb` respectively) are numbers that range from 0 to 100.

The `lab` lightness value (the first one passed) is a number that ranges from 0
to +Infinity.

The `lab` `a` and `b` values (the next two passed) are numbers that range from
-Infinity to +Infinity and center around 0.

The `lch` chroma value (the second one passed) is a number that ranges from 0 to
+Infinity.

The cyan, magenta, yellow, and black values for `device-cmyk` (passed in that
order) are numbers that range from 0 to 100.

The next argument after all 3 or 4 color channel values is the alpha value. It
ranges from 0 to 1.

For the `device-cmyk` color type, there will be one additional argument after
the alpha value: the fallback color. This is a string that represents an
unparsed CSS color. It can itself be parsed.
