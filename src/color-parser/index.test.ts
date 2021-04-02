import { parseColor } from '.'

describe('hex', () => {
  test('6-digit hex', () => {
    expect(parseColor('#ff0000')).toEqual(['hex', 255, 0, 0, 1])
  })
  test('3-digit hex', () => {
    expect(parseColor('#f00')).toEqual(['hex', 255, 0, 0, 1])
  })

  test('4-digit hex with alpha', () => {
    expect(parseColor('#f00c')).toEqual(['hex', 255, 0, 0, 0.8])
  })
  test('8-digit hex with alpha', () => {
    expect(parseColor('#ff0000cc')).toEqual(['hex', 255, 0, 0, 0.8])
  })

  test('uppercase hex', () => {
    expect(parseColor('#FF0000')).toEqual(['hex', 255, 0, 0, 1])
  })
  test('mixed-case hex', () => {
    expect(parseColor('#Ff0000')).toEqual(['hex', 255, 0, 0, 1])
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
    expect(parseColor('   #ff0000')).toEqual(['hex', 255, 0, 0, 1])
  })
  test('6-digit hex with trailing spaces', () => {
    expect(parseColor('#ff0000    ')).toEqual(['hex', 255, 0, 0, 1])
  })
  test('6-digit hex with leading and trailing spaces', () => {
    expect(parseColor('   #ff0000    ')).toEqual(['hex', 255, 0, 0, 1])
  })

  test('6-digit hex with leading and trailing newlines', () => {
    expect(parseColor('\n#ff0000\n')).toEqual(['hex', 255, 0, 0, 1])
  })
  test('6-digit hex with leading and trailing newlines + carriage returns', () => {
    expect(parseColor('\r\n#ff0000\n\r')).toEqual(['hex', 255, 0, 0, 1])
  })
  test('6-digit hex with leading and trailing tabs', () => {
    expect(parseColor('\t#ff0000\t')).toEqual(['hex', 255, 0, 0, 1])
  })
  test('6-digit hex with leading and trailing mixed whitespace', () => {
    expect(parseColor('\n  \r\t  \t\n   #ff0000\n  \t  \r\n  \t   ')).toEqual([
      'hex',
      255,
      0,
      0,
      1
    ])
  })
})

