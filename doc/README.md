# 指南

## 目录结构

fox2app 包含一个描述整体程序的 app 和多个描述各自页面的 page。

一个微应用主体部分由三个文件组成，必须放在项目的根目录，如下：

| 文件                             | 必需 | 作用     |
| -------------------------------- | ---- | -------- |
| <a href="#app.js">app.js</a>     | 是   | 应用入口 |
| <a href="#app.json">app.json</a> | 是   | 公共配置 |

一个页面或者自定义组件由四个文件组成，分别是：

| 文件类型                      | 必需 | 作用            |
| ----------------------------- | ---- | --------------- |
| <a href="#page.js">js</a>     | 是   | 页面/组件逻辑   |
| <a href="#page.fxml">fxml</a> | 是   | 页面/组件结构   |
| <a href="#page.json">json</a> | 是   | 页面/组件配置   |
| <a href="#page.css">css</a>   | 是   | 页面/组件样式表 |

## 注册

### <a name="app.js">app 应用入口</a>

每个 fox2app 微应用需要提供 app.js，绑定生命周期回调函数等。

```
export default {
  globalData: {
    num: 1
  },
  onLaunch(object) {
    console.log('app onLaunch', this, object)
  },
  onShow() {
    console.log('app onShow', this)
  },
  onHide() {
    console.log('app onHide')
  }
}
```

### <a name="app.json">app 公共配置</a>

根目录下的 app.json 文件用来对微应用进行全局配置。文件内容为一个 JSON 对象，有以下属性：

| 属性                             | 类型     | 必填 | 描述               | 最低版本 |
| -------------------------------- | -------- | ---- | ------------------ | -------- |
| <a href="#app.pages">pages</a>   | string[] | 是   | 页面路径列表       |
| <a href="#app.window">window</a> | Object   | 否   | 全局的默认窗口表现 |
| <a href="#app.tabBar">tabBar</a> | Object   | 否   | 底部 tab 栏的表现  |
| <a href="#app.size">size</a>     | Object   | 否   | 应用窗口大小       |

#### <a name="app.pages">pages</a>

#### <a name="app.window">window</a>

用于设置微应用的状态栏、导航条、标题、窗口背景色。

| 属性                         | 类型     | 默认值    | 描述                                 | 最低版本 |
| ---------------------------- | -------- | --------- | ------------------------------------ | -------- |
| navigationBarBackgroundColor | HexColor | '#000000' | 导航栏背景颜色，如 #000000           |
| navigationBarTextStyle       | string   | 'white'   | 导航栏标题颜色，仅支持 black / white |
| navigationBarTitleText       | string   | ''        | 导航栏标题文字内容                   |
| backgroundColor              | HexColor | '#ffffff' | 窗口的背景色                         |

#### <a name="app.tabBar">tabBar</a>

如果微应用是一个多 tab 应用（客户端窗口的底部或顶部有 tab 栏可以切换页面），可以通过 tabBar 配置项指定 tab 栏的表现，以及 tab 切换时显示的对应页面。

| 属性 | 类型  | 必填 | 默认值 | 描述                                                     | 最低版本 |
| ---- | ----- | ---- | ------ | -------------------------------------------------------- | -------- |
| list | Array | 是   |        | tab 的列表，详见 list 属性说明，最少 2 个、最多 5 个 tab |

其中 list 接受一个数组，只能配置最少 2 个、最多 5 个 tab。tab 按数组的顺序排序，每个项都是一个对象，其属性值如下：

| 属性     | 类型   | 必填 | 说明                            |
| -------- | ------ | ---- | ------------------------------- |
| pagePath | string | 是   | 页面路径，必须在 pages 中先定义 |
| text     | string | 是   | tab 上按钮文字                  |

PS：目前 tabBar 是隐式设置，没有具体表现。

#### <a name="app.size">size</a>

用于设置微应用的窗口大小。

| 属性         | 类型   | 默认值 | 描述 | 最低版本       |
| ------------ | ------ | ------ | ---- | -------------- |
| windowWidth  | number | 800    | 否   | 应用窗口的宽度 |
| windowHeight | number | 600    | 否   | 应用窗口的高度 |

```
{
  "pages": ["pages/index/index", "pages/about/about", "pages/info/info"],
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/about/about",
        "text": "关于"
      }
    ]
  },
  "size": {
    "windowHeight": 600,
    "windowWidth": 800
  },
  "window": {
    "navigationBarTextStyle": "black"
  }
}
```

## 页面/组件代码构成

我们通过 cli 快速创建了一个 QuickStart 项目。你可以留意到这个项目里边生成了不同类型的文件:

