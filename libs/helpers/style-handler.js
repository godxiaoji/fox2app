import { inArray } from './util'

const pxNames = ['width', 'height', 'top', 'bottom', 'left', 'right']

/**
 * 设置样式
 * @param {Element} el 元素
 * @param {Object} styles 样式
 */
export function setStyles(el, styles) {
  for (let i in styles) {
    let value = styles[i]

    if (inArray(i, pxNames)) {
      value += 'px'
    }

    el.style[i] = value
  }
}

export function showElement(el) {
  el.style.display = 'block'
}

export function hideElement(el) {
  el.style.display = 'none'
}
