export default {
  globalData: {
    num: 1
  },
  filters: {
    ucfirst(value) {
      console.log(this, 'app')
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  onLaunch(object) {
    console.log('app onLaunch4', this, object)
  },
  onShow() {
    console.log('app onShow', this)
  },
  onHide() {
    console.log('app onHide')
  }
}
