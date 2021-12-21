import { showModal } from '../apis/Modal'
import { showToast, showLoading, hideLoading, hideToast } from '../apis/Toast'
import {
  getStorageInfoSync,
  getStorageInfo,
  getStorageSync,
  getStorage,
  setStorageSync,
  setStorage,
  removeStorageSync,
  removeStorage,
  clearStorageSync,
  clearStorage
} from '../apis/LocalStorage'
import {
  navigateTo,
  switchTab,
  reLaunch,
  navigateBack,
  redirectTo
} from './router'
import { getSystemInfo, getSystemInfoSync } from '../system'
import { canIUse } from '../caniuse'
// import { isObject } from './helpers/util'
// import { parseParamsByRules } from './apis/rules'
// import { getCallbackFns } from './apis/callback'

// function hook(options, apiName, fn) {
//   if (!isObject(options)) {
//     options = {}
//   }

//   const { success, fail, complete } = getCallbackFns(options)
//   try {
//     const res = fn(parseParamsByRules(options, apiName))

//     success(res || {})
//   } catch (error) {
//     fail(error)
//   }

//   complete()
// }

export default {
  showModal,
  showLoading,
  hideLoading,
  showToast,
  hideToast,

  getStorageInfoSync,
  getStorageInfo,
  getStorageSync,
  getStorage,
  setStorageSync,
  setStorage,
  removeStorageSync,
  removeStorage,
  clearStorageSync,
  clearStorage,

  switchTab,
  navigateTo,
  navigateBack,
  redirectTo,
  reLaunch,

  getSystemInfo,
  getSystemInfoSync,
  canIUse
}
