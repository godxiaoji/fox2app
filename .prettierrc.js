/**
 * ".printWidth": 100, // 超过最大值换行
 * ".tabWidth": 4, // 缩进字节数
 * ".useTabs": false, // 缩进不使用tab，使用空格
 * ".semi": true, // 句尾添加分号
 * ".singleQuote": true, // 使用单引号代替双引号
 * ".proseWrap": "preserve", // 默认值。因为使用了一些折行敏感型的渲染器（如GitHub comment）而按照markdown文本样式进行折行
 * ".arrowParens": "avoid", //  (x) => {} 箭头函数参数只有一个时是否要有小括号。avoid：省略括号
 * ".bracketSpacing": true, // 在对象括号与文字之间加空格 "{ foo: bar }"
 * ".disableLanguages": ["vue"], // 不格式化vue文件，vue文件的格式化单独设置
 * ".endOfLine": "auto", // 结尾是 \n \r \n\r auto
 * ".eslintIntegration": false, //不让prettier使用eslint的代码格式进行校验
 * ".htmlWhitespaceSensitivity": "ignore",
 * ".ignorePath": ".prettierignore", // 不使用prettier格式化的文件填写在项目的.prettierignore文件中
 * ".jsxBracketSameLine": false, // 在jsx中把'>' 是否单独放一行
 * ".jsxSingleQuote": false, // 在jsx中使用单引号代替双引号
 * ".parser": "babylon", // 格式化的解析器，默认是babylon
 * ".requireConfig": false, // Require a 'prettierconfig' to format prettier
 * ".stylelintIntegration": false, //不让prettier使用stylelint的代码格式进行校验
 * ".trailingComma": "es5", // 在对象或数组最后一个元素后面是否加逗号（在ES5中加尾逗号）
 * ".tslintIntegration": false // 不让prettier使用tslint的代码格式进行校验
 * @see https://prettier.io/docs/en/options.html#prose-wrap
 */
/**'
 * VSCode
 * "javascript.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions": false,
 */
module.exports = {
  tabWidth: 2,
  useTabs: false,
  semi: false,
  arrowParens: 'avoid',
  singleQuote: true,
  bracketSpacing: true,
  endOfLine: 'lf',
  trailingComma: 'none'
}
