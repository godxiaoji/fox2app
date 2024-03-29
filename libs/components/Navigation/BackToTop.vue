<template>
  <div
    v-show="scrollTop >= visibleHeight"
    :class="[prefix + '-back-to-top']"
    :style="styles"
    @click="onClick"
  >
    <slot>
      <icon :class="[prefix + '-back-to-top_icon']" type="upload"></icon>
    </slot>
  </div>
</template>

<script>
import Icon from '../Icon/Icon.vue'
import { frameTo } from '../../helpers/animation'
import { SDKKey } from '../../config'

export default {
  name: SDKKey + '-back-to-top',
  components: { Icon },
  props: {
    visibleHeight: {
      type: Number,
      default: 200
    },
    // 是否需要动画
    animated: {
      type: Boolean,
      default: true
    },
    iconSize: {
      type: Number
    },
    // 偏移量，格式为 [x, y]
    offset: {
      type: Array,
      default() {
        return [0, 0]
      }
    }
  },
  data() {
    return {
      prefix: SDKKey,

      scrollTop: 0,
      duration: 200
    }
  },
  computed: {
    styles() {
      return {
        transform: `translate3d(${this.offset[0]}px, ${this.offset[1]}px, 0px)`
      }
    }
  },
  watch: {},
  created() {
    this.scrollTop = document.documentElement.scrollTop
    document.addEventListener('scroll', this.onScroll, false)
  },
  ready() {},
  mounted() {},
  updated() {},
  attached() {},
  beforeDestroy() {
    document.removeEventListener('scroll', this.onScroll, false)
  },
  methods: {
    onScroll(e) {
      this.scrollTop = e.target.documentElement.scrollTop
    },

    onClick(e) {
      this.toTop()

      this.$emit(e.type, e)
    },

    toTop() {
      const docElem = document.documentElement
      const to = 0
      const from = docElem.scrollTop

      if (from === to) {
        // 不需要跳转
      } else if (!this.animated) {
        // 不需要动画
        docElem.scrollTop = to
      } else {
        frameTo({
          from,
          to,
          duration: this.duration,
          progress(res) {
            docElem.scrollTop = res.current
          }
        })
      }
    }
  }
}
</script>

<style lang="scss">
@import '../component.module.scss';

.#{$prefix}-back-to-top {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 99998;
  cursor: pointer;

  &_icon {
    display: block;
    width: 40px;
    height: 40px;
  }
}
</style>
