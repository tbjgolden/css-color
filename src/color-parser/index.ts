import colorNames from './color-names'

import {
  rgbParser,
  hslParser,
  hwbParser,
  labParser,
  lchParser,
  deviceCmykParser
} from './generated-parsers'

export type Hex = {
  type: 'hex'
  r: number
  g: number
  b: number
  alpha: number
}
export type RGB = {
  type: 'rgb'
  r: number
  g: number
  b: number
  alpha: number
}
export type Keyword = {
  type: 'keyword'
  r: number
  g: number
  b: number
  alpha: number
}
export type HSL = {
  type: 'hsl'
  h: number
  s: number
  l: number
  alpha: number
}
export type HWB = {
  type: 'hwb'
  h: number
  w: number
  b: number
  alpha: number
}
export type Lab = {
  type: 'lab'
  l: number
  a: number
  b: number
  alpha: number
}
export type LCH = {
  type: 'lch'
  l: number
  c: number
  h: number
  alpha: number
}
export type DeviceCMYK = {
  type: 'device-cmyk'
  c: number
  m: number
  y: number
  k: number
  alpha: number
  fallback: Result
}
export type Result =
  | Hex
  | RGB
  | Keyword
  | HSL
  | HWB
  | Lab
  | LCH
  | DeviceCMYK
  | null

export const parseColor = (colorString: string): Result => {
  const unroundedResult = parseColorWithoutRounding(colorString)
  if (unroundedResult === null) {
    return null
  } else {
    let ref: Result = unroundedResult
    while (ref && ref.type === 'device-cmyk') {
      ref.c = Math.round(ref.c)
      ref.m = Math.round(ref.m)
      ref.y = Math.round(ref.y)
      ref.k = Math.round(ref.k)
      ref = ref.fallback
    }
    if (ref !== null) {
      if (ref.type === 'hex' || ref.type === 'rgb' || ref.type === 'keyword') {
        ref.r = Math.round(ref.r)
        ref.g = Math.round(ref.g)
        ref.b = Math.round(ref.b)
      } else if (ref.type === 'hsl') {
        ref.h = Math.round(ref.h)
        ref.s = Math.round(ref.s)
        ref.l = Math.round(ref.l)
      } else if (ref.type === 'hwb') {
        ref.h = Math.round(ref.h)
        ref.w = Math.round(ref.w)
        ref.b = Math.round(ref.b)
      } else if (ref.type === 'lch') {
        ref.l = Math.round(ref.l)
        ref.c = Math.round(ref.c)
        ref.h = Math.round(ref.h)
      } else {
        // if (ref.type === 'lab') {
        ref.l = Math.round(ref.l)
        ref.a = Math.round(ref.a)
        ref.b = Math.round(ref.b)
      }
      ref.alpha = parseFloat(ref.alpha.toFixed(2))
    }
    return unroundedResult
  }
}

