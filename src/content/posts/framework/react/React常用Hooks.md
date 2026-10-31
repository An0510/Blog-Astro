---
title: "React常用Hooks"
published: 2025-06-14
description: "React没提供太多的Hooks，比如 useState、useEffect、useCallback、useMemo、useRef、useContext 等等，…"
tags: ["React"]
category: "框架"
---

React没提供太多的Hooks，比如 useState、useEffect、useCallback、useMemo、useRef、useContext 等等，掌握常用的就可以应对日常90%的开发了。

### useState：让函数式组件能保存状态

前面有说过之所以之前没有函数式组件就是因为函数多次执行无法保存状态，这个Hook就是用来解决这个问题的。也就是说在一个函数式组件多次渲染过程中，这个state是共享的。

```javascript
import React, { useState } from 'react';

function Example() {
  // 创建一个保存 count 的 state，并给初始值 0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>
        +
      </button>
    </div>
  );
}
```

在这个例子中

用useState(0)设置了count的初始值是0，渲染出p标签内容是0

当每次点击button时，调用setCount修改了count后，都会重新执行这个Example函数组件，然后使用useState返回的新的被更改后的count值，再更新对应的DOM节点

总结下就是：

1. useState(initialState) 的参数 initialState 是创建 state 的初始值，它可以是任意类型，比如数字、对象、数组等等。
2. useState() 的返回值是一个有着两个元素的数组。第一个数组元素用来读取 state 的值，第二个则是用来设置这个 state 的值。在这里要注意的是，state 的变量（例子中的 count）是只读的，所以我们必须通过第二个数组元素 setCount 来设置它的值。
3. 如果要创建多个 state，那么我们就需要多次调用 useState。比如要创建多个 state，使用的代码如下：

```typescript
// 定义一个年龄的 state，初始值是 42
const [age, setAge] = useState(42);
// 定义一个水果的 state，初始值是 banana
const [fruit, setFruit] = useState('banana');
// 定一个一个数组 state，初始值是包含一个 todo 的数组
const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
```

> 和之前的类组件的区别，类组件是只维护了一个state对象(如上述例子{age: 42, fruit: 'banana', todos:[text: 'Learn Hooks']})，通过setState更新组件内所有状态。而函数式组件是每个字段都有对应的state，逻辑上更分离，粒度更细。

#### 什么情况下使用state呢？

原则：**state 中永远不要保存可以通过计算得到的值**，如：

1. 从 props 传递过来的值。有时候 props 传递过来的值无法直接使用，而是要通过一定的计算后再在 UI 上展示，比如说排序。那么我们要做的就是每次用的时候，都重新排序一下，或者利用某些 cache 机制，而不是将结果直接放到 state 里。
2. 从 URL / cookie / localStorage中读到的值。比如有时需要读取其中的参数，把它作为组件的一部分状态。那么我们可以在每次需要用的时候从 中中读取，而不是读出来直接放到 state 里。

> 如果通过一些状态管理框架，去管理所有组件的 state 的话，比如Redux，那么组件本身就可以是无状态的。无状态组件可以成为更纯粹的表现层，没有太多的业务逻辑，从而更易于使用、测试和维护。

### useEffect：执行副作用

useEffect ，顾名思义，用于执行一段副作用。

> 副作用就是除了计算外,对当前函数执行上下文或是宿主,外部环境造成影响的, 就是副作用。比如
- 操作DOM
- 订阅事件
- 接口请求
- 改变全局变量
- 调用浏览器的个别API(setTimeout)。

#### 为什么需要useEffect

React采用声明式编程，组件函数应该是纯函数，也就是相同的输入总是产生相同的输出，不包含任何副作用。但是实际开发过程中我们不可避免的需要执行副作用操作，比如接口请求，操作DOM，订阅事件等

所以React设计了这么一个Hooks用来执行这些副作用操作
1. 在组件渲染后执行，不阻塞UI渲染
2. 可以通过依赖数组控制执行时机
3. 提供清除机制，防止内存泄漏

#### useEffect方法介绍

