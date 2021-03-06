# RadioGroup

单项选择器，内部由多个 [radio](./README.Radio.md) 组成。

## Props

| 属性  | 类型   | 默认值 | 必填 | 说明                            |
| ----- | ------ | ------ | ---- | ------------------------------- |
| name  | string |        | 否   | [form](./README.Form.md) 的标识 |
| align | string | 'left' | 否   | 左右对齐，可选值：left / right  |

## Events

| 事件   | 描述                 | 回调函数参数                                 |
| ------ | -------------------- | -------------------------------------------- |
| change | 选中项发生改变时触发 | CustomEvent，可通过 event.details.value 取值 |

## Slots

```
<fx-radio-group>
  <fx-radio>男</fx-radio>
  <fx-radio>女</fx-radio>
  ...
</fx-radio-group>
```

### 前置元素

```
<fx-radio-group>
  <template #prepend>性别</template>
  ...
</fx-radio-group>
```