describe('keywords', () => {
  test('red color keyword', () => {
    expect(parseColor('red')).toEqual(['keyword', 255, 0, 0, 1])
  })
  test('rebeccapurple color keyword', () => {
    expect(parseColor('rebeccapurple')).toEqual(['keyword', 102, 51, 153, 1])
  })
  test('transparent color keyword', () => {
    expect(parseColor('transparent')).toEqual(['keyword', 0, 0, 0, 0])
  })

  test('uppercase color keyword', () => {
    expect(parseColor('RED')).toEqual(['keyword', 255, 0, 0, 1])
  })
  test('uppercase transparent color keyword', () => {
    expect(parseColor('TRANSPARENT')).toEqual(['keyword', 0, 0, 0, 0])
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
        : ['127', '153', '64']
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
        expect(parseColor(testString)).toEqual([
          'rgb',
          127,
          153,
          64,
          hasAlpha ? 0.3 : 1
        ])
      })
    }

    if (hasAlpha) {
      runTest(true)
    }
    runTest(false)
  }

  test('rgb() with decimals', () => {
    expect(parseColor('rgb(30.7, 60.6, 41.2)')).toEqual(['rgb', 31, 61, 41, 1])
  })
  test('rgb() with decimals without leading digits', () => {
    expect(parseColor('rgb(.4, .4, .4)')).toEqual(['rgb', 0, 0, 0, 1])
  })
  test('rgb() with decimal percentages', () => {
    expect(parseColor('rgb(5.5%, 10.875%, 32.25%)')).toEqual([
      'rgb',
      14,
      28,
      82,
      1
    ])
  })
  test('rgb() percentages with multiple decimal points', () => {
    expect(parseColor('rgb(5..5%, 10....875%, 32...25%)')).toBe(null)
  })
  test('rgb() with negative percentages', () => {
    expect(parseColor('rgb(-5%, 10.875%, -32.25%)')).toEqual([
      'rgb',
      0,
      28,
      0,
      1
    ])
  })
  test('rgb() with unary-positive percentages', () => {
    expect(parseColor('rgb(+5%, 10.875%, +32.25%)')).toEqual([
      'rgb',
      13,
      28,
      82,
      1
    ])
  })
  test('rgb() with above-maximum numbers', () => {
    expect(parseColor('rgb(300, 170, 750)')).toEqual(['rgb', 255, 170, 255, 1])
  })
  test('rgb() with negative numbers', () => {
    expect(parseColor('rgb(-132, 170, -72)')).toEqual(['rgb', 0, 170, 0, 1])
  })
  test('rgb() with unary-positive numbers', () => {
    expect(parseColor('rgb(+132, +170, +73)')).toEqual(['rgb', 132, 170, 73, 1])
  })
  test('rgb() with unary-positive numbers and no spaces', () => {
    expect(parseColor('rgb(+132+170+73)')).toEqual(['rgb', 132, 170, 73, 1])
  })
  test('no-comma rgb() without any spaces', () => {
    expect(parseColor('rgb(.4.4.4)')).toEqual(['rgb', 0, 0, 0, 1])
  })
  test('rgb() with scientific notation', () => {
    expect(parseColor('rgb(30e+0, 57000e-3, 4.0e+1)')).toEqual([
      'rgb',
      30,
      57,
      40,
      1
    ])
  })
  test('rgb() with scientific notation percentages', () => {
    expect(parseColor('rgb(30e+0%, 57000e-3%, 4e+1%)')).toEqual([
      'rgb',
      77,
      145,
      102,
      1
    ])
  })
  test('rgb() with missing close-paren', () => {
    expect(parseColor('rgb(128, 192, 64')).toEqual(['rgb', 128, 192, 64, 1])
  })
  test('rgb() with extra spaces inside parentheses', () => {
    expect(parseColor('rgb(   132,    170, 73    )')).toEqual([
      'rgb',
      132,
      170,
      73,
      1
    ])
  })
  test('rgb() with spaces before commas', () => {
    expect(parseColor('rgb(132 , 170 , 73)')).toEqual(['rgb', 132, 170, 73, 1])
  })
  test('rgb() with commas but no spaces', () => {
    expect(parseColor('rgb(132,170,73)')).toEqual(['rgb', 132, 170, 73, 1])
  })
  test('rgb() with newlines', () => {
    expect(parseColor('rgb(\n132,\n170,\n73\n)')).toEqual([
      'rgb',
      132,
      170,
      73,
      1
    ])
  })
  test('rgb() with tabs', () => {
    expect(parseColor('rgb(\t132,\t170,\t73\t)')).toEqual([
      'rgb',
      132,
      170,
      73,
      1
    ])
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
    expect(parseColor('RGB(132, 170, 73)')).toEqual(['rgb', 132, 170, 73, 1])
  })
  test('RgB() in mixed case', () => {
    expect(parseColor('RgB(132, 170, 73)')).toEqual(['rgb', 132, 170, 73, 1])
  })
  test('rgba() with scientific notation alpha', () => {
    expect(parseColor('rgba(132, 170, 73, 5e-1)')).toEqual([
      'rgb',
      132,
      170,
      73,
      0.5
    ])
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
        expect(parseColor(testString)).toEqual([
          'hsl',
          50,
          80,
          35,
          hasAlpha ? 0.3 : 1
        ])
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
    expect(parseColor('hsl(750, 80%, 35%)')).toEqual(['hsl', 30, 80, 35, 1])
  })
  test('hsl() with a hue < -360', () => {
    expect(parseColor('hsl(-500, 80%, 35%)')).toEqual(['hsl', 220, 80, 35, 1])
  })
  test('hsl() with fractional hue', () => {
    expect(parseColor('hsl(30.51, 80%, 35%)')).toEqual([
      'hsl',
      30.51,
      80,
      35,
      1
    ])
  })
  test('hsl() with scientific notation hue', () => {
    expect(parseColor('hsl(3051e-2, 80%, 35%)')).toEqual([
      'hsl',
      30.51,
      80,
      35,
      1
    ])
  })
})

