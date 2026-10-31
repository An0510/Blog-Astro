---
title: "闭包解析"
published: 2021-11-02
description: "本文主要是从两个方面解析闭包：作用域、内存"
tags: ["JavaScript"]
category: "前端基础"
---

本文主要是从两个方面解析闭包：作用域、内存

## 作用域角度理解闭包

**闭包产生的本质是当前环境中存在指向父级作用域的引用。**

要理解闭包的话需要你理解变量环境，词法环境和作用域链的概念。

上一段代码

```javascript
function foo() {
  var myName = "极客时间";
  let test1 = 1;
  const test2 = 2;
  var innerBar = {
    getName: function () {
      console.log(test1);
      return myName;
    },
    setName: function (newName) {
      myName = newName;
    },
  };
  return innerBar;
}
var bar = foo();
bar.setName("极客邦");
bar.getName();
console.log(bar.getName());
```

当执行到 return innerBar 的时候调用栈是什么样

![image-20210807210534064.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807210534064.png)

由代码可知 innerBar 是一个对象，包含了 getName 和 setName 两个方法，这两个方法都是在 foo 函数内部定义的，这两个方法使用了 myName 和 test1 这两个变量。

**根据词法作用域的规则，内部函数 getName 和 setName 总是可以访问它们的外部函数 foo 中的变量**，所以当 innerBar 对象返回给全局变量 bar 的时候，虽然此时 foo 函数以及执行完毕，但是 getName 和 setName 函数还是可以使用 foo 函数中的变量 myName 和 test1。所以当 foo 执行完毕后，调用栈变成了：

![image-20210807211401970.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807211401970.png)

可以看到 foo 执行完毕，他的执行上下文弹出了，可是留下了一坨东西，两函数用到的这两个变量依然还在内存中，就好像是专门为 setName 和 getName 准备的一个专属背包(这个背包里放的是这两个函数用到的，没用到的比如 test2 就没有)，无论在哪里调用了 setName 和 getName，他们都会从这个背包里拿东西和操作。这个专属背包，除了 setName 和 getName 之外其他地方是无法访问的，可以把这个背包称为 foo 函数的闭包。

那闭包是如何使用的，当执行到 bar.setName 方法中的 myName = "极客邦"的时候，JavaScript 会沿着**当前 setName 的执行上下文->foo 的闭包->全局执行上下文**的顺序来查找 myName 变量。此时调用栈如下图

![image-20210807221122271.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210807221122271.png)

当然 getName 也是从 foo 闭包中获取。

从开发者工具中也能查看到闭包的情况

![image-20210807221706655.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807221706655.png)

![image-20210807221756546.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807221756546.png)

Global 代表全局执行上下文，**Scope 中体现的就是作用域链**，从上到下。

结论:可以给闭包下一个定义了。**在 JavaScript 中，根据词法作用域的规则，内部函数总是可以访问外部函数中声明的变量，当通过调用一个外部函数返回内部函数后，即使外部函数执行完毕，但是内部函数引用外部函数的变量依然保存在内存中，我们把这些变量的集合称为闭包，比如外部函数是 foo 函数，那这些变量的集合就称为 foo 函数的闭包**。

那闭包该如何回收呢？什么时候闭包才会被销毁，因为闭包如果使用不正确，很容易造成内存泄漏的，通常，如果引用闭包的函数是一个全局变量，那么闭包会一直存在直到页面关闭；但如果这个闭包以后不再使用的话，就会造成内存泄漏。

> 内存泄漏：程序中已动态分配的堆内存由于某种原因程序未释放或无法释放，造成系统内存的浪费，导致程序运行速度减慢甚至系统崩溃等严重后果。

解决方法：**如果引用闭包的函数是局部变量，等函数销毁之后，下次 JavaScript 引擎执行垃圾回收的时候，判断闭包这部分不使用了，JavaScript 引擎的垃圾回收期就会回收这块内存**。

## 内存角度讲解闭包

**作用域内的原始类型数据会被存储到栈空间，引用类型则会被存储到堆空间。**

引例

```javascript
function foo() {
  var myName = "极客时间";
  let test1 = 1;
  const test2 = 2;
  var innerBar = {
    setName: function (newName) {
      myName = newName;
    },
    getName: function () {
      console.log(test1);
      return myName;
    },
  };
  return innerBar;
}
var bar = foo();
bar.setName("极客邦");
bar.getName();
console.log(bar.getName());
```

#### 首先盘一下执行流程

1. 首先先创建全局执行上下文并压入调用栈中
   - 全局执行上下文
     - 变量环境：bar = undefined foo(){...}
     - 词法环境：空
2. 执行 foo，将返回的 innerBar 给 bar

   1. 执行前首先会编译 foo 函数。创建一个空的执行上下文。
   2. JavaScript 引擎对 foo 的内部函数做一次词法扫描，首先是 setName 函数，发现函数内部引用了 foo 函数的 myName，由于是内部函数引用了外部函数的变量，因此 JavaScript 引擎判断这是一个闭包，因此就会在堆空间中创建一个“closure(foo)”指向的对象（这是一个内部对象，JavaScript 是无法访问的）
   3. 接着到另一个内部函数 getName，JS 引擎接着词法扫描，发现这个内部函数还引用了外部的 foo 函数的 test1，于是 JS 引擎又将 test1 添加到了“closure(foo)”对象中，这时候堆中的“closure(foo)”对象包含了 myName 和 test1 两个变量。
   4. 由于 test2 并没有被内部函数引用，所以 test2 依然保存在调用栈中 foo 执行上下文的词法环境中。

      此时的 foo 执行上下文

![image-20210811234914948.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210811234914948.png)

5. 当 return 返回对象 innerBar 之后，foo 的执行上下文弹出调用栈，但是由于返回的对象 innerBar 存在指向其父级作用域的引用，产生了闭包 closure(foo)，还依然存在在堆空间中。
6. 所以当执行到`bar.setName("极客邦");bar.getName();`依然可以访问到 closure(foo)这个闭包对象里的属性。

#### 总结

产生闭包的核心有两步：

第一步是需要预扫描内部函数；

第二步是把内部函数引用的外部变量保存到堆中。

当前环境存在指向父级作用域的引用。也就是子函数用到了父级作用域链上的东西。