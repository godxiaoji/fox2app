# Radio

单选项目。

## Props

| 属性              | 类型                           | 默认值 | 必填 | 说明                                                                                                 |
| ----------------- | ------------------------------ | ------ | ---- | ---------------------------------------------------------------------------------------------------- |
| value             | string / number / 可序列化对象 | ''     | 否   | 标识，[radio-group](./README.RadioGroup.md) 的 change 事件会携带 [radio](./README.Radio.md) 的 value |
| disabled          | boolean                        | false  | 否   | 是否禁用                                                                                             |
| checked / v-model | boolean                        | false  | 否   | 当前是否选中，可用来设置默认选中                                                                     |

## CSS

| 属性    | 默认值  | 说明   |
| ------- | ------- | ------ |
| --color | #09bb07 | 主色调 |

## Slots

```
<fx-radio>男</fx-radio>
<fx-radio>女</fx-radio>
```
