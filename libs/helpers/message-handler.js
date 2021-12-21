import Exception from './exception'
import { TYPE_MASTER, TYPE_UI, TYPE_LOGIC } from './consts'

/**
 * 发消息到页面
 * @param {Object} data 发送数据
 * @param {Number} cid 组件id
 * @param {Number} pid 页面id
 * @param {String} sourceType 来源类型
 */
export function postMessageToPage(data, cid, pid, sourceType = TYPE_LOGIC) {
  const postData = Object.assign(data, {
    cid,
    pid,
    sourceType
  })

  const frame = window.parent.frames[`pageFrame_${pid}`]

  if (frame) {
    frame.contentWindow.postMessage(postData, location.origin)
  } else {
    throw new Exception('Page not found.')
  }
}

export function masterPostMessageToPage(data, cid, pid) {
  return postMessageToPage(data, cid, pid, TYPE_MASTER)
}

/**
 * 发消息到逻辑层
 * @param {Object} data 发送数据
 * @param {Number} cid 组件id
 * @param {Number} pid 页面id
 * @param {String} sourceType 来源类型
 */
export function postMessageToLogic(data, cid, pid, sourceType = TYPE_UI) {
  const postData = Object.assign(data, {
    cid,
    pid,
    sourceType
  })

  window.parent.frames['loginFrame'].contentWindow.postMessage(
    postData,
    location.origin
  )
}

export function masterPostMessageToLogic(data, cid = 0, pid = 0) {
  return postMessageToLogic(data, cid, pid, TYPE_MASTER)
}

/**
 * 发消息到管理层
 * @param {Object} data 发送数据
 * @param {String} sourceType 来源类型
 */
export function postMessage(data, sourceType) {
  const postData = Object.assign(data, {
    sourceType
  })

  window.parent.postMessage(postData, location.origin)
}

let msgId = 0

export function getMessageId() {
  return ++msgId
}
