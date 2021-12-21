import { getAppTarget } from './events'
import { inArray, isElement } from './util'

const FORM_EVENTS = ['change', 'input', 'focus', 'blur', 'select']

function mergeFormAttributes(details, { target, type: eventType }) {
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    details.value = target.value
    details.name = target.name
    details.type = target.type

    if (target.type === 'checkbox' || target.type === 'radio') {
      details.checked = target.checked
    }

    if (eventType === 'select') {
      details.selectionStart = target.selectionStart
      details.selectionEnd = target.selectionEnd
      details.selectionDirection = target.selectionDirection
      details.selectionValue = target.value.substring(
        target.selectionStart,
        target.selectionEnd
      )
    }
  } else if (target.tagName === 'SELECT') {
    details.value = target.value
    details.name = target.name
    details.type = target.type
    details.selectedIndex = target.selectedIndex
  }
}

/**
 * App封装原生事件类
 */
export class AppEvent {
  constructor(event) {
    const { currentTarget, target, type } = event

    this.timeStamp = Date.now()
    this.currentTarget = getAppTarget(currentTarget)
    this.target = getAppTarget(target)

    const keys = [
      'isTrusted',
      'eventPhase',
      'type',
      'defaultPrevented',
      'cancelable',
      'bubbles',
      'composed'
    ]

    keys.forEach(v => {
      this[v] = event[v]
    })

    const details = {}

    if (inArray(type, FORM_EVENTS) && isElement(target)) {
      // 如果命中form表单类型
      mergeFormAttributes(details, event)
    }

    this.details = details

    return this
  }
}

/**
 * App UI封装原生事件类
 */
export class AppUIEvent extends AppEvent {
  constructor(event) {
    super(event)

    const keys = [
      'detail'
      // 'layerX',
      // 'layerY'
    ]

    keys.forEach(v => {
      this[v] = event[v]
    })

    return this
  }
}

/**
 * app mouse类 mousedown click mousedown
 */
export class AppMouseEvent extends AppUIEvent {
  constructor(event) {
    super(event)

    const keys = [
      'screenX',
      'screenY',
      'clientX',
      'clientY',
      'pageX',
      'pageY',
      'movementX',
      'movementY',
      'ctrlKey',
      'shiftKey',
      'altKey',
      'metaKey',
      'button',
      'buttons'
    ]

    keys.forEach(v => {
      this[v] = event[v]
    })

    this.relatedTarget = getAppTarget(event.relatedTarget)

    return this
  }
}

export class AppWheelEvent extends AppMouseEvent {
  constructor(event) {
    super(event)

    const keys = ['deltaMode', 'deltaX', 'deltaY', 'deltaZ']

    keys.forEach(v => {
      this[v] = event[v]
    })

    return this
  }
}

/**
 * app keyboard 类
 */
export class AppKeyboardEvent extends AppUIEvent {
  constructor(event) {
    super(event)

    const keys = [
      'key',
      'code',
      'location',
      'ctrlKey',
      'shiftKey',
      'altKey',
      'metaKey',
      'isComposing',
      'repeat'
    ]

    keys.forEach(v => {
      this[v] = event[v]
    })

    return this
  }
}

/**
 * app touch 类
 */
export class AppTouchEvent extends AppUIEvent {
  constructor(event) {
    super(event)

    const keys = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey']

    const setTouches = key => {
      const touchList = []

      for (let i = 0; i < event[key].length; i++) {
        touchList.push(new AppTouch(event[key].item(i)))
      }

      this[key] = touchList
    }

    keys.forEach(v => {
      this[v] = event[v]
    })

    setTouches('changedTouches')
    setTouches('targetTouches')
    setTouches('touches')

    return this
  }
}

export class AppTouch {
  constructor(touch) {
    const keys = [
      'identifier',
      'screenX',
      'screenY',
      'clientX',
      'clientY',
      'pageX',
      'pageY'
    ]

    keys.forEach(v => {
      this[v] = touch[v]
    })

    this.target = getAppTarget(touch.target)

    return this
  }
}

/**
 * app FocusEvent 接口表示和焦点相关的事件比如 focus, blur, focusin, 和 focusout
 */
export class AppFocusEvent extends AppUIEvent {
  constructor(event) {
    super(event)

    this.relatedTarget = getAppTarget(event.relatedTarget)

    return this
  }
}

/**
 * app InputEvent 接口用来构造和字符输入相关的事件对象
 */
export class AppInputEvent extends AppUIEvent {
  constructor(event) {
    super(event)

    const keys = [
      'inputType',
      'data',
      'isComposing'
      // 'dataTransfer'
    ]

    keys.forEach(v => {
      this[v] = event[v]
    })

    return this
  }
}
