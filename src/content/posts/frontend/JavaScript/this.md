---
title: "从执行上下文的角度讲解 this"
published: 2021-11-06
description: "JavaScript 的作用域链由词法作用域决定，为什么还需要 this，以及 this 在不同执行上下文中的指向。"
tags: ["JavaScript"]
category: "前端基础"
---

## 为什么要有 this?

先看一段代码

```javascript
var bar = {
  myName: "time.geekbang.com",
  printName: function () {
    console.log(myName);
  },
};
function foo() {
  let myName = "极客时间";
  return bar.printName;
}
let myName = "极客邦";
let _printName = foo();
_printName();
bar.printName();
```

按照常理来说，大多数语言在执行 bar.printName()的时候会输出 bar 对象中的 myName 而不是全局的 myName.而 JavaScript 却输出的是全局中的变量，**这是因为 JavaScript 语言的作用域链是由词法作用域决定的，而词法作用域是由代码结构决定的**。

**对象内部的方法要使用对象内部的属性是一个普遍的需求**，**但是 JavaScript 的作用域机制并不支持这一点**，**基于这个原因，JavaScript 又有一套 this 机制来处理**。

如何让对象中的函数能读取到对象中的属性呢，改造一下上述代码

```javascript
var bar = {
  myName: "time.geekbang.com",
  printName: function () {
    console.log(this.myName);
  },
};
let myName = "全局作用域";
bar.printName();
```

这样就可以获取到了。

**首先你需要明白一件事，就是作用域链和 this 是两套不同的系统，两者之间没有太多的联系**

## this 是什么？

之前有说执行上下文中包括变量环境，词法环境和 outer，其实还包括了 this。

![image-20210808154914549.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210808154914549.png)

this 和执行上下文是绑定的，每个执行上下文中都有一个 this。

执行上下文包括三种:

- 全局执行上下文
- 函数执行上下文
- eval 执行上下文

因此对应的 this 就有三种

- 全局执行上下文中的 this
- 函数执行上下文中的 this
- eval 中的 this

eval 用的不多，主要用到的是全局执行上下文中的 this 和函数执行上下文中的 this

### 全局执行上下文中的 this

全局执行上下文中的 this 是什么，可以在控制台中打印一下

```javascript
console.log(this);
```

实际输出的就是 window 对象，结论就是全局执行上下文中的 this 是指向 window 对象的，这也是 this 和作用域链唯一交点，作用域链最底端包含了 window 对象，全局执行上下文中的 this 也是指向 window 对象。

### 函数执行上下文中的 this

```javascript
function foo() {
  console.log(this);
}
foo();
```

在 foo 函数内部打印出 this 值，发现函数执行上下文和全局执行上下文中的 this 都是指向 window 对象的。那可以设置函数执行上下文的 this 指向其他对象呢？是可以的，有三种方法可以用来设置函数执行上下文的 this 指向。

### 通过函数的 call 方法设置函数的 this 指向

可以通过 call 方法来设置函数的 this 指向，并立刻执行该函数，比如以下代码

```javascript
function foo() {
  this.name = "foo";
}
fooObj = {
  name: "fooObj",
};
foo.call(fooObj);
console.log(fooObj); //{name: "foo"}
```

一般来说这个 this 是指向 window 的，可是 call 函数改变了 this 的指向将函数 foo 的 this 指向到了 fooObj，从而使 fooObj 的 name 属性值从 fooObj 变为了 foo。

### 通过对象调用方法设置 this 指向当前对象

```javascript
var Obj = {
  name: "Obj",
  getThis: function () {
    console.log(this);
  },
};
Obj.getThis(); //{name: "Obj", getThis: ƒ}
```

可以看到这样输出的 this 是指向当前对象的，可以得出一个结论，**使用对象来调用其内部方法，这个方法的 this 是指向对象本身的**。

也可以认为是 JavaScript 引擎在执行 myObject.showThis 的时候将其转换成了

```javascript
obj.getThis.call(obj);
```

那如果将对象中的函数赋给一个全局变量会怎么样。

```javascript
var Obj = {
  name: "Obj",
  getThis: function () {
    console.log(this);
  },
};
var foo = Obj.getThis;
foo();
```

此时获取到的又是 window 对象了。

有两个结论

- 全局环境中调用一个函数，函数内部的 this 指向全局变量 window
- 通过一个对象来调用其内部的方法，该方法的执行上下文中的 this 指向对象本身。

也就是说如果是在全局执行一个函数，那这个函数 this 就指向全局，但如果是对象里面，那这个 this 就指向对象，只和这个函数执行的调用者有关。

### 数组/对象通过原型链调用方法 将this指向调用对象

```javascript
Array.prototype.logArr = function () {
  console.log(this);
};
let arr = [1, 2, 3];
arr.logArr(); // [1,2,3]
```

