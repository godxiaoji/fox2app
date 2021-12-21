import { isUndefined } from './helpers/util'
import * as Components from './components'

const Vfox = {
  install(Vue) {
    Object.values(Components).forEach(component => {
      Vue.component(component.name, component)
    })
  }
}

export default Vfox

if (!isUndefined(window) && window.Vue) {
  window.Vue.use(Vfox)
}
