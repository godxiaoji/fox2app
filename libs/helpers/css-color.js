// PS：不会写比较骚的正则，这个虽然长，但是容易看懂
const hexaReg = /^#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3});?$/i
const rgbaReg = /^rgb[a]?[(][\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?|100%|[0-9]{1,2}%)[\s]*,[\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?|100%|[0-9]{1,2}%)[\s]*,[\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?|100%|[0-9]{1,2}%)[\s]*,?[\s]*(0?\.\d{1,2}|1|0|100%|[0-9]{1,2}%)?[)];?$/i
const hslaReg = /^hsl[a]?[(][\s]*(360|3[0-5][0-9]|[012]?[0-9][0-9]?)[\s]*,[\s]*(100%|[0-9]{1,2}%)[\s]*,[\s]*(100%|[0-9]{1,2}%)[\s]*,?[\s]*(0?\.\d{1,2}|1|0|100%|[0-9]{1,2}%)?[)];?$/i

/**
 * 是否hex/hexa
 * @param {string} color 
 * @returns boolean
 */
export function isHexa(color) {
  return hexaReg.test(color.trim())
}

/**
 * 是否rgb/rgba
 * @param {string} color 
 * @returns boolean
 */
export function isRgba(color) {
  return rgbaReg.test(color.trim())
}

/**
 * 是否hsl/hsla
 * @param {string} color 
 * @returns boolean
 */
export function isHsla(color) {
  return hslaReg.test(color.trim())
}

function _rgb2hsl(r, g, b) {

  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h
  let s
  let l = (max + min) / 2

  if (max == min) {
    h = s = 0 // achromatic
  } else {
    var d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360).toString(),
    s: Math.round(s * 100) + '%',
    l: Math.round(l * 100) + '%'
  }
}

function _number2hex(num, width) {
  num = Math.round(num * 255)

  var hex = "0123456789abcdef"
  var s = ""
  while (num) {
    s = hex.charAt(num % 16) + s
    num = Math.floor(num / 16)
  }
  if (typeof width === "undefined" || width <= s.length) {
    return s
  }
  var delta = width - s.length
  var padding = ""
  while (delta-- > 0) {
    padding += "0"
  }
  return padding + s
}

/**
 * Rgba结构对象
 */
class RgbaMap {
  constructor(r, g, b, a) {
    this.r = r
    this.g = g
    this.b = b
    this.setOpacity(a)
  }

  setOpacity(value) {
    let opacity = 1
    if (value != null && value !== '') {
      value = value.toString()
      if (value.indexOf('%') !== -1) {
        opacity = Math.round(parseInt(value) / 100)
      } else {
        opacity = parseFloat(value)
      }
    }
    this.a = opacity
  }

  toHsl() {
    const {
      h,
      s,
      l
    } = _rgb2hsl(this.r, this.g, this.b)

    return `hsl(${h},${s},${l})`
  }

  toHsla() {
    const {
      h,
      s,
      l
    } = _rgb2hsl(this.r, this.g, this.b)

    return `hsla(${h},${s},${l},${this.a})`
  }

  toHex() {
    let str = ((this.r << 16) | (this.g << 8) | this.b).toString(16)

    for (let i = 0, len = 6 - str.length; i < len; i++) {
      str = '0' + str
    }

    return '#' + str
  }

  toHexa() {
    return this.toHex() + _number2hex(this.a, 2)
  }

  toRgb() {
    return `rgb(${this.r},${this.g},${this.b})`
  }

  toRgba() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`
  }

  toString() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`
  }
}

/**
 * rgb/rgba色值转为rgba对象
 * @param {string} rgba rgb(255,0,0)/rgba(255,0,0,.5)
 * @returns RgbaMap
 */
export function rgba2Map(rgba) {
  if (!isRgba(rgba)) {
    throw new Error('It is not a valid rgb/rgba string')
  }

  function value2Binary(value) {
    if (value.indexOf('%') !== -1) {
      return Math.round(255 * parseInt(value) / 100)
    }
    return parseInt(value)
  }

  const matches = rgbaReg.exec(rgba.trim())
  window.console.log(matches)

  const rgbaMap = new RgbaMap(value2Binary(matches[1]), value2Binary(matches[2]), value2Binary(matches[3]), matches[4])

  return rgbaMap
}

/**
 * hex/hexa色值转为rgba对象
 * @param {string} hex #ff0000/#ff000080
 * @returns RgbaMap
 */
export function hexa2RgbaMap(hex) {
  if (!isHexa(hex)) {
    throw new Error('It is not a valid hex/hexa string')
  }
  let rH, gH, bH
  hex = hex.trim()

  if (hex.length === 4) {
    // #fff
    rH = hex.slice(1, 2) + hex.slice(1, 2)
    gH = hex.slice(2, 3) + hex.slice(2, 3)
    bH = hex.slice(3, 4) + hex.slice(3, 4)
  } else {
    rH = hex.slice(1, 3)
    gH = hex.slice(3, 5)
    bH = hex.slice(5, 7)
  }

  return new RgbaMap(parseInt("0x" + rH), parseInt("0x" + gH), parseInt("0x" + bH), 1)
}

/**
 * hsl/hsla色值转为rgba对象
 * @param {string} hsla hsl(0,100%,50%)/hsla(0,100%,50%,0.5)
 * @returns RgbaMap
 */
export function hsla2RgbaMap(hsla) {
  if (!isHsla(hsla)) {
    throw new Error('It is not a valid hsl/hsla string')
  }

  const matches = hslaReg.exec(hsla.trim())
  const h = parseInt(matches[1]) / 360

  let s
  if (matches[2].indexOf('%') !== -1) {
    s = parseInt(matches[2]) / 100
  } else {
    s = parseFloat(matches[2])
  }
  let l
  if (matches[3].indexOf('%') !== -1) {
    l = parseInt(matches[3]) / 100
  } else {
    l = parseFloat(matches[3])
  }

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r, g, b
  if (s == 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return new RgbaMap(r * 255, g * 255, b * 255, matches[4])
}

export function rgba2hexa(rgba) {
  return rgba2Map(rgba).toHexa()
}

export function rgba2hsla(rgba) {
  return rgba2Map(rgba).toHsla()
}

export function rgb2hex(rgb) {
  return rgba2Map(rgb).toHex()
}

export function rgb2hsl(rgb) {
  return rgba2Map(rgb).toHsl()
}

export function hexa2Rgba(hexa) {
  return hexa2RgbaMap(hexa).toRgba()
}

export function hexa2hsla(hexa) {
  return hexa2RgbaMap(hexa).toHsla()
}

export function hex2Rgb(hex) {
  return hexa2RgbaMap(hex).toRgb()
}

export function hex2hsl(hex) {
  return hexa2RgbaMap(hex).toHsl()
}

export function hsla2Rgba(hsla) {
  return hsla2RgbaMap(hsla).toRgba()
}

export function hsla2Hexa(hsla) {
  return hsla2RgbaMap(hsla).toHexa()
}

export function hsl2Rgb(hsl) {
  return hsla2RgbaMap(hsl).toRgb()
}

export function hsl2Hex(hsl) {
  return hsla2RgbaMap(hsl).toHex()
}
