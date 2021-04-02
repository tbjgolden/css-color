# Development

At the core of the parser is a set of very large regexes, which is automatically
generated from the grammar in `src/generator.js`. In order to rerun this
generation after changing the grammar, use:

```bash
node src/generator.js
```

Benchmarks can be run using:

```bash
npm run benchmark

# To run a specific benchmark
npm run benchmark -- <hex, rgb, hsl, hwb, keywords>
```

Note that as many other parsers are much more limited in what they can parse
(and parse failures are often much faster), the results should be taken with a
grain of salt.
