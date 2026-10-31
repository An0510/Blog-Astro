---
title: "React为什么有Hooks"
published: 2025-06-04
description: "React组件本质就是Model到View的映射。"
tags: ["React"]
category: "框架"
---

React组件本质就是Model到View的映射。

![img](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/202506050003651.png)

在没有React框架时，我们需要再Model处理时，手动去处理DOM节点如何变化的细节问题。

通过React，我们可以使用JSX，根据Model的状态变化，使UI自动变化，这就是数据绑定。

因此可以把UI的展示看成是函数执行的过程，Model是入参，执行结果是View(DOM树)，当Model变化时，函数重新执行，生成新的DOM树，然后React通过性能最优的方式把新的DOM树更新到浏览器。

此前用Class作为组件是不是合理呢？

首先使用Class作为React的组件有点牵强：

1.不用继承，比如组件ButtonGroup，不会继承Button来实现。

2.很少从外部调用组件实例的方法，组件的方法都是在内部调用。

但是当时有局限，函数组件无法存在内部状态，必须是纯函数，而且也无法提供完整的生命周期机制。这就极大限制了函数组件的大规模使用。 并且React官方也是宣扬组合(Composition)大于继承(inherit)，一说到组合，那必然是想到函数式编程，是函数式编程的核心思想之一。

### Hooks是如何诞生的？

根据上述我们可以意识到，如果想让函数式组件用起来，那就要解决函数式组件没有状态的问题，也就是要给函数式组件加上状态。

函数和对象是不一样的，实例对象可以在多次渲染时保存状态，而函数则需要额外的空间去保存状态。

对应的就是函数需要有一个机制，将状态绑定到函数执行，当数据变化时，函数自动执行。这样任何影响UI的状态，都可以通过这个机制绑定到React的函数式组件上，并且在修改状态时，执行函数从而重新渲染组件。

在React中，这个机制就是Hooks。

Hook就是钩子的意思

> 什么是钩子？钩子的工作方式类似：

1. 建立连接
   - 你将代码"钩"到某个数据源或事件源上
   - 这就像把鱼钩放入水中，等待鱼的到来
2. 自动响应
   - 当数据变化或事件发生时，钩子会自动触发
   - 就像鱼咬钩时，你会感知到并拉竿
3. 无需持续监控
   - 你不需要不断检查数据是否变化
   - 系统会在合适的时机通知你，就像鱼咬钩时鱼线会动

对于函数式组件如下图

![img](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/202506050003078.png)

Execution，例如就是函数式组件本身，State、URL就类似于被绑定(钩住)的状态，当被钩住的状态发生变化时，就会重新执行函数，产生更新后的结果

还有一点需要注意，Hooks 中被钩的对象，不仅可以是某个独立的数据源，也可以是另一个 Hook 执行的结果，这就带来了 Hooks 的最大好处：逻辑的复用。

### Hooks最大的好处：逻辑复用

在之前的React中最让人诟病的就是逻辑复用，必须要借助高阶组件或是**Render Props**模式。但这两种方式都会产生冗余的节点，不便于调试和维护，而通过Hooks就可以很好的解决逻辑复用的问题。

举个例子，比如要实现一个根据不同窗口大小，展示不同组件的功能，需要逻辑可以复用的情况下，分别用高阶组件和Render Props实现的话如下

高阶组件

```javascript
const withWindowSize = Component => {
  // 产生一个高阶组件 WrappedComponent，只包含监听窗口大小的逻辑
  class WrappedComponent extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        size: this.getSize()
      };
    }
    componentDidMount() {
      window.addEventListener("resize", this.handleResize); 
    }
    componentWillUnmount() {
      window.removeEventListener("resize", this.handleResize);
    }
    getSize() {
      return window.innerWidth > 1000 ? "large" ："small";
    }
    handleResize = ()=> {
      const currentSize = this.getSize();
      this.setState({
        size: this.getSize()
      });
    }
    render() {
      // 将窗口大小传递给真正的业务逻辑组件
      return <Component size={this.state.size} />;
    }
  }
  return WrappedComponent;
};
```

Render Props模式