https://zh-hans.react.dev/reference/react/useEffect

 `useEffect(setup, dependencies?)`

- `setup`：处理 Effect 的函数。setup 函数选择性返回一个 **清理（cleanup）** 函数。当组件被挂载并且绘制渲染完成后，React 将运行 setup 函数。
	- **清理（cleanup）** 函数在两种情况下执行。
		1. 在每次依赖项变更重新渲染后，React 将首先使用旧值运行 cleanup 函数（如果你提供了该函数），然后使用新值运行 setup 函数。
		2. 在组件从 DOM 中移除后，React 将最后一次运行 cleanup 函数。
- **可选** `dependencies`：`setup` 代码中引用的数据，如 **props**、**state** 以及所有直接在组件内部声明的变量和函数。如果你的代码检查工具[配置了 React](https://zh-hans.react.dev/learn/editor-setup#linting)，那么它将验证是否每个响应式值都被正确地指定为一个依赖项。依赖项列表的元素数量必须是固定的，并且必须像 `[dep1, dep2, dep3]` 这样内联编写。React 将使用[Object.is](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is)来比较每个依赖项和它先前的值。如果省略此参数，则在每次重新渲染组件之后，将重新运行 Effect 函数。如果你想了解更多，请参见[传递依赖数组、空数组和不传递依赖项之间的区别](https://zh-hans.react.dev/reference/react/useEffect#examples-dependencies)。
 >这里官方文档说的响应式值包括state和props感觉并不准确，在React里props和state是声明式的更准确。而Vue才是响应式的，Vue的响应式数据改变后会自动渲染(自动依赖追踪)，而React中渲染的源头是手动的行为(setState)，只是父组件重新渲染会间接重新渲染子组件。

>跟Vue的响应式不同，dependencies中的比对不是响应式的，Vue是在数据变化的时候处理回调，React是在重新渲染时才会用Object.is比对后才执行回调。

有三种使用方式

- 指定依赖项，setup会在初始渲染后执行以及每次依赖项变化时执行
- 空依赖项数组，setup仅在初始渲染后执行一次
- 无依赖项数组，setup在初始渲染后执行一次以及每次组件重新渲染后执行

常见的就是指定依赖项，比如根据不同的博客id渲染不同的博客内容
```javascript
import React, { useState, useEffect } from "react";

function BlogView({ id }) {
  // 设置一个本地 state 用于保存 blog 内容
  const [blogContent, setBlogContent] = useState(null);

  useEffect(() => {
    // useEffect 的 callback 要避免直接的 async 函数，需要封装一下
    const doAsync = async () => {
      // 当 id 发生变化时，将当前内容清楚以保持一致性
      setBlogContent(null);
      // 发起请求获取数据
      const res = await fetch(`/blog-content/${id}`);
      // 将获取的数据放入 state
      setBlogContent(await res.text());
    };
    doAsync();
  }, [id]); // 使用 id 作为依赖项，变化时则执行副作用

  // 如果没有 blogContent 则认为是在 loading 状态
  const isLoading = !blogContent;
  return <div>{isLoading ? "Loading..." : blogContent}</div>;
}
```

> 对于依赖项有哪些需要注意的呢？

1. 依赖项中定义的变量一定是会在回调函数中用到的，否则声明依赖项其实是没有意义的。
2. 依赖项一般是一个字面量数组，而不是一个变量。因为一般在创建 callback 的时候，你其实非常清楚其中要用到哪些依赖项了。
	- 比如`useEffect(() => {}, [variable])` 而不是`const deps = [variable];useEffect(() => {}, deps) `
3. React在监听依赖项变化时使用的是浅比较(Object.is)，对于函数式组件如果每次重新定义引用变量会导致重复渲染。
	如：
```javascript
function Sample() {
  // 这里在每次组件执行时创建了一个新数组
  const todos = [{ text: 'Learn hooks.'}];
  useEffect(() => {
    console.log('Todos changed.');
  }, [todos]);
}
```
	 todos每次都是重新创建的，导致引用地址不同，从而会导致更新

### useCallback: 缓存回调函数

#### 为什么需要useCallback？

通过前面的`useState`我们知道这是React为了解决函数式组件多次执行无法保存状态设计出来的Hooks。因为函数式组件会重复执行，如果在函数式组件中声明函数，则函数也会被反复声明从而反复重新被创建，`useCallback`就是为了函数多次执行保存函数引用而设计出来的。

举个例子
```js
function Counter() {
  const [count, setCount] = useState(0);
  const handleIncrement = () => setCount(count + 1);
  // ...
  return <button onClick={handleIncrement}>+</button>
}
```
对于Counter这个组件，如果count变化时，组件会重新渲染，组件重新渲染后handleIncrement又会重新被创建，从而导致作为button的props，让button也被重新渲染了。
**不妙的就是每次执行函数式组件时内部重新创建了函数，导致接受函数的组件被重新渲染**。用来解决这个问题的Hooks就是useCallback，让函数在需要更新捕获的闭包(如count)时才重新声明。
改造后如下
```js
import React, { useState, useCallback } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const handleIncrement = useCallback(
    () => setCount(count + 1),
    [count], // 只有当 count 发生变化时，才会重新创建回调函数
  );
  // ...
  return <button onClick={handleIncrement}>+</button>
}
```
此时handleIncrement只有在count数据变化时，才会重新声明捕获count这个闭包，从而达到减少重复声明handleIncrement以及渲染button的目的。

#### useCallback 方法介绍

https://zh-hans.react.dev/reference/react/useCallback

`useCallback(fn, dependencies)`

- `fn`：想要缓存的函数。此函数可以接受任何参数并且返回任何值。
	- 在初次渲染时，React 将把函数返回给你（而不是调用它！）。
	- 当进行下一次渲染时，也就是渲染过程中，判断`dependencies` 相比于上一次渲染时没有改变
		- 没有改变，那么 React 将会返回相同的函数。
		- 有改变，React 将返回在最新一次渲染中传入的函数，并且将其缓存以便之后使用。这个Hooks不会调用此函数，只是返回此函数。你可以自己决定何时调用以及是否调用。
- `dependencies`：有关是否更新 `fn` 的相关数据，包括 props、state，和所有在你组件内部直接声明的变量和函数。如果你的代码检查工具[配置了 React](https://zh-hans.react.dev/learn/editor-setup#linting)，那么它将校验每一个正确指定为依赖的响应式值。依赖列表必须具有确切数量的项，并且必须像 `[dep1, dep2, dep3]` 这样编写。和useEffect的dependencies一样，React 使用[`Object.is`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is)比较每一个依赖和它的之前的值。这里的dependencies数组里的数据就是那些函数需要更新的闭包内容。

除了useCallback， useMemo也是为了缓存设计的，只不过useCallback缓存的是函数，而useMemo缓存的是计算的结果。

### useMemo: 缓存计算的结果

#### 为什么需要useMemo?

跟useCallback类似，是因为默认情况下组件重新渲染时会重新运行整个组件函数，如果组件函数内部有复杂的计算逻辑，即使依赖数据没有变化也会重新计算执行，这样可能会导致以下问题：
1. 计算开销过大：比如大量数据处理，循环，复杂逻辑的场景，可能阻塞主线程渲染导致浏览器卡顿。
2. 渲染性能下降：比如某个子组件依赖的引用数据(对象、数组等)内容并未产生变化，但是重新执行函数组件时会重新声明导致引用数据地址更新，从而使这个子组件重新渲染，是不必要的渲染。

举个例子

对于一个显示用户信息的列表，需要对用户名进行搜索，根据关键字显示过滤后的用户。这个功能需要两个状态
1. 搜索内容
2. 列表数据
```js
import React, { useState, useEffect } from "react";

export default function SearchUserList() {
  const [users, setUsers] = useState(null);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    const doFetch = async () => {
      // 组件首次加载时发请求获取用户数据
      const res = await fetch("https://reqres.in/api/users/");
      setUsers(await res.json());
    };
    doFetch();
  }, []);
  let usersToShow = null;

  if (users) {
    // 无论组件为何刷新，这里一定会对数组做一次过滤的操作
    usersToShow = users.data.filter((user) =>
      user.first_name.includes(searchKey),
    );
  }

  return (
    <div>
      <input
        type="text"
        value={searchKey}
        onChange={(evt) => setSearchKey(evt.target.value)}
      />
      <ul>
        {usersToShow &&
          usersToShow.length > 0 &&
          usersToShow.map((user) => {
            return <li key={user.id}>{user.first_name}</li>;
          })}
      </ul>
    </div>
  );
}
```
这个代码乍看过去没问题，但是userToShow的计算逻辑不论组件因为什么而重新渲染都会重新执行，而实际上我们想要的效果是当搜索内容或者列表数据变化时才重新执行
通过useMemo改造下计算相关内容
```js
//...
// 使用 userMemo 缓存计算的结果
const usersToShow = useMemo(() => {
    if (!users) return null;
    return users.data.filter((user) => {
      return user.first_name.includes(searchKey));
    }
  }, [users, searchKey]);
//...
```
此时就能达到我们的目的了，只会在搜索内容和列表数据变化才计算，除了可以避免计算。
实际上useMemo是可以用于实现useCallback的，两者本质上都是让组件在多次渲染中缓存一个数据
```js
useCallback(fn, deps) === useMemo(() => fn, deps)
```
#### useMemo方法介绍

https://zh-hans.react.dev/reference/react/useMemo

 `useMemo(calculateValue, dependencies)`

- `calculateValue`：要缓存计算值的函数。是一个没有任何参数的纯函数，并且可以返回任意类型。
	- React 将会在首次渲染时调用该函数；
	- 在之后的渲染中，如果 `dependencies` 没有发生变化，React 将直接返回相同值。否则，将会再次调用 `calculateValue` 并返回最新结果，然后缓存该结果以便下次重复使用。
    
- `dependencies`：所有在 `calculateValue` 函数中使用的响应式变量组成的数组。响应式变量包括 props、state 和所有你直接在组件中定义的变量和函数。如果你在代码检查工具中[配置了 React](https://zh-hans.react.dev/learn/editor-setup#linting)，它将会确保每一个响应式数据都被正确地定义为依赖项。依赖项数组的长度必须是固定的并且必须写成 `[dep1, dep2, dep3]` 这种形式。React 使用[`Object.is`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is)将每个依赖项与其之前的值进行比较。

### useRef: 在多次渲染之间共享数据

#### 为什么需要useRef?

跟上面的useMemo有相似的地方，都是具有`记忆功能` ，也就是能在组件多次渲染时保证数据的持久性，而且都不会因为值改变而触发组件重新渲染。只是useRef是返回一个包含current属性的对象，current属性就是用来修改后保存数据的。

`useRef` 主要是用于
1. 存储可变值
	- 存储不需要展示在页面上的数据(如分页参数)
	- 保存定时器ID或是上一次props的值
2. 访问DOM元素
	 - 需要访问DOM元素进行操作
##### 存储可变值

存储分页参数
```js
const queryRef = useRef({
  code1: '',
  code2: ''
});

const PrintBtn = () => {
  console.log('testBtn', queryRef.current); // 永远都是获取到最新的值
};

```
保存定时器ID或是上一次props的值
```js
function TimerComponent() {
  const intervalId = useRef(null);
  const handleStart = () => {
    intervalId.current = setInterval(() => {
      console.log('Timer tick');
    }, 1000);
  };
  const handleStop = () => {
    clearInterval(intervalId.current);
  };
  return (
    <div>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
}

```
```js
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

```
##### 访问DOM元素

访问DOM元素并操作

```js
import React, { useRef } from 'react';

function TextInputWithFocusButton() {
  const inputEl = useRef(null);

  const onButtonClick = () => {
    inputEl.current.focus();
  };

  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}

```
> 操作DOM这个和Vue看起来差不多，区别是Vue绑定的ref是响应式的，React的这个修改current也不会更改

#### useRef的用法

`useRef(initialValue)`

https://zh-hans.react.dev/reference/react/useRef

##### 参数 
initialValue：ref 对象的 current 属性的初始值。可以是任意类型的值。这个参数在首次渲染后被忽略。
##### 返回值 
useRef 返回一个只有一个属性current的对象:
current：初始值为传递的 initialValue。之后可以将其设置为其他值。如果将 ref 对象作为一个 JSX 节点的 ref 属性传递给 React，React 将为它设置 current 属性。
在后续的渲染中，useRef 将返回同一个对象。


### useContext: 定义全局状态

#### 为什么需要useContext?

主要是为了解决React中多层组件 `props drilling` (逐层传递props) 的困扰，用于跨层级数据传递，React提供了Context机制，可以在某个组件树根节点上挂Context，所有该组件树下子节点都可以访问或修改这个Context，每当修改Context时，使用该Context的组件就会重新执行渲染，在函数式组件中，就是使用useContext来管理Context

直接看一个例子，用于获取主题的
```js
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};
// 创建一个 Theme 的 Context
const ThemeContext = React.createContext(themes.light);
function App() {
  // 整个应用使用 ThemeContext.Provider 作为根组件
  return (
    // 使用 themes.dark 作为当前 Context 
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 在 Toolbar 组件中使用一个会使用 Theme 的 Button
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

// 在 Theme Button 中使用 useContext 来获取当前的主题
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{
      background: theme.background,
      color: theme.foreground
    }}>
      I am styled by theme context!
    </button>
  );
}
```
可以看到这是一个按钮获取theme的代码
1. 通过React.createContext声明了一个Context数据，初始值是theme.light。
2. ThemeContext.Provider是声明在组件树根节点上的，value用于接收初始值themes.dark。
3. App的子组件Toolbar的子组件ThemedButton可以通过useContext获取到当前theme从而改变自己的按钮颜色。
如果希望实现点击按钮切换主题，只需要让Context传入的值变化，可以通过state，如
```js
//...
function App() {
  const [theme, setTheme] = useState('light');
  const changeTheme = useCallback(() => {
    console.log('changeTheme');
    setTheme((prevTheme) => (
      prevTheme === 'light' ? 'dark' : 'light'
    ));
  }, []);
  // 整个应用使用 ThemeContext.Provider 作为根组件
  return (
    // 使用 themes.dark 作为当前 Context 
    <ThemeContext.Provider value={themes[theme]}>
      <Toolbar changeTheme={changeTheme}/>
    </ThemeContext.Provider>
  );
}

// 在 Toolbar 组件中使用一个会使用 Theme 的 Button
function Toolbar(props) {
  return (
    <div>
      <ThemedButton changeTheme={props.changeTheme}/>
    </div>
  );
}

// 在 Theme Button 中使用 useContext 来获取当前的主题
function ThemedButton(props) {
  const theme = useContext(ThemeContext);
  return (
    <button
    onClick={props.changeTheme}
    style={{
      background: theme.background,
      color: theme.foreground
    }}>
      I am styled by theme context!
    </button>
  );
}
```
1. 点击Button
2. 通过props.changeTheme修改ThemeContext
3. ThemedButton因为使用了ThemeContext因此重新执行，获取到最新的theme并渲染

可以看到Context提供了一个多个组件中共享数据的能力，但是这样的方式可能会有一些负面影响：
1. 调试会困难，不好追踪Context的改变
2. 组件复用困难，比如一个组件如果用了Context，那就必须确保父组件里有Context的Provider
在React中除了Theme、Language等一目了然需要全局设置的变量，很少会使用到Context，但是一些库还是用到了，比如React Flow、Antd的Form等

### 总结

执行顺序如下
```
组件渲染开始
↓
执行 useContext (读取Context值，可能触发重新渲染)
↓
执行 useState/useReducer (可能触发状态更新)
↓
执行 useRef (创建/获取可变引用)
↓
执行 useMemo (可能执行计算逻辑)
↓
执行 useCallback (创建函数引用)
↓
渲染 JSX
↓
组件渲染完成
↓
执行 useLayoutEffect (同步副作用，DOM变更前)
↓
执行 useEffect (异步副作用，DOM变更后)
```
