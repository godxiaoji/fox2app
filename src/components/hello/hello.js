export default {
  props: {
    number: Number,
    info: Object
  },
  components: {},
  data() {
    return { title: 'hello' }
  },
  watch: {
    number: {
      immediate: true,
      handler(newVal) {
        console.log('hello number', newVal)
      }
    }
  },
  filters: {
    capitalize(value) {
      console.log(this)
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  created() {
    console.log('hello created')

    // this.$watch(
    //   'info',
    //   (newVal, oldVal) => {
    //     console.log('hello info', newVal, oldVal)
    //   },
    //   {
    //     immediate: true
    //   }
    // )
  },
  mounted() {},
  pageLifetimes: {
    show() {
      console.log('hello show')
    },
    hide() {
      console.log('hello hide')
    }
  },
  methods: {
    test() {
      console.log(this)
    }
  }
}
