---
title: "Vue3 特性以及相较于 Vue2 的优化点"
published: 2021-12-29
description: "Vue3 的新特性，以及在 TypeScript、响应式系统、虚拟 DOM 等方面相较 Vue2 的改进。"
tags: ["Vue"]
category: "框架"
---

## Vue3 特性

- **RFC 机制**可以让所有人参与 Vue 新语法的讨论
- **Vite 让开发调试变得更加丝滑**
- Vue3**性能更好(渲染/打包)，体积更小，内存占用减少**
- **组合式 API**可以更好的组织代码(避免 Vue2 上蹿下跳式开发)，**响应式基于 Proxy**，且可以独立使用。
- Vue3 新增 **Fragment、Teleport 和 Suspense 组件**
- Vue3**重写了虚拟 DOM 的实现，让 diff 更快。重写了 Tree-shaking，减少打包体积。**
- 对于 Vue3，由于模块分离，**便于二次开发**，可以通过**自定义渲染器**来开发各种跨端应用
- Vue3 拥抱**TypeScript**，更好的可维护性

## Vue2 的缺陷和 Vue3 的改进

#### 引入 TypeScript 类型支持

Vue2 基于 Flow\.js 来做类型校验，而现在整个社区都在采用 TS 来构建基础库。因此 Vue3 不再使用 FaceBook 的 flow\.js，用 TS 重构了，引入类型系统可以方便代码提示，同时可以让代码更健壮。

#### 响应式系统的进一步完善

Vue2 采用 defineProperty 的形式

defineProperty :

```javascript
const obj = {};
// 监听obj上的text属性
Object.defineProperty(obj, "text", {
  get: function () {
    console.log("get val");
  },
  set: function (newVal) {
    console.log("set val:" + newVal);
    document.getElementById("input").value = newVal;
    document.getElementById("span").innerHTML = newVal;
  },
});

const input = document.getElementById("input");
input.addEventListener("keyup", function (e) {
  obj.text = e.target.value;
});
```

- defineProperty 是对属性进行拦截，因此 Vue2 所有的数据需要在 data 中声明

- 但是如果 data 中的数据为引用类型时，对数据的操作不会改变地址，比如数组虽然可以通过 Vue 重写过的 push 来实现视图更新，但是对于数组的长度修改还是无法实现，因此需要\$set 等 API。以及对对象属性删除时也监听不到，需要额外去补充。

而 Vue3 用的是 Proxy+Reflect：可以深度监听,但是不支持 IE11 以下浏览器

```javascript
const input = document.getElementById("input");
const p = document.getElementById("p");
const obj = {};

const newObj = new Proxy(obj, {
  get: function (target, key, receiver) {
    console.log(`getting ${key}!`);
    return Reflect.get(target, key, receiver);
  },
  set: function (target, key, value, receiver) {
    console.log(target, key, value, receiver);
    if (key === "text") {
      input.value = value;
      p.innerHTML = value;
    }
    return Reflect.set(target, key, value, receiver);
  },
});

input.addEventListener("keyup", function (e) {
  newObj.text = e.target.value;
});
```

- 真正的代理，拦截数据，但是对于数据格式不关心，统一都拦截(属性删除也可以)，还可以监听 Set, Map 等，这是 Vue2 无法做到的。

- 但是无法兼容 IE11 以下的浏览器。

#### 上窜下跳 Option 式写法变为逻辑分离的 Composition

Options API 有很严重的问题

- 所有数据都挂载在当前实例的 this 上，这样的写法不利于 TypeScript 的类型推导，而且不好做 Tree-shaking(消除无用模块代码)清理代码。

- 代码行数多了以后需要反复上下横跳，开发起来体验比较痛苦。

- 代码不利于复用，Vue2 的组件比较难抽离通用逻辑，用 mixin 的话还会有命名冲突问题。

Composition API 的好处：

- 所有 API 都是通过 import 引入的，用到的功能才 import 进来，利于 Tree-shaking，便于优化包的大小。

- 代码易于复用，可以将一个功能所有的 methods，data 封装到一个独立函数中，复用变的容易。

- Composition API 新增的 return 等语句，使用\<script setup>的特性可以不用写。

Options 和 Composition 的对比图

![Image.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/Image.png "Image.png")

可以看到 Options API 当你处理一段功能逻辑时得上下横跳，尤其是代码段多起来以后非常烦。而 Vue3 的 Composition API 则在功能上是分离的，逻辑更清晰，代码也会更清爽。

对比一下 Vue2 使用的 Options API 和 Vue3 推荐的 Composition API

![Image.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/Image-20220426032431424.png "Image.png")

![Image.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/Image-20220426032431989.png "Image.png")

可以看到 Composition API 显的有一些繁琐，不如 Options API 那样分方法、数据之类的清晰，但是可以发现，业务逻辑被分离了，可以一行注释将一部分业务逻辑包裹起来，这样更便于后期维护和迭代。

### 新的内置组件

Fragment: Vue3 不需要像 Vue2 一样 template 下必须有唯一根节点。

Teleport: **允许组件渲染在别的元素内**，主要在开发弹窗组件的时候特别有用。

Suspense: 异步组件(猜测和 React 的相似)，更**便于开发有异步请求的组件**。

### Vite 新一代工程化工具

复杂项目如果通过 webpack 预打包放内存中调试的话需要花费很多时间，而 vite 就是为了解决这样的时间消耗。

Vite 是基于现代浏览器默认支持 ES6 中 import 语法来实现的。具体是在调试环境下，不需要全部预打包，仅将首页依赖的文件依次通过网络请求去获取，让整个开发体验变得很好，对于**复杂项目可以做到秒级调试和热更新**。

::webpack 和 vite 对比::

webpack 需要将所有路由的依赖打包完毕后才可以调试

![Image.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/Image-20220426032432493.png "Image.png")

vite 一开始仅需要加载首页的依赖模块，然后根据跳转路由时按需加载

![Image.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/Image-20220426032433006.png "Image.png")
