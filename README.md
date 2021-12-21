# fox2app-cli

## 介绍

Fox2app CLI 是基于 vue.js 作为 UI 的微应用脚手架。

由于 fox2app 本身还未完善，故没有开源，这套理念是基于小程序的，我写了一些[分析](https://www.jianshu.com/p/4efc86fbfd9e)。

## 安装

通过 NPM 安装包：

```
npm install -g fox2app-cli
```

可以通过命令检查版本：

```
fox2app --version
```

## 开发

### 创建一个项目

运行以下命令来创建一个新项目：

```
fox2app create hello-world
```

### 开发服务

根据刚才创建的项目，我们进到项目中，开启服务：

```
cd hello-world && npm run serve
```

### 代码检查

提供`eslint`代码检查服务：

```
npm run lint
```

### 打包

```
npm run build
```

### 文档

[Guide 指南](./doc/README.md)

[Components 组件](./doc/README.COMPONENTS.md)

[APIs 接口](./doc/README.APIS.md)
