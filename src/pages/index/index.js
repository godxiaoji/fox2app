export default {
  name: 'App',
  components: {},
  data() {
    return {
      number: 1,
      info: { num: 2 },
      arr: [1, 2],
      arr2: [1, 2],
      ck: true,
      selected: 'A',
      options: [
        { text: 'One', value: 'A' },
        { text: 'Two', value: 'B' },
        { text: 'Three', value: 'C' }
      ]
    }
  },
  computed: {
    plus: {
      get() {
        return this.number + 1
      },
      set(newVal) {
        console.log(newVal)
        this.number = newVal - 1
      }
    }
  },
  watch: {
    info: [
      {
        immediate: true,
        deep: true,
        handler(newVal, oldVal) {
          console.log('watch', newVal, oldVal)
        }
      }
    ]
  },
  created() {
    console.log('index created')
  },
  mounted() {
    console.log('index mounted')
    console.log(fx.getSystemInfoSync())

    this.io = this.$createIntersectionObserver({})
      .relativeToViewport({})
      .observe('#number', res => {
        console.log(res)
      })
  },
  onShow() {
    console.log('index show')
  },
  onHide() {
    console.log('index hide')
  },
  methods: {
    onWheel(e) {
      console.log(e)
    },
    add() {
      // this.info.num++
      // this.arr.reverse()
      // this.arr2.push(this.arr2.length + 1)
      this.number++
    },
    showPlus() {
      fx.navigateTo({
        url: 'pages/info/info?id=1'
      })

      // this.createSelectorQuery()
      //   .selectViewport()
      //   .scrollOffset(function(res) {
      //     console.log(res)
      //   })
      //   .selectAll('li')
      //   .boundingClientRect()
      //   .select('li')
      //   .boundingClientRect()
      //   .exec(function(res) {
      //     console.log(res)
      //   })

      // this.io.disconnect()
    },
    toAbout() {
      this.plus = 10
      // fx.switchTab({
      //   url: 'pages/about/about'
      // })
    },
    onClick(e) {
      console.log(e)
    }
  }
}