```javascript
 // 一个提供窗口大小的 Render Prop 组件
 class WindowSizeProvider extends React.Component {
   constructor(props) {
     super(props);
     this.state = { size: this.getSize() };
   }
   componentDidMount() { /* ...监听逻辑... */ }
   componentWillUnmount() { /* ...移除监听... */ }
   getSize() { /* ...获取大小... */ }
   handleResize = () => { /* ...更新state... */ }

   render() {
     // 调用 render prop，并将 state 作为参数传递
     return this.props.render(this.state);
   }
 }

 // 使用 Render Prop 组件
 class MyComponent extends React.Component {
   render() {
     return (
       <WindowSizeProvider
         render={({ size }) => { // 接收 size
           if (size === "small") return <SmallComponent />;
           else return <LargeComponent />;
         }}
       />
     );
   }
 }
```

可以看到以上两种方式都是套了一层组件壳子。

再来看看Hooks是怎么实现的

```javascript
const getSize = () => {
  return window.innerWidth > 1000 ? "large" : "small";
}
const useWindowSize = () => {
  const [size, setSize] = useState(getSize());
  useEffect(() => {
  const handler = () => {
      setSize(getSize())
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
  
  return size;
};

const Demo = () => {
  const size = useWindowSize();
  if (size === "small") return <SmallComponent />;
  else return <LargeComponent />;
};
```

函数式组件通过useEffect将类组件的生命周期的代码聚合到了一个统一的副作用函数中了。

与之前展示的老方案相比，这个使用 Hooks 的实现有以下优势：

- **更简洁**：代码量明显减少
- **更直观**：逻辑流程更加清晰，没有嵌套的组件层级
- **更灵活**：可以在任何函数组件中使用，不需要包装整个组件
- **避免了 props 透传**：不需要通过 props 层层传递数据

展示了为什么 React Hooks 在推出后迅速成为管理组件状态和副作用的首选方式。

### Hooks的另一大好处：有助于关注分离

Hooks能让针对同一个业务逻辑的代码尽可能的聚合在一块，这样的好处就是关注点分离。

比如上面例子中，Class组件需要将同一个业务逻辑的代码分离在各个生命周期方法中，但是通过Hooks的方式可以把业务代码聚合在一起。

比如在绑定和解绑事件需要在componentDidMount、componentWillUnmount中去写，而Hooks可以把这两个逻辑写在一起。

React社区的一张图可以详细展示这之间的区别

![img](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/202506050003075.png)

> 这和Vue3的设计思路也是相同的，Vue2⇒Vue3从上窜下跳写法变成了Composition API写法，目的也是将业务逻辑聚合起来。

### 总结

Hooks更好的体现了React在State ⇒ View的函数映射开发思想。

Hooks解决了Class组件的代码冗余，逻辑复用复杂的问题。

> 吐槽：
> 相较于React的极致向后兼容，Vue确实变化的大了点... React像是稳健派，Vue是激进的改革派 
> 从函数式编程和逻辑复用的角度来看，Vue3并不像React做的那么彻底。比如Vue3虽然有watchEffect，但是watchEffect不能像useEffect那样在卸载时清理副作用函数，也就是没法像React那样完全彻底的聚合业务逻辑并且替代生命周期，Vue3的生命周期依然存在感很强。 从思考角度上来说，React更关注对依赖数据的副作用处理，而Vue3更关注响应式数据变化引发的副作用处理。

| 维度             | React（Hooks）                  | Vue 3（Composition API）                |
| ---------------- | ------------------------------- | --------------------------------------- |
| **编程范式**     | 函数式优先，组件即函数          | 响应式驱动 + 类似函数式                 |
| **副作用管理**   | `useEffect`自动响应依赖变化     | `watchEffect`需手动清理，需配合生命周期 |
| **状态更新机制** | 手动触发（useState / setState） | 自动追踪响应式数据（ref / reactive）    |
| **生命周期控制** | 生命周期抽象化，不显式暴露      | 明确生命周期钩子（onMounted 等）        |
| **学习曲线**     | 更偏向函数式思维，有一定门槛    | 更直观，适合渐进式学习                  |

对于React，更函数式，优势是

- 副作用与生命周期解耦，`useEffect`不绑定具体生命周期阶段，而是基于依赖项变化自动执行。
- 逻辑聚合能力强，多个相关逻辑可以集中在一个`useEffect`或自定义 Hook 中，而不是分散在多个生命周期中。

对于Vue3，更响应式，优势是

- 响应式系统自动追踪依赖，不需要像React写出[deps]依赖数组，只要改变了响应式变量，就会自动重新运行副作用。
- 生命周期还存在，直观容易调试。
- 性能优化更容易：Vue本身会自动做性能优化，不用像React需要通过`React.memo`,`useCallback`,`useMemo`手动优化。