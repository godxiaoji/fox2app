const pageCtx = require.context('@/pages', true, /\.json$/)
import appJson from '@/app.json'

export function getPageCtx() {
  return pageCtx
}

export function getAppJson() {
  return appJson
}

window.__$ = window.__$ || {}
window.__$.getPageCtx = getPageCtx
window.__$.getAppJson = getAppJson