describe('hwb', () => {
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
        expect(parseColor(testString)).toEqual([
          'hwb',
          50,
          80,
          35,
          hasAlpha ? 0.3 : 1
        ])
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
    expect(parseColor('lab(50% 35 -20)')).toEqual(['lab', 50, 35, -20, 1])
  })
  test('lab() with alpha', () => {
    expect(parseColor('lab(50% 35 -20 / 0.5)')).toEqual([
      'lab',
      50,
      35,
      -20,
      0.5
    ])
  })
  test('lab() with lightness above 100', () => {
    expect(parseColor('lab(250% 35 -20)')).toEqual(['lab', 250, 35, -20, 1])
  })
  test('lab() with lightness below 0', () => {
    expect(parseColor('lab(-50% 35 -20)')).toEqual(['lab', 0, 35, -20, 1])
  })
  test('lab() with large a and b', () => {
    expect(parseColor('lab(50% 335 -2750)')).toEqual(['lab', 50, 335, -2750, 1])
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
    expect(parseColor('lch(50% 35 20)')).toEqual(['lch', 50, 35, 20, 1])
  })
  test('lch() with deg', () => {
    expect(parseColor('lch(50% 35 20deg)')).toEqual(['lch', 50, 35, 20, 1])
  })
  test('lch() with grad', () => {
    expect(parseColor('lch(50% 35 22.22grad)')).toEqual(['lch', 50, 35, 20, 1])
  })
  test('lch() with rad', () => {
    expect(parseColor('lch(50% 35 0.349rad)')).toEqual(['lch', 50, 35, 20, 1])
  })
  test('lch() with turn', () => {
    expect(parseColor('lch(50% 35 0.0556turn)')).toEqual(['lch', 50, 35, 20, 1])
  })
  test('lch() with alpha', () => {
    expect(parseColor('lch(50% 35 20 / 0.5)')).toEqual(['lch', 50, 35, 20, 0.5])
  })

  test('lch() with lightness above 100', () => {
    expect(parseColor('lch(250% 35 20)')).toEqual(['lch', 250, 35, 20, 1])
  })
  test('lch() with lightness below 0', () => {
    expect(parseColor('lch(-50% 35 20)')).toEqual(['lch', 0, 35, 20, 1])
  })

  test('lch() with large chroma', () => {
    expect(parseColor('lch(50% 350 20)')).toEqual(['lch', 50, 350, 20, 1])
  })
  test('lch() with chroma below 0', () => {
    expect(parseColor('lch(50% -50 20)')).toEqual(['lch', 50, 0, 20, 1])
  })
})

describe('device-cmyk', () => {
  test('device-cmyk() with percentages', () => {
    expect(parseColor('device-cmyk(70% 30% 25% 20%)')).toEqual([
      'device-cmyk',
      70,
      30,
      25,
      20,
      1,
      null
    ])
  })
  test('device-cmyk() with mixed percentages and decimals', () => {
    expect(parseColor('device-cmyk(70% 0.3 25% 0.2000)')).toEqual([
      'device-cmyk',
      70,
      30,
      25,
      20,
      1,
      null
    ])
  })
  test('device-cmyk() with alpha', () => {
    expect(parseColor('device-cmyk(70% 30% 25% 20% / 0.3)')).toEqual([
      'device-cmyk',
      70,
      30,
      25,
      20,
      0.3,
      null
    ])
  })
  test('device-cmyk() with out-of-range values', () => {
    expect(parseColor('device-cmyk(700% -30% 25% 20%)')).toEqual([
      'device-cmyk',
      100,
      0,
      25,
      20,
      1,
      null
    ])
  })
  test('device-cmyk() with fallback', () => {
    expect(
      parseColor('device-cmyk(70% 30% 25% 20% / 0.3, rgba(1, 0, 0, 0))')
    ).toEqual(['device-cmyk', 70, 30, 25, 20, 0.3, 'rgba(1, 0, 0, 0)'])
  })
})
