import { isNumeric, capitalize, cloneData } from '../helpers/util'
// import { mergeData } from '../helpers/data-handler'
import { SDKKey } from '../config'
import { postMessageToLogic } from '../helpers/message-handler'
import { COMPONENT_WATCH_DATA_CHANGE } from '../helpers/consts'

function getKey(name) {
  return `_${SDKKey}${capitalize(name)}`
}

function setData(vm, pathLike, value) {
  const newVal = cloneData(value)

  // mergeData(vm, pathLike, value)

  postMessageToLogic(
    {
      cmd: COMPONENT_WATCH_DATA_CHANGE,
      pathLike,
      value: newVal
    },
    vm._uid,
    vm._pid
  )
}

/**
 * v-model 指令
 * 指令支持重复多个，以下指令只要针对数据双线程传输
 */
Vue.directive('model', {
  bind(el, binding, vnode) {
    console.log(el, binding, vnode)
    const { lazy, number, trim } = binding.modifiers
    const vm = vnode.context
    const tagName = el.tagName.toLowerCase()

    function handleValue(value) {
      if (number && isNumeric(value)) {
        value = parseFloat(value)
      }

      if (trim) {
        value = value.trim()
      }

      return value
    }

    if (tagName === 'input' || tagName === 'textarea') {
      const handler = function(e) {
        const target = e.target
        let value

        if (target.type === 'checkbox' || target.type === 'radio') {
          value = target.checked
        } else {
          value = handleValue(target.value)
        }

        setData(vm, binding.expression, value)
      }

      let type = 'change'

      if (el.type === 'checkbox' || el.type === 'radio') {
        // el.checked = !!binding.value
      } else {
        if (!lazy) type = 'input'
        // el.value = binding.value.toString()
      }

      el[getKey(binding.name)] = {
        type,
        handler
      }

      el.addEventListener(type, handler, false)
    } else if (tagName === 'select') {
      //
      const type = 'change'
      const handler = function(e) {
        setData(vm, binding.expression, handleValue(e.target.value))
      }

      // el.value = binding.value.toString()

      el[getKey(binding.name)] = {
        type,
        handler
      }

      el.addEventListener(type, handler, false)
    }
  },
  unbind(el, binding) {
    if (el[getKey(binding.name)]) {
      const { type, handler } = el[getKey(binding.name)]
      el.removeEventListener(type, handler, false)
    }
  }
})
