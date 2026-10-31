---
title: "React是什么？"
published: 2025-06-03
description: "React的中文含义是反应或者响应。 React的核心原理是：当数据变化时，UI能自动把变化反应出来。"
tags: ["React"]
category: "框架"
---

React的中文含义是反应或者响应。 React的核心原理是：当数据变化时，UI能自动把变化反应出来。

在React出现时的背景来说是颠覆式创新。

举个例子，在当时如果要实现一个聊天应用，当来了一条新消息时，你需要通过DOM API把消息加到聊天框，同时要让显示未读消息的地方让数字加一，这样才能保持UI的一致性。

而如果使用React的话，你只需要在业务状态和UI状态之间建立一个绑定关系就可以了，不需要去直接操作修改UI，而是绑定完成后，React会在业务状态发生变化时，帮助我们去完成UI的变化。

![1748909702006](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/202506030815096.jpg)

### React的基本概念

基本概念就三个：

- 组件
- 状态
- JSX

#### 组件

组件有两种

- 原生组件 div、span等
- 自定义组件 使用时必须大驼峰命名，如PageHeader

```javascript
function CommentBox() {
  return (
    <div>
      <CommentHeader />
      <CommentList />
      <CommentForm />
    </div>
  );
}
```

#### 状态(state和props管理状态)

根据React的核心机制，需要在状态变化时渲染UI，那就需要有保存状态的地方，在React中叫做state。

props是用来在父子组件之间传递状态的，类似于表单组件的传参属性概念。

用React函数组件举个state例子

```javascript
import React from "react";

export default function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  );
}
```

通过useState可以定义一个状态，和一个设置状态的函数。

点击Button ⇒ setCount更新count状态 ⇒ 更新视图渲染(count+1)

再举个state+props的例子

```javascript
import React from "react";

function CountLabel({ count }) {
  // 子组件用于显示颜色
  const color = count > 10 ? "red" : "blue";
  return <span style={{ color }}>{count}</span>;
}

export default function Counter() {
  // 定义了 count 这个 state
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        <CountLabel count={count} />
      </button>
    </div>
  );
}
```

1. 点击Button ⇒ setCount更新count状态
2. count状态发生变化 ⇒ 作为props传入CountLabel
3. CountLabel重新执行 + 渲染(根据count值对应不同的color颜色)

> React和Vue的区别

React函数式：

- 当props更新时，整个函数组件会重新执行
- 函数内的所有代码都会重新运行
- 创建新的变量和JSX元素
- 完全重新渲染这个组件实例

Vue:

- 组件实例会被保留
- 只触发响应式系统的更新
- 只重新计算依赖于变化的props的计算属性或方法
- 智能地只更新需要变化的DOM部分

主要区别：

- Vue更细粒度，只更新受影响的部分
- React采用完全重新执行的方式，更符合函数式编程理念
- Vue的响应式系统自动追踪依赖关系
- React需要开发者主动考虑性能优化（如使用useMemo、useCallback等）

### JSX语法本质

#### JSX 的本质是什么，它和 JS 之间到底是什么关系？

JSX本质是JavaScript的一种语法拓展, 但是它充分具备 JavaScript 的能力。

#### JSX 语法是如何在 JavaScript 中生效的?

通过Babel将JSX转换成React.createElement()， React.createElement() 将返回一个叫作“React Element”的 JS 对象.转换就是在编译的过程中,  由Babel完成.

#### JSX是如何映射成DOM的

JSX

```html
import React from "react";

function CountLabel({ count }) {
  // 子组件用于显示颜色
  const color = count > 10 ? "red" : "blue";
  return <span style={{ color }}>{count}</span>;
}

export default function Counter() {
  // 定义了 count 这个 state
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        <CountLabel count={count} />
      </button>
    </div>
  );
}
```

JSX ⇒ JS

```javascript
React.createElement(
  "div",
  null,
  React.createElement(
    "button",
    { onClick: function onClick() {
        return setCount(count + 1);
      } },
    React.createElement(CountLabel, { count: count })
  )
);
```

[React.createElement介绍](https://zh-hans.react.dev/reference/react/createElement)

最后通过**ReactDOM.createRoot().render()** 方法将这个React元素添加到DOM中。

> 在 React 18 中，`ReactDOM.render()`已被弃用，取而代之的是`ReactDOM.createRoot().render()`：

#### 总结（JSX到真实DOM的流程）

1. 通过Babel将JSX转换成JS
2. 用`React.createElement`来创建用来描述DOM元素的React元素
3. 最终会通过`ReactDOM.createRoot().render()`将React元素添加到真实DOM中。