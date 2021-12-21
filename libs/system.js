import { appConfig } from "./app-config"
import SDKVersion from './sdk-version'
import { cloneData, isObject } from './helpers/util'
import browserInfo from './helpers/browser-info'
import { getCallbackFns } from './apis/callback'

const systemInfo = Object.assign(browserInfo, {
  SDKVersion,
  platform: 'devtools',
  language: 'zh_CN'
})

function init() {
  try {
    systemInfo.windowHeight = appConfig.size.windowHeight
    systemInfo.windowWidth = appConfig.size.windowWidth
  } catch (e) {
    console.error(e)
  }
}

init()

export function getSystemInfoSync() {
  return cloneData(systemInfo)
}

export function getSystemInfo(options) {
  if (!isObject(options)) {
    options = {}
  }

  const { success, complete } = getCallbackFns(options)

  success(getSystemInfoSync())
  complete()
}