- .json 后缀的 json 配置文件
- .fxml 后缀的 vue 模板文件
- .css 后缀的 css 样式文件
- .js 后缀的 javascript 脚本逻辑文件

接下来我们分别看看这 4 种文件的作用。

### <a name="page.json">JSON 配置</a>

当前页面的配置内容，pages 里面的 json 多了一些导航相关的配置项，入下：

```
{
  "usingComponents": {
    "hello": "/components/hello/hello"
  },
  "navigationBarTextStyle": "white",
  "navigationBarBackgroundColor": "#ff0000",
  "navigationBarTitleText": "详情页"
}
```

PS：页面或者组件中引入的其他自定义组件需要在该文件中体现。

### <a name="page.json">fxml 模板</a>

整个框架基于 VUE 作为 UI 层的开发，所以模板也沿用了 Vue 的模板引擎，具体语法可以参考[Vue 模板语法](https://cn.vuejs.org/v2/guide/syntax.html)。

### <a name="page.css">css 样式</a>

标准 css，当然也可以通过 import 的方式引入公共 css。

后续会支持引入 sass/less 等扩展。

### <a name="page.js">javascript 交互脚本</a>

和 vue-cli 生成的模板 script 中使用方式相同。

```
export default {
  data() {
    return {}
  },
  created() {
    console.log('about created')
  },
  beforeDestroy() {
    console.log('about destroyed')
  },
  mounted() {},
  onShow() {
    console.log('about show')
  },
  onHide() {
    console.log('about hide')
  },
  methods: {
    add() {
      this.number++
    },
    back() {
      fx.switchTab({
        url: 'pages/index/index'
      })
    }
  }
}
```

## 基础

体验该框架默认你比较熟悉 Vue，里面很多语法和功能都和 Vue 比较类似。和 Vue 不同的时候，禁止了所有 DOM 相关的操作，而且像 window，location 等对象也被禁止。

### 实例

1. 这份配置会在 UI 层生产 Vue 实例，UI 层的方法，生命周期等都会劫持转发到 logic 层。也会在 logic 层生成一份相似的 Fx 实例。

2. 同 Vue 一样，Fx 实例的 data 也是响应式的，内部用 [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 来实现，并传输到 UI 层。UI 采用 Vue 2.x，使用 Object.defineProperty 来响应，感兴趣查看[Vue 深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)。

3. 不同于 Vue，data 的值不能有函数。

4. 生命周期扩展了两个类 `onShow` 和 `onHide`，目前 app 的 show 和 hide 需要宿主来实现。

### 模板语法

模板沿用了 Vue 的模板引擎，具体语法可以参考[Vue 模板语法](https://cn.vuejs.org/v2/guide/syntax.html)。

### 计算属性和侦听器

已经实现了完整的 computed 和 watch，具体用法可参考 [Vue 计算属性和侦听器](https://cn.vuejs.org/v2/guide/computed.html)。

### 事件处理

1. 不支持 DOM 事件绑定中直接写表达式，只能通过传递函数的方式：

```
<!-- 不支持 -->
<div id="example-1">
  <button v-on:click="counter += 1">Add 1</button>
  <p>The button above has been clicked {{ counter }} times.</p>
</div>
```

2. 不支持 DragEvent 相关的事件：

- dragstart
- drag
- dragenter
- dragexit
- dragleave
- dragover
- drop
- dragend

### 表单输入绑定

支持 `v-model` 指令，目前该指令不能针对自定义组件。

### 组件相关

1. 引用自定义组件是在对应 json 配置中写好的，在 js 中不需要重复 import，`components` 配置不需要提供也不支持这种方式。

2. 支持 ref

可以通过 ref 这个 attribute 为子组件赋予一个 ID 引用。例如：

```
<base-input ref="usernameInput"></base-input>
```

现在在你已经定义了这个 ref 的组件里，你可以使用：

```
this.\$refs.usernameInput
```

获取到 fx 实例。

### 过滤器

1. 在组件中支持创建一个本地过滤器：

```
// eg: page/index/index.js

filters: {
  capitalize: function (value) {
    if (!value) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
}
```

2. 或者在 app.js 中创建全局过滤器

```
// app.js
...

globalData: {},
filters: {
  capitalize(value) {
    if (!value) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
},

...
```

3. 跟 Vue 一样，过滤器也支持以下三种情况：

- 当全局过滤器和局部过滤器重名时，会采用局部过滤器。
- 串：

```
{{ message | filterA | filterB }}
```

- 接收参数：

```
{{ message | filterA('arg1', arg2) }}
```

### 规模化

1. 框架内部实现了跟 APP 一样的多页模式，不支持引入 `vue-roader`。

2. `vuex`暂未支持。

3. 内置 `axios` 。