在 Array 原型上声明方法,然后数组去调用方法时发现自己身上没有,就找到了原型身上,此时原型上的方法中的 this 就指向了当前的数组。

### 通过构造函数中设置

比如说 new 一个对象

```javascript
function Person() {
  this.name = "P";
}
var p1 = new Person();
console.log(p1); //Person {name: "P"}
```

**你知道 JavaScript 引擎在 new 一个对象的过程中做了什么吗？**

1. 首先先创建一个空对象 p1，设置空对象的__proto__为构造函数的prototype
2. 调用 Person.apply(p1, ...args)，这样当 Person 的执行上下文创建的时候 this 就指向空对象 p1, args是构造函数入参
3. 执行 Person 方法，因为此时 this 指向 p1，因此 p1 的 name='p'
4. 返回 p1 这个对象
```js
function myNew(Constructor, ...args) {
  // 1. 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype);
  // 2. 执行构造函数，this 绑定到新对象
  const result = Constructor.apply(obj, args);
  // 3. 如果构造函数返回对象，则返回该对象，否则返回新对象
  return (typeof result === 'object' && result !== null) ? result : obj;
}
```

## this 的设计缺陷

### 1.嵌套函数的 this 不会继承外层函数的 this

```javascript
var Obj = {
  name: "Obj",
  getThis: function () {
    console.log(this);
    function bar() {
      console.log(this);
    }
    bar();
  },
};
Obj.getThis(); //{name: "Obj", getThis: ƒ}
//Window ...
```

加工了一下上面的代码，在 getThis 中添加了一个方法 bar，这个 bar 的 this 指向是什么？你可能会觉得这个 this 指向的是 Obj，可是实际上函数 bar 的 this 指向的是全局的 window 对象，而 getThis 的 this 指向的是 Obj。这是 JavaScript 中很让人迷惑的事情，也是很多问题的源头。

如何解决这样的问题呢？怎么让 bar 中可以有变量指向 Obj？

### **一种方法可以将 getThis 中的 this 存储到一个 self 变量然后放到 bar 中**

```javascript
var Obj = {
  name: "Obj",
  getThis: function () {
    console.log(this);
    self = this;
    function bar() {
      self.name = "bar";
      console.log(self);
    }
    bar();
  },
};
Obj.getThis(); //{name: "Obj", getThis: ƒ}
//{name: "bar", getThis: ƒ}
```

此时的 bar 的 self 指向了 Obj，修改 self 中的 name，让 Obj 也改变了，**这个方法的本质是把 this 体系转换成了作用域体系**。因为执行到 bar 的时候，bar 会沿着作用域链找 self 然后找到 getThis 上的 self，又因为 getThis 中将 this 赋值给了 self，所以就相当于 bar 取到了 getThis 的 this，这个 this 指向就是 Obj。

### **另一种方法是用 ES6 中的箭头函数来解决这个问题**

```javascript
var myObj = {
  name: "Obj",
  showThis: function () {
    console.log(this);
    var bar = () => {
      this.name = "bar";
      console.log(this);
    };
    bar();
  },
};
myObj.showThis();
console.log(myObj.name);
console.log(window.name);
```

这样同样达到了我们想要的嵌套函数获取到最外层对象的目的。这是因为 ES6 中的箭头函数并不会创建执行上下文，也就代表着箭头函数没有自己的 this，箭头函数的 this 会从其外部函数获取。

想要让嵌套函数获取最外层对象，总结就是两种方式

- 可以将外层函数的 this 保存成变量，让嵌套的函数获取该变量
- 可以将嵌套函数写成箭头函数，让其去获取外层函数的 this

### 2.普通函数的 this 默认指向全局对象 window

上文有

```javascript
function foo() {
  console.log(this);
}
foo();
```

就是这样会输出 window 对象。

在实际工作中，我们并不希望函数的执行上下文中的 this 默认指向全局对象，这样会造成一些误操作。**如果要让函数执行上下文中的 this 指向某个对象，最好的方式是通过 call 方法来调用**。

**在 JavaScript 严格模式下也可以解决，默认执行一个函数，其函数执行上下文中的 this 值是 undefined**

```javascript
"use strict";
function foo() {
  console.log(this);
}
foo(); //undefined
```

一个问题，想实现 updateInfo 可以改变 userInfo,这段代码有什么问题

```javascript
let userInfo = {
  name: "jack.ma",
  age: 13,
  sex: male,
  updateInfo: function () {
    //模拟xmlhttprequest请求延时
    setTimeout(function () {
      this.name = "pony.ma";
      this.age = 39;
      this.sex = female;
    }, 100);
  },
};

userInfo.updateInfo();
```

问题在于 setTimeout 里的回调函数还是嵌套函数，需要改成箭头函数，这样才能找到正确的 this 值。

学自：[https://time.geekbang.org/column/article/128427](https://time.geekbang.org/column/article/128427)
