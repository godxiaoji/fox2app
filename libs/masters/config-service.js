const pageCtx = require.context('../../src/pages', true, /\.json$/)
import appJson from '../../src/app.json'

export function getPageCtx() {
  return pageCtx
}

export function getAppJson() {
  return appJson
}

window.__$ = window.__$ || {}
window.__$.getPageCtx = getPageCtx
window.__$.getAppJson = getAppJson
