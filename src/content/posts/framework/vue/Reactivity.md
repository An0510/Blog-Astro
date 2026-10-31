---
title: "Vue3 源码中 Reactivity 浅析"
published: 2022-03-04
description: "根据 mini-vue 进行学习."
tags: ["Vue"]
category: "框架"
---

根据 mini-vue 进行学习.

打开[mini-vue](https://github.com/cuixiaorui/mini-vue)
`pnpm install` 安装依赖。

### Reactive

#### 目的

将一个普通对象转换为 proxy 对象

1. 根据 mini-vue 的源码文件路径 `reactivity/src/reactive.ts` 分析`createReactiveObject(target, proxyMap, baseHandlers)`

   mini-vue

```javascript
// target就是传入的对象
function createReactiveObject(target, proxyMap, baseHandlers) {
...
  const proxy = new Proxy(
    target,
    baseHandlers
  )
...
}
```

在`reactive.ts`中 import 的三个函数(`mutableHandlers/readonlyHandlers/shallowReadonlyHandlers`)是从`reactivity/src/baseHandlers.ts` 文件中 export 的，同时这三个对象也是`createReactiveObject`中的第三个形参 baseHandlers 的入参，也就是`new Proxy`的第二个入参。

2.分析`reactivity/src/baseHandlers.ts` ，根据 MDN 对于[Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)的第二个参数`handler`的定义我们可以明确，导出的这三个对象内可以用 get 和 set 函数来拦截属性。

目前主要关注导出的对象`mutableHandlers` ，因为`reactive(target)`内部用的就是 mutableHandlers。

在`reactive.ts` 中可以看到通过`baseHandlers.ts`引入的三个对象，不同的函数引用的不同的对象作为 proxy 的第二个参数 handler

```javascript
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,} from "./baseHandlers";
...
export function reactive(target) {
  return createReactiveObject(target, reactiveMap, **mutableHandlers**);
}

export function readonly(target) {
  return createReactiveObject(target, readonlyMap, readonlyHandlers);
}

export function shallowReadonly(target) {
  ...
}
function createReactiveObject(target, proxyMap, baseHandlers) {
...
  const proxy = new Proxy(
    target,
    **baseHandlers**
  )
...
```

`baseHandlers.ts` 可以看到 mutableHandlers 是如何被构造的

```javascript
const get = createGetter();
const set = createSetter();
createGetter(isReadonly = false, shallow = false) {
  // 返回get函数
  return function get(target, key, receiver){
    ...
    const res = Reflect.get(target, key, receiver);
    ...
    // 返回通过Reflect.get的值
    return res
  }
}
function createSetter() {
  // 返回set函数
  return function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);

    // 在触发 set 的时候进行触发依赖
    trigger(target, "set", key);

    return result;
  };
}
// 导出给reactive中createReactiveObject作为第二个入参
export const mutableHandlers = {
  get,
  set,
};
```

可以看到 mutableHandlers 这个对象内部有 get 和 set 两个属性函数，这两个函数在设置返回值 res/result 时，采用的是 Reflect 上的 get 和 set 方法。

### effect 核心

配合 Reactive / Ref 达到依赖收集(`track`)和触发依赖(`trigger`)

`src/reactivity/src/effect.ts`

#### effect 的目的(为什么有 effect)

effect 的目的是什么？

下面是对应单测代码` src/reactivity/``**tests**``/effect.spec.ts `，同时也对应 effect 需要做到的功能。

effect 会接受一个函数，当后续 counter.num 改变为 7 时，让 dummy 也跟着改变为 7。

也就是说当 effect 内部包裹的函数内依赖的数据发生变化时，重新执行这个函数，更新数据。

```javascript
it("should observe basic properties", () => {
    let dummy;
    const counter = reactive({ num: 0 });
    effect(() => (dummy = counter.num));
    expect(dummy).toBe(0);
    counter.num = 7;
    expect(dummy).toBe(7);
  });
```

#### effect 是怎么做的

回过头来看 effect 的代码`src/reactivity/src/effect.ts`

关注其中的`effect(fn, options = {})`函数

```javascript
export function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn);
  // 把用户传过来的值合并到 _effect 对象上去
  // 缺点就是不是显式的，看代码的时候并不知道有什么值
  extend(_effect, options);
  // 实际上是执行用户传入的fn。run方法是声明在ReactiveEffect实例上的
  _effect.run();
  ...
}
```

`_effect.run();`执行的是`ReactiveEffect`类给实例对象用的方法

- activeEffect 在更新依赖时用于给下一次的 get

```javascript
export class ReactiveEffect {
  ...
  run() {
      ...
      // 利用全局属性来获取当前的 effect
      activeEffect = this as any;
      // 执行用户传入的 fn
      const result = this.fn();
      ...
      return result;
    }
    ...
  }
```

执行 fn()之后，实际上对应就是调用了上面单测案例中的被 effect 接收的函数`() => (dummy = counter.num)` , 其中 counter 是一个响应式对象，当`couter.name`时实际上就会触发 proxy 实例中的 get 方法，其实对应的就是 baseHandler.ts 中的 get 方法

然后来看`baseHandler.ts`中的`get`

```javascript
const get = createGetter();
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    ...
    const res = Reflect.get(target, key, receiver);

    // 问题：为什么是 readonly 的时候不做依赖收集呢
    // readonly 的话，是不可以被 set 的， 那不可以被 set 就意味着不会触发 trigger
    // 所有就没有收集依赖的必要了
    if (!isReadonly) {
      // 在触发 get 的时候进行依赖收集
      track(target, "get", key);
    }
    ...
    return res;
  };
}
```

可以看到在 get 方法中，只要是非 readonly 的，就会触发`track(target, "get", key);`来收集依赖 ，而`track`是通过 import 从 `effect.ts`中引入的。

接着来分析`effect.ts`中的 track 方法

- 这里的 targetMap 是声明在外部的`const targetMap = new WeakMap();`也就是说是全局公用的，用于存放所有依赖关系。{对象 : depsMap( {对象属性 : dep( { 依赖函数 1，依赖函数 2 等 } ) )} , 数据 2:...}。


```javascript
export function track(target, type, key) {
  ...
  console.log(`触发 track -> target: ${target} type:${type} key:${key}`);
  // 1. 先基于 target 找到对应的 dep
  // 如果是第一次的话，那么就需要初始化
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    // 初始化 depsMap 的逻辑
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  // 作为容器收集依赖
  let dep = depsMap.get(key);

  if (!dep) {
    dep = createDep();
    depsMap.set(key, dep);
  }

  trackEffects(dep);
}
```

```javascript
export function trackEffects(dep) {
  // 用 dep 来存放所有的 effect
  // activeEffect就是每次调用run的那个new ReactiveEffect(fn)生成的实例对象_effect
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    (activeEffect as any).deps.push(dep);
  }
}
```

通过判断 activeEffect，将依赖收集到了 dep 中。依赖实际上就是 ReactiveEffect 实例

在 triggle 相关函数中将 dep 中所有收集的依赖遍历并执行了。

```javascript
export function trigger(target, type, key) {
  // 1. 先收集所有的 dep 放到 deps 里面，
  // 后面会统一处理
  let deps: Array<any> = [];
  // dep
  const depsMap = targetMap.get(target);

  if (!depsMap) return;

  // 暂时只实现了 GET 类型
  // get 类型只需要取出来就可以
  const dep = depsMap.get(key);

  // 最后收集到 deps 内
  deps.push(dep);

  const effects: Array<any> = [];
  deps.forEach((dep) => {
    // 这里解构 dep 得到的是 dep 内部存储的 effect
    effects.push(...dep);
  });
  // 这里的目的是只有一个 dep ，这个dep 里面包含所有的 effect
  // 这里的目前应该是为了 triggerEffects 这个函数的复用
  triggerEffects(createDep(effects));
}
export function triggerEffects(dep) {
  // 执行收集到的所有的 effect 的 run 方法
  for (const effect of dep) {
    if (effect.scheduler) {
      // scheduler 可以让用户自己选择调用的时机
      // 这样就可以灵活的控制调用了
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

```

此处 effect.run 实际上就是再次执行了单元测试里`effect(() => (dummy = counter.num));`中 effect 内部的函数。

### 整体流程

对于单元测试的代码打上断点进行调试

```javascript
it("should observe basic properties", () => {
    let dummy;
    const counter = reactive({ num: 0 });
    effect(() => (dummy = counter.num));
    expect(dummy).toBe(0);
    counter.num = 7;
    expect(dummy).toBe(7);
  });
```

`effect(() => (dummy = counter.num));`可以理解为整个 reactivity 的 init 流程

![](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_1.png)

整体流程就是

1. 执行`effect.ts`下的`effect`函数，传入箭头函数`() => (dummy = counter.num)`
   1. 实例化对象`_effect = new ReactiveEffect(fn)` (ReactiveEffect 的实例上有方法`run()` )
   2. 执行`_effect`上的`run()`方法，在 run 方法内部会执行 effect 函数接收的那个箭头函数`() => (dummy = counter.num)`。
2. 在执行 dummy = `counter.num` 时，由于 counter 是一个 proxy 对象(被 reactive 包装过)，因此触发执行 proxy 拦截的 get 方法，也就是`baseHandlers.ts`里的`createGetter(isReadonly = false, shallow = false)`函数。
   1. 返回通过`Reflect.get(target, key, receiver)`拿到的数据。
   2. 由于该 proxy 实例时 handler 参数为`mutableHandlers`，因此未对`createGetter`的 isReadonly 设置为 true。对于不是只读的对象(也就是说可以被 set 的 proxy 对象)需要进行依赖收集。
   3. 执行依赖收集函数`track(target, "get", key)`
3. 进入`effect.ts`中的`track(target, type, key)`函数。然后执行`trackEffects(dep);` 将所有的`activeEffect`收集到`dep`中。

`counter.num = 7;`对应的就是 reactivity 流程中的 update

![](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_2.png)

整体流程就是

1. 修改 proxy 对象的值，触发 proxy 拦截的 set 方法，也就是`baseHandlers.ts`里的`createSetter()`函数。
   1. `Reflect.set(target, key, value, receiver)`，通过 set 函数返回 Reflect.set 来修改对象内部属性值。
   2. 执行`trigger(target, "set", key);`
2. 执行`effect.ts`中的`trigger`函数触发依赖、更新依赖。从全局属性`targetMap`中取出对应对象的`depsMap`，然后再根据被修改属性取出对应的`dep`。把`dep`中的一个或多个`ReactiveEffect`放入`effects`数组中。然后执行`triggerEffects(createDep(effects));` 将 effects 中所有 effect 进行执行， `effect.run()` 。 （因为 effect 实际上就是`ReactiveEffect`实例对象。）实际上就是执行了 effect 内部的 fn`() => (dummy = counter.num)`，在 run 方法执行的过程中会将当前`ReactiveEffect`实例放到全局数据`activeEffect`上，同时`counter.num`会再次触发 proxy 对象的`get`操作。
3. 触发`get`操作之后又会再次触发`track`收集依赖，此时会更新 targetMap 中对应属性的 dep。`dep.add(activeEffect);` ，若是新增的依赖，会将之前 set 时存放在全局变量`activeEffect`上的`ReactiveEffect`实例新增到 dep 上。
   ![](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_3.png)
