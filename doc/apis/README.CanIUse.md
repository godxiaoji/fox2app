# CanIUse

## <a name="canIUse">fx.canIUse(schema)</a>

判断微应用的 API，回调，参数，组件等是否在当前版本可用。

### 参数

| 属性   | 类型   | 默认值 | 必填 | 说明                                                                                                      |
| ------ | ------ | ------ | ---- | --------------------------------------------------------------------------------------------------------- |
| schema | string |        | 是   | 使用 \${API}.\${method}.\${param}.\${value} 或者 \${component}.\${option}.\${option}.\${value} 方式来调用 |

#### schema 参数说明

| 参数          | 说明                                                           |
| ------------- | -------------------------------------------------------------- |
| \${API}       | 代表 API 名字                                                  |
| \${method}    | 代表 API 调用方式，有效值为 return, success, object            |
| \${param}     | 代表 API 参数（success, object, callback）或者返回值（return） |
| \${value}     | 代表 API 代表参数的可选值或者返回值的属性                      |
| \${component} | 代表组件名字                                                   |
| \${option}    | 代表组件的属性类型，有效值为 prop, slot, event, method         |
| \${param}     | 代表组件属性参数名                                             |
| \${value}     | 代表 API 代表参数的可选值或者返回值的属性                      |

### 返回

boolean

当前版本是否可用

### 用法

```
// 接口参数、回调或者返回值
fx.canIUse('showModal')
fx.canIUse('getSystemInfoSync.return.language')
fx.canIUse('getSystemInfo.success.windowWidth')
fx.canIUse('showToast.object.image')

// 组件
fx.canIUse('flat-list')
fx.canIUse('icon.prop.size')
fx.canIUse('button.prop.type.primary')
fx.canIUse('select.event.visibility-change')
fx.canIUse('badge.slot.default')
fx.canIUse('flat-list.slot.empty')
fx.canIUse('flat-list.method.scrollToIndex')
```
