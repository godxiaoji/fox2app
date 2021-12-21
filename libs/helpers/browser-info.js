let browser = ''
let system = ''
let device = ''
let browserVersion = ''

let ua = navigator.userAgent
let pf = navigator.platform

const winMap = {
  'windows nt 5.0': 'Win2000',
  'windows 2000': 'Win2000',
  'windows nt 5.1': 'WinXP',
  'windows xp': 'WinXP',
  'windows nt 5.2': 'Win2003',
  'windows 2003': 'Win2003',
  'windows nt 6.0': 'WinVista',
  'windows vista': 'WinVista',
  'windows nt 6.1': 'Win7',
  'windows 7': 'Win7',
  'windows nt 6.2': 'Win8',
  'windows 8': 'Win8',
  'windows nt 6.3': 'Win8.1',
  'windows 8.1': 'Win8.1',
  'windows nt 10.0': 'Win10',
  'windows 10.0': 'Win10'
}

const linuxMap = {
  android: 'Android',
  linux: 'Linux'
}

const tridentMap = {
  '4.0': 8,
  '5.0': 9,
  '6.0': 10,
  '7.0': 11
}

const systemMap = {
  win32: winMap,
  windows: winMap,
  ipad: 'iOS',
  iphone: 'iOS',
  macintosh: 'macOS',
  macIntel: 'macOS',
  mac: 'macOS',
  x11: 'Unix',
  linux: linuxMap
}

function setDeviceInfo() {
  let lua = ua.toLowerCase()
  let lpf = pf.toLowerCase()

  for (let i in systemMap) {
    if (lpf.indexOf(i) > -1) {
      if (typeof systemMap[i] === 'object') {
        for (let j in systemMap[i]) {
          if (lua.indexOf(j) > -1) {
            system = systemMap[i][j]
          }
        }
      } else {
        system = systemMap[i]
      }
    }
  }

  let matches
  if (system.indexOf('Win') === 0) {
    device = 'Win'
  } else if (system === 'macOS') {
    device = 'Mac'
  } else if (system === 'iOS') {
    if ((matches = /iPad|iPhone|iPod/.exec(lua))) {
      device = matches[0]
    } else {
      device = 'iPhone'
    }
  } else if (system === 'Android') {
    device = system
  }

  if ((matches = /(micromessenger)[/]([\w.]+)/i.exec(lua))) {
    // 微信内置浏览器
    browser = matches[1]
    browserVersion = parseInt(matches[2]).toString()
  } else if (device === 'Win') {
    // 在window系统下
    if ((matches = /(trident)[/]([\w.]+)/i.exec(lua))) {
      // IE 8+ 通过Trident判断
      browser = 'IE'
      browserVersion = (tridentMap[matches[2]] || 11).toString()
    } else if ((matches = /ms(ie)\s([\w.]+)/.exec(lua))) {
      browser = 'IE'
      browserVersion = parseInt(matches[2]).toString()
    }
  }

  if (!browser) {
    // 没有判断到ie
    if ((matches = /(edg)[/]([\w.]+)/.exec(lua))) {
      // Edge
      browser = 'Edge'
      browserVersion = parseInt(matches[2]).toString()
    } else if ((matches = /(firefox)[/]([\w.]+)/i.exec(ua))) {
      // Firefox
      browser = matches[1]
      browserVersion = parseInt(matches[2]).toString()
    } else if ((matches = /(chrome)[/]([\w.]+)/i.exec(ua))) {
      // Chrome
      browser = matches[1]
      browserVersion = parseInt(matches[2]).toString()
    } else if ((matches = /(safari)[/]([\w.]+)/i.exec(ua))) {
      // Safari
      browser = matches[1]
      if ((matches = /(version)[/]([\w.]+)/i.exec(ua))) {
        browserVersion = parseInt(matches[2]).toString()
      } else {
        browserVersion = '0'
      }
    } else {
      browser = 'Other'
      browserVersion = '0'
    }
  }
}

setDeviceInfo()

let dpr = typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1

export default {
  pixelRatio: dpr,
  system,
  browser,
  version: browserVersion
}
