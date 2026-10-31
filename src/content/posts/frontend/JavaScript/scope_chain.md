---
title: "作用域链查找"
published: 2021-11-02
description: "词法作用域就是根据函数的声明位置来决定的，所以词法作用域是静态作用域。"
tags: ["JavaScript"]
category: "前端基础"
---

### 词法作用域

**词法作用域就是根据函数的声明位置来决定的，所以词法作用域是静态作用域。**

**在每个执行上下文的变量环境中，都包含了一个外部引用，用来指向外部的执行上下文，我们把这个外部引用称为 outer**。

```javascript
function bar() {
  console.log(myName);
}
function foo() {
  var myName = "极客邦";
  bar();
}
var myName = "极客时间";
foo();
```

这段代码中函数执行上下文通过 outer 指向的执行上下文找 myName

![image-20210808153718973.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210808153718973.png)

下面这个函数你认为应该输出 Q 还是 A 呢？

```javascript
//例1
function bar() {
  return myName;
}
function foo() {
  var myName = "Q";
  return bar();
}
var myName = "A";
foo();
```

那再换一种写法,这个该输出 Q 还是 A 呢？

```javascript
//例2
function foo() {
  var myName = "Q";
  function bar() {
    return myName;
  }
  return bar();
}
var myName = "A";
foo();
```

答案是例 1 输出 A，例 2 输出 Q。为什么会这样呢，可以看到两段代码最主要的区别就是 function bar 的声明位置。这里需要引入一个概念叫做词法作用域，词法作用域决定了作用域链，作用域链就是函数查找变量的一条链子。

**词法作用域**：词法作用域是指作用域是由代码中函数声明的位置(对应上面也就是 bar()的声明位置)决定的，因此词法作用域是静态的作用域，通过它就可以预测代码在执行过程中如何查找标识符(在上面的意思就是如何找变量 myName)

什么叫根据函数声明的位置决定函数的作用域，就拿例 2 来说

![image-20210802222856007.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210802222856007.png)

![image-20210802223957303.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210802223957303.png)

bar 的函数作用域就是粉色框部分，而 foo 的函数作用域就是蓝色框部分，而全局作用域则是红色框框起来的部分。作用域链为上图

再来分析例 1

![image-20210802223232200.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210802223232200.png)

![image-20210802223914770.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210802223914770.png)

bar 作用域依旧是粉色，foo 作用域依旧是蓝色，全局作用域是红色，但是，此时 bar 已经不是在 foo 中定义的了，因此作用域链跟上面不同了。

**作用域链**就是函数查找变量的链路，这也就解释了为什么例 1 会输出 A，因为 bar 先找自己发现没有 myName，就直接去全局作用域找的。而例 2 输出 Q 是因为 bar 是在 foo 作用域中先找的，找到然后就输出，当然如果例 2 中 foo 中没有找到就会沿着作用域链找到全局作用域中的 myName，检验一下

```javascript
function bar() {
  return myName;
}
function foo() {
  return bar();
}
var myName = "A";
foo(); //A
```

结论：再次强调词法作用域是根据函数声明位置决定的，也就是说**词法作用域是在代码编译阶段就决定好的，和函数的调用位置没有关系**。

### 块级作用域中的变量查找

看一段代码

```javascript
function bar() {
  var myName = "极客世界";
  let test1 = 100;
  if (1) {
    let myName = "Chrome浏览器";
    console.log(test);
  }
}
function foo() {
  var myName = "极客邦";
  let test = 2;
  {
    let test = 3;
    bar();
  }
}
var myName = "极客时间";
let myAge = 10;
let test = 1;
foo();
```

压入全局上下文：变量环境 var myName = "极客时间" 词法环境 test = 1 myAge = 10

执行 foo()

压入 foo 执行上下文 : 变量环境 myName = "极客邦" 词法环境 test = 2 test = 3 叠在上层(后压入的，执行完块({}包裹的代码)就被弹出)

执行 bar()

压入 bar 执行上下文：变量环境 myName = "极客世界" 词法环境 test1 = 100 myName = "Chrome 浏览器"(if 代码块后压入)

查找过程 1，2，3，4，5，先找当前作用域下的词法环境，然后是变量环境，父作用域的词法环境，变量环境。

![image-20210807203022977.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807203022977.png)

输出结果为 1，因为 bar 的作用域链就是 bar->全局。
