# SystemInfo

微应用基础信息。

## <a name="getSystemInfoSync">Vue.prototype.\$getSystemInfoSync(key)</a>

### 返回

| 属性         | 类型   | 说明                    |
| ------------ | ------ | ----------------------- |
| pixelRatio   | number | 设备像素比              |
| system       | string | 系统及版本              |
| browser      | string | 宿主浏览器              |
| version      | string | 宿主浏览器版本          |
| SDKVersion   | string | 基础库版本              |
| platform     | string | 客户端平台              |
| language     | string | 客户端语言              |
| windowWidth  | number | 可使用窗口宽度，单位 px |
| windowHeight | number | 可使用窗口高度，单位 px |

### 用法

```
try {
  const systemInfo = this.$getSystemInfoSync()
} catch (e) {
  // Do something when catch error
}
```

## <a name="getSystemInfo">Vue.prototype.\$getSystemInfo(object)</a>

### 参数

### object.success 回调函数

| 属性         | 类型   | 说明                    |
| ------------ | ------ | ----------------------- |
| pixelRatio   | number | 设备像素比              |
| system       | string | 系统及版本              |
| browser      | string | 宿主浏览器              |
| version      | string | 宿主浏览器版本          |
| SDKVersion   | string | 基础库版本              |
| platform     | string | 客户端平台              |
| language     | string | 客户端语言              |
| windowWidth  | number | 可使用窗口宽度，单位 px |
| windowHeight | number | 可使用窗口高度，单位 px |

### 用法

```
this.$getSystemInfo({
  success (res) {
    console.log(res)
  }
})
```
