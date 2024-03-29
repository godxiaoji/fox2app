<template>
  <div
    :class="[
      prefix + '-scroll-view',
      prefix + '-scroll-bar',
      {
        'scroll-x': scrollX,
        'scroll-y': scrollY,
        'enable-flex': enableFlex,
        smooth: scrollWithAnimation
      }
    ]"
    @scroll="scrollEvent"
  >
    <slot></slot>
  </div>
</template>

<script>
import { CustomEvent } from '../../helpers/events'
import { SDKKey } from '../../config'

const SCROLL_STATE_CENTER = 0
const SCROLL_STATE_UPPER = 1
const SCROLL_STATE_LOWER = 2

export default {
  name: SDKKey + '-scroll-view',
  props: {
    // 允许横向滚动
    scrollX: {
      type: Boolean,
      default: false
    },
    // 允许纵向滚动
    scrollY: {
      type: Boolean,
      default: false
    },
    // 在设置滚动条位置时使用动画过渡
    scrollWithAnimation: {
      type: Boolean,
      default: false
    },
    // 距顶部/左边多远时，触发 scrolltoupper 事件
    upperThreshold: {
      type: Number,
      default: 50
    },
    // 距底部/右边多远时，触发 scrolltolower 事件
    lowerThreshold: {
      type: Number,
      default: 50
    },
    // 设置竖向滚动条位置
    scrollTop: {
      type: Number,
      default: 0
    },
    // 设置横向滚动条位置
    scrollLeft: {
      type: Number,
      default: 0
    },
    // 值应为某子元素id（id不能以数字开头）。设置哪个方向可滚动，则在哪个方向滚动到该元素
    scrollIntoView: {
      type: String,
      default: ''
    },
    // 启用 flexbox 布局。开启后，当前节点声明了 display: flex 就会成为 flex container，并作用于其孩子节点。
    enableFlex: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return { prefix: SDKKey }
  },
  ready() {},
  mounted() {
    this._isToLowerOrUpperY === SCROLL_STATE_UPPER
    this._isToLowerOrUpperX === SCROLL_STATE_UPPER
    this._prevY = 0
    this._prevX = 0

    // 处理初始化设置的滚动位置
    this.updateScroll()
    this.scrollIntoIdView(this.scrollIntoView)
  },
  updated() {},
  attached() {},
  beforeDestroy() {},
  watch: {
    scrollLeft() {
      this.updateScroll()
    },
    scrollTop() {
      this.updateScroll()
    },
    scrollIntoView(val) {
      this.scrollIntoIdView(val)
    }
  },
  methods: {
    /**
     * 滚动到指定Id元素
     */
    scrollIntoIdView(id) {
      if (id) {
        const $view = this.$el.getElementById(id)

        if ($view) {
          $view.scrollIntoView({
            behavior: this.scrollWithAnimation ? 'smooth' : 'auto'
          })
        }
      }
    },

    /**
     * 滑动到第index个元素
     */
    scrollIntoIndex(index) {
      const $view = this.$el.children[index]

      if ($view) {
        $view.scrollIntoView({
          behavior: this.scrollWithAnimation ? 'smooth' : 'auto'
        })
      }
    },

    /**
     * 接收更新滚动的位置
     */
    updateScroll() {
      let { scrollY, scrollX, scrollLeft, scrollTop } = this
      if (!scrollY) {
        scrollTop = 0
      }
      if (!scrollX) {
        scrollLeft = 0
      }

      if (scrollTop > 0 || scrollTop > 0) {
        this.$el.scrollTo({
          top: scrollTop,
          left: scrollLeft,
          behavior: this.scrollWithAnimation ? 'smooth' : 'instant'
        })
      }
    },

    /**
     * 滚动事件处理
     */
    scrollEvent(e) {
      const { upperThreshold, lowerThreshold, scrollX, scrollY, $el } = this
      const {
        scrollTop,
        scrollLeft,
        scrollWidth,
        scrollHeight,
        clientHeight,
        clientWidth
      } = $el

      let isToLowerY = false
      let isToUpperY = false
      let isToLowerX = false
      let isToUpperX = false

      const typeLower = 'scroll-to-lower'
      const typeUpper = 'scroll-to-upper'

      // 滚动事件
      this.$emit(
        e.type,
        new CustomEvent(e, {
          scrollTop,
          scrollLeft,
          scrollWidth,
          scrollHeight
        })
      )

      // 上下滚动
      if (scrollY) {
        if (
          scrollTop + clientHeight + lowerThreshold >= scrollHeight &&
          scrollTop > this._prevY
        ) {
          isToLowerY = true
        } else if (scrollTop <= upperThreshold && scrollTop < this._prevY) {
          isToUpperY = true
        }
      }

      // 左右滚动
      if (scrollX) {
        if (scrollLeft + clientWidth + lowerThreshold >= scrollWidth) {
          isToLowerX = true
        } else if (scrollLeft <= upperThreshold) {
          isToUpperX = true
        }
      }

      // 防止重复报
      if (isToUpperY || isToLowerY) {
        if (this._isToLowerOrUpperY === SCROLL_STATE_UPPER) {
          // 当前在触顶期间
          isToUpperY = false
        } else if (this._isToLowerOrUpperY === SCROLL_STATE_LOWER) {
          // 当前在触底期间
          isToLowerY = false
        }
      } else {
        this._isToLowerOrUpperY = SCROLL_STATE_CENTER
      }
      if (isToUpperX || isToLowerX) {
        if (this._isToLowerOrUpperX === SCROLL_STATE_UPPER) {
          // 当前在触顶期间
          isToUpperX = false
        } else if (this._isToLowerOrUpperX === SCROLL_STATE_LOWER) {
          // 当前在触底期间
          isToLowerX = false
        }
      } else {
        this._isToLowerOrUpperX = SCROLL_STATE_CENTER
      }

      if (isToUpperY) {
        // 触顶
        this._isToLowerOrUpperY = SCROLL_STATE_UPPER

        this.$emit(
          typeUpper,
          new CustomEvent(
            {
              type: typeUpper,
              currentTarget: $el
            },
            {
              direction: 'top'
            }
          )
        )
      } else if (isToLowerY) {
        // 触底
        this._isToLowerOrUpperY = SCROLL_STATE_LOWER

        this.$emit(
          typeLower,
          new CustomEvent(
            {
              type: typeLower,
              currentTarget: $el
            },
            {
              direction: 'bottom'
            }
          )
        )
      }
      if (isToUpperX) {
        // 触顶
        this._isToLowerOrUpperX = SCROLL_STATE_UPPER

        this.$emit(
          typeUpper,
          new CustomEvent(
            {
              type: typeUpper,
              currentTarget: $el
            },
            {
              direction: 'left'
            }
          )
        )
      } else if (isToLowerX) {
        // 触底
        this._isToLowerOrUpperX = SCROLL_STATE_LOWER

        this.$emit(
          typeLower,
          new CustomEvent(
            {
              type: typeLower,
              currentTarget: $el
            },
            {
              direction: 'right'
            }
          )
        )
      }

      this._prevY = scrollTop
      this._prevX = scrollLeft
      // window.console.log(e);
    }
  }
}
</script>

<style lang="scss">
@import '../component.module.scss';

.#{$prefix}-scroll-view {
  display: block;
  width: 100%;
  overflow: hidden;

  &.scroll-x {
    overflow-x: auto;
  }

  &.scroll-y {
    overflow-y: auto;
  }

  &.enable-flex {
    display: flex;
  }

  &.smooth {
    scroll-behavior: smooth;
  }
}
</style>
