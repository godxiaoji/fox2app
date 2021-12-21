import { isObject, kebabCase2CamelCase } from './helpers/util'
import { SDKKey } from './config'

const map = {
  /**
   * component
   */
  backToTop: {
    prop: {
      visibleHeight: true,
      animated: true,
      iconSize: true,
      offset: true
    },
    slot: {
      default: true
    },
    event: {
      click: true
    }
  },
  badge: {
    prop: {
      count: true,
      maxCount: true,
      dot: true,
      showZero: true,
      offset: true
    },
    slot: {
      default: true
    }
  },
  button: {
    prop: {
      size: {
        default: true,
        mini: true,
        large: true
      },
      type: {
        primary: true,
        secondary: true,
        warning: true
      },
      disabled: true,
      loading: true,
      formType: {
        submit: true,
        reset: true
      }
    },
    slot: {
      default: true
    },
    event: {
      click: true
    }
  },
  cascader: {
    prop: {
      value: true,
      name: true,
      mode: {
        date: true,
        time: true,
        datetime: true
      },
      options: true,
      size: {
        default: true,
        mini: true,
        large: true
      },
      align: {
        left: true,
        center: true,
        right: true
      },
      border: true,
      picker: true,
      placeholder: true,
      separator: true,
      labelKey: true,
      childrenKey: true,
      valueKey: true,
      disabled: true
    },
    slot: {
      prepend: true
    },
    event: {
      change: true,
      visibilityChange: true,
      focus: true,
      blur: true
    }
  },
  checkbox: {
    prop: { name: true, checked: true, disabled: true },
    slot: {
      default: true
    }
  },
  checkboxGroup: {
    prop: {
      name: true,
      align: {
        left: true,
        right: true
      }
    },
    slot: {
      default: true,
      prepend: true
    },
    event: {
      change: true
    }
  },
  copy: {
    prop: {
      text: true
    },
    slot: {
      default: true
    },
    event: {
      success: true,
      error: true
    }
  },
  flatList: {
    prop: {
      data: true,
      dataKey: true,
      horizontal: true,
      itemSize: true,
      initialScrollIndex: true,
      endReachedThreshold: true
    },
    slot: {
      item: true,
      separator: true,
      header: true,
      footer: true,
      empty: true
    },
    event: {
      recycleChange: true,
      endReached: true,
      scroll: true
    },
    method: {
      scrollToIndex: true,
      scrollToOffset: true,
      scrollToEnd: true,
      recordInteraction: true
    }
  },
  form: {
    slot: {
      default: true
    },
    event: {
      submit: true,
      reset: true
    }
  },
  icon: {
    prop: {
      type: {
        success: true,
        success_no_circle: true,
        info: true,
        warn: true,
        waiting: true,
        cancel: true,
        download: true,
        search: true,
        clear: true
      },
      size: true,
      color: true
    }
  },
  image: {
    prop: {
      src: true,
      mode: {
        scaleToFill: true,
        aspectFit: true,
        aspectFill: true,
        widthFix: true,
        top: true,
        bottom: true,
        center: true,
        left: true,
        right: true,
        topLeft: true,
        topRight: true,
        bottomLeft: true,
        bottomRight: true
      },
      lazyLoad: true
    },
    event: {
      error: true,
      load: true
    }
  },
  input: {
    prop: {
      value: true,
      name: true,
      size: {
        default: true,
        mini: true,
        large: true
      },
      align: {
        left: true,
        center: true,
        right: true
      },
      border: true,
      type: {
        text: true,
        number: true,
        password: true,
        textarea: true
      },
      placeholder: true,
      readonly: true,
      maxlength: true,
      focus: true,
      valid: true,
      disabled: true
    },
    event: { input: true, change: true, focus: true, blur: true },
    slot: {
      prepend: true
    }
  },
  modal: {
    prop: {
      title: true,
      content: true,
      maskClosable: true,
      showCancel: true,
      confirmText: true,
      cancelText: true
    },
    event: {
      close: true,
      cancel: true,
      confirm: true
    },
    slot: {
      default: true
    }
  },
  notify: {
    prop: {
      title: true,
      type: {
        primary: true,
        success: true,
        warning: true,
        danger: true
      },
      backgroundColor: true,
      duration: true,
      color: true
    },
    event: {
      close: true
    },
    slot: {
      default: true
    }
  },
  radio: {
    prop: { name: true, checked: true, disabled: true },
    slot: {
      default: true
    }
  },
  radioGroup: {
    prop: {
      name: true,
      align: {
        left: true,
        right: true
      }
    },
    slot: {
      default: true,
      prepend: true
    },
    event: {
      change: true
    }
  },
  scrollView: {
    prop: {
      scrollX: true,
      scrollY: true,
      upperThreshold: true,
      lowerThreshold: true,
      scrollTop: true,
      scrollLeft: true,
      scrollIntoView: true,
      scrollWithAnimation: true,
      enableFlex: true
    },
    slot: {
      default: true
    },
    event: {
      scroll: true,
      scrollToUpper: true,
      scrollToLower: true
    }
  },
  select: {
    prop: {
      value: true,
      name: true,
      size: {
        default: true,
        mini: true,
        large: true
      },
      placeholder: true,
      disabled: true
    },
    slot: {
      default: true
    },
    event: {
      change: true,
      visibilityChange: true,
      focus: true,
      blur: true
    }
  },
  selectOption: {
    prop: {
      value: true,
      disabled: true
    },
    slot: {
      default: true
    }
  },
  slider: {
    prop: {
      value: true,
      name: true,
      min: true,
      max: true,
      step: true,
      disabled: true,
      showValue: true
    },
    event: {
      change: true,
      input: true
    }
  },
  swiper: {
    prop: {
      indicatorDots: true,
      indicatorColor: true,
      indicatorActiveColor: true,
      autoplay: true,
      current: true,
      interval: true,
      duration: true
    },
    slot: {
      default: true
    },
    event: {
      change: true,
      animationFinish: true
    }
  },
  swiperItem: {
    prop: {
      itemId: true
    },
    slot: {
      default: true
    }
  },
  switch: {
    prop: {
      name: true,
      size: true,
      disabled: true,
      checked: true
    },
    event: {
      change: true
    }
  },
  toast: {
    prop: {
      title: true,
      icon: {
        none: true,
        success: true,
        loading: true
      },
      image: true,
      duration: true,
      mask: true
    },
    event: {
      close: true
    }
  },
  /**
   * api
   */
  showNotify: {
    object: {
      title: true,
      type: {
        primary: true,
        success: true,
        warning: true,
        danger: true
      },
      backgroundColor: true,
      duration: true,
      color: true
    }
  },
  hideNotify: {},
  showToast: {
    object: {
      title: true,
      icon: {
        none: true,
        success: true,
        loading: true
      },
      image: true,
      duration: true,
      mask: true
    }
  },
  hideToast: {},
  showLoading: {
    object: {
      title: true,
      mask: true
    }
  },
  hideLoading: {},
  showModal: {
    object: {
      title: true,
      content: true,
      maskClosable: true,
      showCancel: true,
      confirmText: true,
      cancelText: true
    }
  },
  pageScrollTo: {
    object: {
      scrollTop: true,
      duration: true
    }
  },
  getStorageSync: {
    params: {
      key: true
    },
    return: true
  },
  setStorageSync: {
    params: {
      key: true,
      data: true
    }
  },
  removeStorageSync: {
    params: {
      key: true
    }
  },
  clearStorageSync: {},
  getStorageInfoSync: {
    return: {
      keys: true,
      currentSize: true,
      limitSize: true
    }
  },
  getStorage: {
    object: {
      key: true
    },
    success: true
  },
  setStorage: {
    object: {
      key: true,
      data: true
    }
  },
  removeStorage: {
    object: {
      key: true
    }
  },
  clearStorage: {},
  getStorageInfo: {
    success: {
      keys: true,
      currentSize: true,
      limitSize: true
    }
  },
  createSelectorQuery: {
    return: true
  },
  createIntersectionObserver: {
    return: true
  },
  getSystemInfoSync: {
    return: {
      pixelRatio: true,
      system: true,
      browser: true,
      version: true,
      SDKVersion: true,
      platform: true,
      language: true,
      windowHeight: true,
      windowWidth: true
    }
  },
  getSystemInfo: {
    success: {
      pixelRatio: true,
      system: true,
      browser: true,
      version: true,
      SDKVersion: true,
      platform: true,
      language: true,
      windowHeight: true,
      windowWidth: true
    }
  }
}

/**
 * 判断接口可用度
 * @param {String} schema 使用 \${API}.\${method}.\${param}.\${value} 或者 \${component}.\${option}.\${option}.\${value} 方式来调用
 * @param {any} parent map[key]
 */
function _canIUse(schema, parent) {
  let arr = schema.split('.')
  const key = kebabCase2CamelCase(arr.shift())

  if (parent[key]) {
    if (arr[0]) {
      if (isObject(parent[key])) {
        return _canIUse(arr.join('.'), parent[key])
      }
      return false
    }
    return true
  }

  return false
}

/**
 * 判断接口可用度
 * @param {String} schema 使用 \${API}.\${method}.\${param}.\${value} 或者 \${component}.\${option}.\${option}.\${value} 方式来调用
 */
export function canIUse(schema) {
  schema = schema.replace(new RegExp('^' + SDKKey + '-'), '')
  return _canIUse(schema, map)
}
