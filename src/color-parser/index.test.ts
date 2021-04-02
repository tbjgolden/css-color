import { parseColor } from '.'

describe('hex', () => {
  test('6-digit hex', () => {
    expect(parseColor('#ff0000')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('3-digit hex', () => {
    expect(parseColor('#f00')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })

  test('4-digit hex with alpha', () => {
    expect(parseColor('#f00c')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 0.8
    })
  })
  test('8-digit hex with alpha', () => {
    expect(parseColor('#ff0000cc')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 0.8
    })
  })

  test('uppercase hex', () => {
    expect(parseColor('#FF0000')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('mixed-case hex', () => {
    expect(parseColor('#Ff0000')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })

  test('5-digit hex', () => {
    expect(parseColor('#ff000')).toBe(null)
  })
  test('hex with invalid character replaced', () => {
    expect(parseColor('#ffz000')).toBe(null)
  })
  test('hex with invalid character inserted', () => {
    expect(parseColor('#fffz000')).toBe(null)
  })
  test('hex with two hash marks', () => {
    expect(parseColor('##fff000')).toBe(null)
  })
  test('hex with no hash mark', () => {
    expect(parseColor('fff000')).toBe(null)
  })

  test('6-digit hex with leading spaces', () => {
    expect(parseColor('   #ff0000')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('6-digit hex with trailing spaces', () => {
    expect(parseColor('#ff0000    ')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('6-digit hex with leading and trailing spaces', () => {
    expect(parseColor('   #ff0000    ')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })

  test('6-digit hex with leading and trailing newlines', () => {
    expect(parseColor('\n#ff0000\n')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('6-digit hex with leading and trailing newlines + carriage returns', () => {
    expect(parseColor('\r\n#ff0000\n\r')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('6-digit hex with leading and trailing tabs', () => {
    expect(parseColor('\t#ff0000\t')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('6-digit hex with leading and trailing mixed whitespace', () => {
    expect(parseColor('\n  \r\t  \t\n   #ff0000\n  \t  \r\n  \t   ')).toEqual({
      type: 'hex',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
})

describe('keywords', () => {
  test('red color keyword', () => {
    expect(parseColor('red')).toEqual({
      type: 'keyword',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('rebeccapurple color keyword', () => {
    expect(parseColor('rebeccapurple')).toEqual({
      type: 'keyword',
      r: 102,
      g: 51,
      b: 153,
      alpha: 1
    })
  })
  test('transparent color keyword', () => {
    expect(parseColor('transparent')).toEqual({
      type: 'keyword',
      r: 0,
      g: 0,
      b: 0,
      alpha: 0
    })
  })

  test('uppercase color keyword', () => {
    expect(parseColor('RED')).toEqual({
      type: 'keyword',
      r: 255,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('uppercase transparent color keyword', () => {
    expect(parseColor('TRANSPARENT')).toEqual({
      type: 'keyword',
      r: 0,
      g: 0,
      b: 0,
      alpha: 0
    })
  })
})

describe('rgb', () => {
  const variants = [
    ['rgba()', 'rgb()'],
    ['with alpha', 'no alpha'],
    ['commas', 'no commas'],
    ['percentages', '0-255']
  ]

  const numPermutations = 2 ** variants.length
  for (let i = 0; i < numPermutations; i++) {
    const variantValues: boolean[] = []
    for (let j = 0; j < variants.length; j++) {
      const variantValue = ((i >> j) & 1) === 1
      variantValues.push(variantValue)
    }

    const [
      functionNameEndsInA,
      hasAlpha,
      hasCommas,
      usesPercentages
    ] = variantValues

    const runTest = (alphaIsPercentage: boolean) => {
      const channelValues: string = (usesPercentages
        ? ['50%', '60%', '25%']
        : ['128', '153', '64']
      ).join(hasCommas ? ', ' : ' ')

      const chosen = variants.map((options, index) =>
        variantValues[index] ? options[0] : options[1]
      )
      if (hasAlpha) {
        chosen.push(
          alphaIsPercentage ? 'alpha is a percentage' : 'alpha is a float'
        )
      }

      const testString = `rgb${
        functionNameEndsInA ? 'a' : ''
      }(${channelValues}${
        hasAlpha
          ? (hasCommas ? ', ' : ' / ') + (alphaIsPercentage ? '30%' : '0.3')
          : ''
      })`

      test(chosen.join(', '), () => {
        expect(parseColor(testString)).toEqual({
          type: 'rgb',
          r: 128,
          g: 153,
          b: 64,
          alpha: hasAlpha ? 0.3 : 1
        })
      })
    }

    if (hasAlpha) {
      runTest(true)
    }
    runTest(false)
  }

  test('rgb() with decimals', () => {
    expect(parseColor('rgb(30.7, 60.6, 41.2)')).toEqual({
      type: 'rgb',
      r: 31,
      g: 61,
      b: 41,
      alpha: 1
    })
  })
  test('rgb() with decimals without leading digits', () => {
    expect(parseColor('rgb(.4, .4, .4)')).toEqual({
      type: 'rgb',
      r: 0,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('rgb() with decimal percentages', () => {
    expect(parseColor('rgb(5.5%, 10.875%, 32.25%)')).toEqual({
      type: 'rgb',
      r: 14,
      g: 28,
      b: 82,
      alpha: 1
    })
  })
  test('rgb() percentages with multiple decimal points', () => {
    expect(parseColor('rgb(5..5%, 10....875%, 32...25%)')).toBe(null)
  })
  test('rgb() with negative percentages', () => {
    expect(parseColor('rgb(-5%, 10.875%, -32.25%)')).toEqual({
      type: 'rgb',
      r: 0,
      g: 28,
      b: 0,
      alpha: 1
    })
  })
  test('rgb() with unary-positive percentages', () => {
    expect(parseColor('rgb(+5%, 10.875%, +32.25%)')).toEqual({
      type: 'rgb',
      r: 13,
      g: 28,
      b: 82,
      alpha: 1
    })
  })
  test('rgb() with above-maximum numbers', () => {
    expect(parseColor('rgb(300, 170, 750)')).toEqual({
      type: 'rgb',
      r: 255,
      g: 170,
      b: 255,
      alpha: 1
    })
  })
  test('rgb() with negative numbers', () => {
    expect(parseColor('rgb(-132, 170, -72)')).toEqual({
      type: 'rgb',
      r: 0,
      g: 170,
      b: 0,
      alpha: 1
    })
  })
  test('rgb() with unary-positive numbers', () => {
    expect(parseColor('rgb(+132, +170, +73)')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 1
    })
  })
  test('rgb() with unary-positive numbers and no spaces', () => {
    expect(parseColor('rgb(+132+170+73)')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 1
    })
  })
  test('no-comma rgb() without any spaces', () => {
    expect(parseColor('rgb(.4.4.4)')).toEqual({
      type: 'rgb',
      r: 0,
      g: 0,
      b: 0,
      alpha: 1
    })
  })
  test('rgb() with scientific notation', () => {
    expect(parseColor('rgb(30e+0, 57000e-3, 4.0e+1)')).toEqual({
      type: 'rgb',
      r: 30,
      g: 57,
      b: 40,
      alpha: 1
    })
  })
  test('rgb() with scientific notation percentages', () => {
    expect(parseColor('rgb(30e+0%, 57000e-3%, 4e+1%)')).toEqual({
      type: 'rgb',
      r: 77,
      g: 145,
      b: 102,
      alpha: 1
    })
  })
  test('rgb() with missing close-paren', () => {
    expect(parseColor('rgb(128, 192, 64')).toEqual({
      type: 'rgb',
      r: 128,
      g: 192,
      b: 64,
      alpha: 1
    })
  })
  test('rgb() with extra spaces inside parentheses', () => {
    expect(parseColor('rgb(   132,    170, 73    )')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 1
    })
  })
  test('rgb() with spaces before commas', () => {
    expect(parseColor('rgb(132 , 170 , 73)')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 1
    })
  })
  test('rgb() with commas but no spaces', () => {
    expect(parseColor('rgb(132,170,73)')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 1
    })
  })
  test('rgb() with newlines', () => {
    expect(parseColor('rgb(\n132,\n170,\n73\n)')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 1
    })
  })
  test('rgb() with tabs', () => {
    expect(parseColor('rgb(\t132,\t170,\t73\t)')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 1
    })
  })
  test('rgba() with too many components', () => {
    expect(parseColor('rgba(132, 170, 73, 1, 0.5)')).toBe(null)
  })
  test('rgba() with not enough components', () => {
    expect(parseColor('rgba(132, 170)')).toBe(null)
  })
  test('rgb() with too many components', () => {
    expect(parseColor('rgb(132, 170, 73, 1, 0.5)')).toBe(null)
  })
  test('rgb() with not enough components', () => {
    expect(parseColor('rgb(132, 170)')).toBe(null)
  })
  test('rgb with no parentheses', () => {
    expect(parseColor('rgb 132, 170, 73')).toBe(null)
  })
  test('rgb with no parentheses or spaces', () => {
    expect(parseColor('rgb132,170,73')).toBe(null)
  })
  test('rgb () with space before opening parenthesis', () => {
    expect(parseColor('rgb (132, 170, 73)')).toBe(null)
  })
  test('rgb() with extra garbage after', () => {
    expect(parseColor('rgb(132, 170, 73)garbage')).toBe(null)
  })
  test('rgb() with mixed percentages/numbers', () => {
    expect(parseColor('rgb(5%, 50, 30%)')).toBe(null)
  })
  test('rgb() with an "e" where it should not be', () => {
    expect(parseColor('rgb(3e, 50, 30)')).toBe(null)
  })
  test('rgb() with extra letters after values', () => {
    expect(parseColor('rgb(3blah, 50, 30)')).toBe(null)
  })
  test('rgb() with mixed commas/no commas', () => {
    expect(parseColor('rgb(50 50, 30)')).toBe(null)
  })
  test('RGB() in uppercase', () => {
    expect(parseColor('RGB(132, 170, 73)')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 1
    })
  })
  test('RgB() in mixed case', () => {
    expect(parseColor('RgB(132, 170, 73)')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 1
    })
  })
  test('rgba() with scientific notation alpha', () => {
    expect(parseColor('rgba(132, 170, 73, 5e-1)')).toEqual({
      type: 'rgb',
      r: 132,
      g: 170,
      b: 73,
      alpha: 0.5
    })
  })
  test('rgb() with no commas and no slash before alpha', () => {
    expect(parseColor('rgb(132 170 73 0.5)')).toBe(null)
  })
  test('rgb() with all slashes', () => {
    expect(parseColor('rgb(132 / 170 / 73 / 0.5)')).toBe(null)
  })
})

describe('hsl', () => {
  const variants = [
    ['hsl()', 'hsla()'],
    ['no alpha', 'with alpha'],
    ['no commas', 'commas'],
    ['', 'deg', 'grad', 'rad', 'turn']
  ]

  const numPermutations = variants.reduce((prev, cur) => prev * cur.length, 1)

  for (let i = 0; i < numPermutations; i++) {
    const variantValues: Array<boolean | number> = []
    let variantRange = 1
    for (let j = 0; j < variants.length; j++) {
      const variantValue = Math.floor(i / variantRange) % variants[j].length
      if (variants[j].length === 2) {
        variantValues.push(variantValue === 0)
      } else {
        variantValues.push(variantValue)
      }
      variantRange *= variants[j].length
    }

    const vals = variantValues as [boolean, boolean, boolean, number]

    const [functionNameEndsInA, hasAlpha, hasCommas] = vals

    const runTest = (alphaIsPercentage: boolean) => {
      const chosen = variants.map(
        (options, index) => options[Number(vals[index])]
      )
      const hueUnit = chosen[chosen.length - 1] as
        | ''
        | 'deg'
        | 'grad'
        | 'rad'
        | 'turn'
      chosen[chosen.length - 1] =
        hueUnit === '' ? 'no hue unit' : `hue unit is ${hueUnit}`
      if (hasAlpha) {
        chosen.push(
          alphaIsPercentage ? 'alpha is a percentage' : 'alpha is a float'
        )
      }

      const hueUnitValues = {
        '': '50',
        'deg': '50deg',
        'grad': '55.5grad',
        'rad': '0.87266rad',
        'turn': '0.139turn'
      }

      const channelValues: string = [hueUnitValues[hueUnit], '80%', '35%'].join(
        hasCommas ? ', ' : ' '
      )

      const testString = `hsl${
        functionNameEndsInA ? 'a' : ''
      }(${channelValues}${
        hasAlpha
          ? (hasCommas ? ', ' : ' / ') + (alphaIsPercentage ? '30%' : '0.3')
          : ''
      })`

      test(chosen.join(', '), () => {
        expect(parseColor(testString)).toEqual({
          type: 'hsl',
          h: 50,
          s: 80,
          l: 35,
          alpha: hasAlpha ? 0.3 : 1
        })
      })
    }

    if (hasAlpha) {
      runTest(true)
    }
    runTest(false)
  }

  test('hsl() with hue as a percentage', () => {
    expect(parseColor('hsl(50%, 80%, 35%)')).toBe(null)
  })
  test('hsl() with saturation and lightness as floats', () => {
    expect(parseColor('hsl(50, 0.8, 0.35)')).toBe(null)
  })
  test('hsl() with a hue > 360', () => {
    expect(parseColor('hsl(750, 80%, 35%)')).toEqual({
      type: 'hsl',
      h: 30,
      s: 80,
      l: 35,
      alpha: 1
    })
  })
  test('hsl() with a hue < -360', () => {
    expect(parseColor('hsl(-500, 80%, 35%)')).toEqual({
      type: 'hsl',
      h: 220,
      s: 80,
      l: 35,
      alpha: 1
    })
  })
  test('hsl() with fractional hue', () => {
    expect(parseColor('hsl(30.51, 80%, 35%)')).toEqual({
      type: 'hsl',
      h: 31,
      s: 80,
      l: 35,
      alpha: 1
    })
  })
  test('hsl() with scientific notation hue', () => {
    expect(parseColor('hsl(3051e-2, 80%, 35%)')).toEqual({
      type: 'hsl',
      h: 31,
      s: 80,
      l: 35,
      alpha: 1
    })
  })
})

describe('hwb', () => {
  test('hwb() with invalid contents', () => {
    expect(parseColor('hwb(.., .., ..)')).toBe(null)
  })

  const variants = [
    ['with alpha', 'no alpha'],
    ['', 'deg', 'grad', 'rad', 'turn']
  ]

  const numPermutations = variants.reduce((prev, cur) => prev * cur.length, 1)

  for (let i = 0; i < numPermutations; i++) {
    const variantValues: Array<boolean | number> = []
    let variantRange = 1
    for (let j = 0; j < variants.length; j++) {
      const variantValue = Math.floor(i / variantRange) % variants[j].length
      if (variants[j].length === 2) {
        variantValues.push(variantValue === 1)
      } else {
        variantValues.push(variantValue)
      }
      variantRange *= variants[j].length
    }

    const hasAlpha = variantValues[0]

    const runTest = (alphaIsPercentage: boolean) => {
      const chosen = variants.map(
        (options, index) => options[Number(variantValues[index])]
      )
      const hueUnit = chosen[chosen.length - 1] as
        | ''
        | 'deg'
        | 'grad'
        | 'rad'
        | 'turn'
      chosen[chosen.length - 1] =
        hueUnit === '' ? 'no hue unit' : `hue unit is ${hueUnit}`
      if (hasAlpha) {
        chosen.push(
          alphaIsPercentage ? 'alpha is a percentage' : 'alpha is a float'
        )
      }

      const hueUnitValues = {
        '': '50',
        'deg': '50deg',
        'grad': '55.5grad',
        'rad': '0.87266rad',
        'turn': '0.139turn'
      }

      const channelValues: string = [hueUnitValues[hueUnit], '80%', '35%'].join(
        ' '
      )

      const testString = `hwb(${channelValues}${
        hasAlpha ? ' / ' + (alphaIsPercentage ? '30%' : '0.3') : ''
      })`

      test('hwb(), ' + chosen.join(', '), () => {
        expect(parseColor(testString)).toEqual({
          type: 'hwb',
          h: 50,
          w: 80,
          b: 35,
          alpha: hasAlpha ? 0.3 : 1
        })
      })
    }

    if (hasAlpha) {
      runTest(true)
    }
    runTest(false)
  }
})

describe('lab', () => {
  test('lab() with no alpha', () => {
    expect(parseColor('lab(50% 35 -20)')).toEqual({
      type: 'lab',
      l: 50,
      a: 35,
      b: -20,
      alpha: 1
    })
  })
  test('lab() with alpha', () => {
    expect(parseColor('lab(50% 35 -20 / 0.5)')).toEqual({
      type: 'lab',
      l: 50,
      a: 35,
      b: -20,
      alpha: 0.5
    })
  })
  test('lab() with lightness above 100', () => {
    expect(parseColor('lab(250% 35 -20)')).toEqual({
      type: 'lab',
      l: 250,
      a: 35,
      b: -20,
      alpha: 1
    })
  })
  test('lab() with lightness below 0', () => {
    expect(parseColor('lab(-50% 35 -20)')).toEqual({
      type: 'lab',
      l: 0,
      a: 35,
      b: -20,
      alpha: 1
    })
  })
  test('lab() with large a and b', () => {
    expect(parseColor('lab(50% 335 -2750)')).toEqual({
      type: 'lab',
      l: 50,
      a: 335,
      b: -2750,
      alpha: 1
    })
  })
  test('lab() with non-percentage lightness', () => {
    expect(parseColor('lab(50 35 -20)')).toBe(null)
  })
  test('lab() with percentage a and b', () => {
    expect(parseColor('lab(50% 33% -20%)')).toBe(null)
  })
})

describe('lch', () => {
  test('lch() with no hue unit', () => {
    expect(parseColor('lch(50% 35 20)')).toEqual({
      type: 'lch',
      l: 50,
      c: 35,
      h: 20,
      alpha: 1
    })
  })
  test('lch() with deg', () => {
    expect(parseColor('lch(50% 35 20deg)')).toEqual({
      type: 'lch',
      l: 50,
      c: 35,
      h: 20,
      alpha: 1
    })
  })
  test('lch() with grad', () => {
    expect(parseColor('lch(50% 35 22.22grad)')).toEqual({
      type: 'lch',
      l: 50,
      c: 35,
      h: 20,
      alpha: 1
    })
  })
  test('lch() with rad', () => {
    expect(parseColor('lch(50% 35 0.349rad)')).toEqual({
      type: 'lch',
      l: 50,
      c: 35,
      h: 20,
      alpha: 1
    })
  })
  test('lch() with turn', () => {
    expect(parseColor('lch(50% 35 0.0556turn)')).toEqual({
      type: 'lch',
      l: 50,
      c: 35,
      h: 20,
      alpha: 1
    })
  })
  test('lch() with alpha', () => {
    expect(parseColor('lch(50% 35 20 / 0.5)')).toEqual({
      type: 'lch',
      l: 50,
      c: 35,
      h: 20,
      alpha: 0.5
    })
  })

  test('lch() with lightness above 100', () => {
    expect(parseColor('lch(250% 35 20)')).toEqual({
      type: 'lch',
      l: 250,
      c: 35,
      h: 20,
      alpha: 1
    })
  })
  test('lch() with lightness below 0', () => {
    expect(parseColor('lch(-50% 35 20)')).toEqual({
      type: 'lch',
      l: 0,
      c: 35,
      h: 20,
      alpha: 1
    })
  })

  test('lch() with large chroma', () => {
    expect(parseColor('lch(50% 350 20)')).toEqual({
      type: 'lch',
      l: 50,
      c: 350,
      h: 20,
      alpha: 1
    })
  })
  test('lch() with chroma below 0', () => {
    expect(parseColor('lch(50% -50 20)')).toEqual({
      type: 'lch',
      l: 50,
      c: 0,
      h: 20,
      alpha: 1
    })
  })
})

describe('device-cmyk', () => {
  test('device-cmyk() with percentages', () => {
    expect(parseColor('device-cmyk(70% 30% 25% 20%)')).toEqual({
      type: 'device-cmyk',
      c: 70,
      m: 30,
      y: 25,
      k: 20,
      alpha: 1,
      fallback: null
    })
  })
  test('device-cmyk() with mixed percentages and decimals', () => {
    expect(parseColor('device-cmyk(70% 0.3 25% 0.2000)')).toEqual({
      type: 'device-cmyk',
      c: 70,
      m: 30,
      y: 25,
      k: 20,
      alpha: 1,
      fallback: null
    })
  })
  test('device-cmyk() with alpha', () => {
    expect(parseColor('device-cmyk(70% 30% 25% 20% / 0.3)')).toEqual({
      type: 'device-cmyk',
      c: 70,
      m: 30,
      y: 25,
      k: 20,
      alpha: 0.3,
      fallback: null
    })
  })
  test('device-cmyk() with out-of-range values', () => {
    expect(parseColor('device-cmyk(700% -30% 25% 20%)')).toEqual({
      type: 'device-cmyk',
      c: 100,
      m: 0,
      y: 25,
      k: 20,
      alpha: 1,
      fallback: null
    })
  })
  test('device-cmyk() with fallback', () => {
    expect(
      parseColor('device-cmyk(70% 30% 25% 20% / 0.3, rgba(1, 0, 0, 0))')
    ).toEqual({
      type: 'device-cmyk',
      c: 70,
      m: 30,
      y: 25,
      k: 20,
      alpha: 0.3,
      fallback: {
        type: 'rgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0
      }
    })
  })
})

describe('utility-functions', () => {
  test('percentageToRange255', () => {
    expect(percentageToRange255('-100%')).toBe(0)
    expect(percentageToRange255('0%')).toBe(0)
    expect(percentageToRange255('20%')).toBe(51)
    expect(percentageToRange255('100%')).toBe(255)
    expect(percentageToRange255('150%')).toBe(255)
  })
  test('percentageToNumber', () => {
    expect(percentageToNumber('-100%')).toBe(0)
    expect(percentageToNumber('0%')).toBe(0)
    expect(percentageToNumber('50%')).toBe(50)
    expect(percentageToNumber('100%')).toBe(100)
    expect(percentageToNumber('150%')).toBe(100)
  })
  test('percentageToDecimal', () => {
    expect(percentageToDecimal('-100%')).toBe(0)
    expect(percentageToDecimal('0%')).toBe(0)
    expect(percentageToDecimal('50%')).toBe(0.5)
    expect(percentageToDecimal('100%')).toBe(1)
    expect(percentageToDecimal('150%')).toBe(1)
  })
  test('decimalClamp', () => {
    expect(decimalClamp(-0.5)).toBe(0)
    expect(decimalClamp(-0)).toBe(0)
    expect(decimalClamp(0)).toBe(0)
    expect(decimalClamp(0.5)).toBe(0.5)
    expect(decimalClamp(1)).toBe(1)
    expect(decimalClamp(1.5)).toBe(1)
  })
})

export const percentageToRange255 = (percentage: string): number => {
  const unclamped = (Number(percentage.slice(0, -1)) * 255) / 100
  return unclamped <= 0 ? 0 : unclamped >= 255 ? 255 : unclamped
}

export const percentageToNumber = (percentage: string): number => {
  const unclamped = Number(percentage.slice(0, -1))
  return unclamped <= 0 ? 0 : unclamped >= 100 ? 100 : unclamped
}

export const percentageToDecimal = (percentage: string): number => {
  const unclamped = Number(percentage.slice(0, -1)) * 0.01
  return unclamped <= 0 ? 0 : unclamped >= 1 ? 1 : unclamped
}

export const decimalClamp = (float: number): number => {
  return float <= 0 ? 0 : float >= 1 ? 1 : float
}