export const parseColorWithoutRounding = (colorString: string): Result => {
  const str = colorString.trim()

  // Hex
  if (/^#[0-9a-fA-F]+$/.test(str)) {
    // We need the above regex because parseInt ignores weird invalid characters when parsing hex
    const colorNum = parseInt(str.slice(1), 16)
    let r: number
    let g: number
    let b: number
    let alpha: number
    switch (str.length) {
      case 7:
        r = colorNum >> 16
        g = (colorNum >> 8) & 0xff
        b = colorNum & 0xff
        alpha = 255
        break

      case 4:
        r = colorNum >> 8
        r = (r << 4) | r

        g = (colorNum >> 4) & 0xf
        g = (g << 4) | g

        b = colorNum & 0xf
        b = (b << 4) | b

        alpha = 255
        break

      case 9:
        r = colorNum >>> 24
        g = (colorNum >>> 16) & 0xff
        b = (colorNum >>> 8) & 0xff
        alpha = colorNum & 0xff
        break

      case 5:
        r = colorNum >> 12
        r = (r << 4) | r

        g = (colorNum >> 8) & 0xf
        g = (g << 4) | g

        b = (colorNum >> 4) & 0xf
        b = (b << 4) | b

        alpha = colorNum & 0xf
        alpha = (alpha << 4) | alpha
        break

      default:
        return null
    }
    return {
      type: 'hex',
      r,
      g,
      b,
      alpha: alpha / 255
    }
  }

  let parseResult: RegExpExecArray
  let relMap: Record<string, number> = {}

  const parseDecimalOrPercentage = (val: string) => {
    if (val.charAt(val.length - 1) === '%') {
      return percentageToDecimal(val)
    } else {
      return decimalClamp(parseFloat(val))
    }
  }

  const parseAlphaValue = (pathOffset: number) => {
    if (parseResult[pathOffset + relMap['numberOrPercentage.percentage']]) {
      return percentageToDecimal(
        parseResult[pathOffset + relMap['numberOrPercentage.percentage']]
      )
    } else if (parseResult[pathOffset + relMap['numberOrPercentage.number']]) {
      return decimalClamp(
        Number(parseResult[pathOffset + relMap['numberOrPercentage.number']])
      )
    } else {
      return 1
    }
  }

  const parseHueValue = (hueOffset: number) => {
    let h: number
    if (parseResult[hueOffset + relMap['hue.angle']]) {
      const angleValue =
        parseResult[hueOffset + relMap['hue.angle'] + relMap['angle.value']]

      switch (
        parseResult[hueOffset + relMap['hue.angle'] + relMap['angle.unit']]
      ) {
        case 'deg':
          h = Number(angleValue)
          break
        case 'grad':
          h = Number(angleValue) * (360 / 400)
          break
        case 'rad':
          h = Number(angleValue) * (180 / Math.PI)
          break
        default:
          // case 'turn':
          h = Number(angleValue) * 360
          break
      }
    } else {
      h = Number(parseResult[hueOffset + relMap['hue.number']])
    }

    return ((h % 360) + 360) % 360
  }

  // Regex-based parsing
  const parenSyntax = /^(rgb|hsl|hwb|lab|lch|device-cmyk)/i.exec(str)
  if (parenSyntax) {
    switch (parenSyntax[1].toLowerCase()) {
      case 'rgb': {
        let innerParseResult = rgbParser.fastRegex.exec(str)
        if (innerParseResult === null)
          innerParseResult = rgbParser.regex.exec(str)
        if (innerParseResult === null) return null
        parseResult = innerParseResult
        relMap = rgbParser.relMap

        let r: number
        let g: number
        let b: number
        let pathStart: number

        if (parseResult[relMap['rgb.rgbPercentage']]) {
          pathStart = relMap['rgb.rgbPercentage']
          pathStart += parseResult[pathStart + relMap['rgbPercentage|commas']]
            ? relMap['rgbPercentage|commas']
            : relMap['rgbPercentage|spaces']
          r = percentageToRange255(
            parseResult[pathStart + relMap['rgbPercentage.red']]
          )
          g = percentageToRange255(
            parseResult[pathStart + relMap['rgbPercentage.green']]
          )
          b = percentageToRange255(
            parseResult[pathStart + relMap['rgbPercentage.blue']]
          )
        } else {
          // if (parseResult[relMap['rgb.rgbNumber']]) {
          pathStart = relMap['rgb.rgbNumber']
          pathStart += parseResult[pathStart + relMap['rgbNumber|commas']]
            ? relMap['rgbNumber|commas']
            : relMap['rgbNumber|spaces']
          r = floatToRange255(
            parseFloat(parseResult[pathStart + relMap['rgbNumber.red']])
          )
          g = floatToRange255(
            parseFloat(parseResult[pathStart + relMap['rgbNumber.green']])
          )
          b = floatToRange255(
            parseFloat(parseResult[pathStart + relMap['rgbNumber.blue']])
          )
        }

        const alpha = parseAlphaValue(pathStart + relMap['rgbNumber.alpha'])

        return {
          type: 'rgb',
          r,
          g,
          b,
          alpha
        }
      }

      case 'hsl': {
        let innerParseResult = hslParser.fastRegex.exec(str)
        if (innerParseResult === null)
          innerParseResult = hslParser.regex.exec(str)
        if (innerParseResult === null) return null
        parseResult = innerParseResult
        relMap = hslParser.relMap

        const pathStart = parseResult[relMap['hsl|commas']]
          ? relMap['hsl|commas']
          : relMap['hsl|spaces']
        const h = parseHueValue(pathStart + relMap['hsl.hue'])
        const s = percentageToNumber(
          parseResult[pathStart + relMap['hsl.saturation']]
        )
        const l = percentageToNumber(
          parseResult[pathStart + relMap['hsl.lightness']]
        )
        const alpha = parseAlphaValue(pathStart + relMap['hsl.alpha'])

        return {
          type: 'hsl',
          h,
          s,
          l,
          alpha
        }
      }

      case 'hwb': {
        let innerParseResult = hwbParser.fastRegex.exec(str)
        if (innerParseResult === null)
          innerParseResult = hwbParser.regex.exec(str)
        if (innerParseResult === null) return null
        parseResult = innerParseResult
        relMap = hwbParser.relMap

        const h = parseHueValue(relMap['hwb.hue'])
        const w = percentageToNumber(parseResult[relMap['hwb.whiteness']])
        const b = percentageToNumber(parseResult[relMap['hwb.blackness']])
        const alpha = parseAlphaValue(relMap['hwb.alpha'])

        return {
          type: 'hwb',
          h,
          w,
          b,
          alpha
        }
      }

      case 'lab': {
        let innerParseResult = labParser.fastRegex.exec(str)
        if (innerParseResult === null)
          innerParseResult = labParser.regex.exec(str)
        if (innerParseResult === null) return null
        parseResult = innerParseResult
        relMap = labParser.relMap

        // Don't clamp maximum lightness
        const l = Math.max(
          0,
          Number(parseResult[relMap['lab.lightness']].slice(0, -1))
        )
        const a = Number(parseResult[relMap['lab.a']])
        const b = Number(parseResult[relMap['lab.b']])
        const alpha = parseAlphaValue(relMap['lab.alpha'])

        return {
          type: 'lab',
          l,
          a,
          b,
          alpha
        }
      }

      case 'lch': {
        let innerParseResult = lchParser.fastRegex.exec(str)
        if (innerParseResult === null)
          innerParseResult = lchParser.regex.exec(str)
        if (innerParseResult === null) return null
        parseResult = innerParseResult
        relMap = lchParser.relMap

        const l = Math.max(
          0,
          Number(parseResult[relMap['lch.lightness']].slice(0, -1))
        )
        const c = Math.max(0, Number(parseResult[relMap['lch.chroma']]))
        const h = parseHueValue(relMap['lch.hue'])
        const alpha = parseAlphaValue(relMap['lch.alpha'])

        return {
          type: 'lch',
          l,
          c,
          h,
          alpha
        }
      }

      default: {
        // case 'device-cmyk': {
        let innerParseResult = deviceCmykParser.fastRegex.exec(str)
        if (innerParseResult === null)
          innerParseResult = deviceCmykParser.regex.exec(str)
        if (innerParseResult === null) return null
        parseResult = innerParseResult
        relMap = deviceCmykParser.relMap

        const c =
          parseDecimalOrPercentage(parseResult[relMap['deviceCmyk.c']]) * 100
        const m =
          parseDecimalOrPercentage(parseResult[relMap['deviceCmyk.m']]) * 100
        const y =
          parseDecimalOrPercentage(parseResult[relMap['deviceCmyk.y']]) * 100
        const k =
          parseDecimalOrPercentage(parseResult[relMap['deviceCmyk.k']]) * 100
        const alpha = parseAlphaValue(relMap['deviceCmyk.alpha'])
        const fallback = parseResult[relMap['deviceCmyk.fallback']] || null

        return {
          type: 'device-cmyk',
          c,
          m,
          y,
          k,
          alpha,
          fallback: fallback ? parseColor(fallback) : null
        }
      }
    }
  }

  // Color keyword parsing/lookup
  let colorKeywordValue = colorNames[str]
  if (!colorKeywordValue) colorKeywordValue = colorNames[str.toLowerCase()]
  if (colorKeywordValue) {
    return {
      type: 'keyword',
      r: colorKeywordValue[0],
      g: colorKeywordValue[1],
      b: colorKeywordValue[2],
      alpha: colorKeywordValue[3]
    }
  }

  return null
}

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

export const floatToRange255 = (float: number): number => {
  return float <= 0 ? 0 : float >= 255 ? 255 : float
}

export const decimalClamp = (float: number): number => {
  return float <= 0 ? 0 : float >= 1 ? 1 : float
}
