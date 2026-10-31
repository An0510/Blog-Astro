---
title: "let 和 const 以及作用域"
published: 2021-10-29
description: "在 ES6 以前，ES 的作用域只有两种：全局作用域和函数作用域。ES6 出现后，又新增了块级作用域。"
tags: ["JavaScript"]
category: "前端基础"
---

在 ES6 以前，ES 的作用域只有两种：全局作用域和函数作用域。ES6 出现后，又新增了块级作用域。

- 全局作用域中的对象在代码中的任何地方都能访问，其生命周期伴随着页面的生命周期。
- 函数作用域就是在函数内部定义的变量或者函数，并且定义的变量或者函数只能在函数内部被访问。函数执行结束之后，函数内部定义的变量会被销毁。
- 块级作用域就是使用一对大括号包裹的一段代码，比如函数、判断语句、循环语句，甚至单独的一个{}都可以被看作是一个块级作用域。

```js
//if块
if (1) {
}
//while块
while (1) {}
//函数块
function foo() {}
//for循环块
for (let i = 0; i < 100; i++) {}
//单独一个块
{
}
```

### 变量提升导致变量覆盖问题

JavaScript 的块级作用域是和其他语言不同的，变量有可能被覆盖掉

比如用 C 语言写这样一段代码

```javascript
char* myname = "极客时间";
void showName() {
  printf("%s \n",myname);
  if(0){
    char* myname = "极客邦";
  }
}
int main(){
   showName();
   return 0;
}
```

C 语言会输出极客时间，也就是外部的全局变量。可如果用 JavaScript 来实现就会出问题，代码如下

```js
var myname = "极客时间";
function showName() {
  console.log(myname);
  if (0) {
    var myname = "极客邦";
  }
  console.log(myname);
}
showName();
```

让我们来看生成好的调用栈内容

![image-20210807124644046.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807124644046.png)

当执行 showName()中的可执行代码的时候`console.log(myname);`问题就出现了，此时因为变量提升，showName 的变量环境中已经有一个 myname=undefined 了，因此`console.log(myname);`就会从当前函数作用域中拿变量值，最终导致输出结果就是 undefined，和 C 语言以及大多数支持块级作用域的语言结果完全不同。

### 变量提升导致本该销毁的变量没有被销毁

看下面这段代码

```js
function foo() {
  for (var i = 0; i < 7; i++) {}
  console.log(i);
}
foo();
```

在其他语言中，for 循环结束之后，i 就应当被销毁了，但是在 JavaScript 代码中，i 的值并没有被销毁，最后打印出来是 7。这也是因为变量提升，因为在创建执行上下文的时候，变量 i 已经被提升了，因此在 for 循环结束后，i 并没有被销毁。

那这些问题该如何解决呢？

### ES6 引入 let 和 const 解决

为了解决这些问题，**ES6 引入了 let 和 const 关键字，从而使 JavaScript 也能和其他语言一样有块级作用域**。

```js
let x = 5;
const y = 6;
x = 7;
y = 9; //const声明的变量不能被修改 Uncaught TypeError: Assignment to constant variable.
```

两者都可以生成块级作用域，唯一不同的是 const 声明的变量的值是不能被改变的。

那是如何解决问题的呢

#### 改造前的存在变量提升的代码

```javascript
function varTest() {
  var x = 1;
  if (true) {
    var x = 2;
    console.log(x); //2
  }
  console.log(x); //2
}
```

如果是其他语言的块级作用域，那么第二个 console.log(x)应当是输出 if 外部声明的 x=1 的 1，因为块内的`x=2`应当用完就销毁。但是 JavaScript 不是这样，当前函数作用域的变量环境中，首先是变量提升

![image-20210807130923919.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807130923919.png)

然后执行可执行代码`x = 1`和`x = 2`，后面的`x=2`覆盖了前面的`x=1`，导致最终后面的两个 console.log(x)的输出结果都是 2。

#### 改造后的代码

就是将 var 替换成 let

```js
function varTest() {
  let x = 1;
  if (true) {
    let x = 2;
    console.log(x); //2
  }
  console.log(x); //1
}
```

这样就和大多数支持块级作用域的语言结果一致了，这是因为 let 关键字支持块级作用域，在编译阶段，JavaScript 就不会把 if 块中用 let 关键字声明的变量放到变量环境中，这样函数内部 if 外部就看不到 if 块内部声明的变量了。这样第二个也就是 if 块外的 console.log(x)就不会输出 2 了。这样就符合编程习惯了：**作用域块内声明的变量不影响块外的变量**。

### 支持块级作用域背后原理

上面并没有细说在执行上下文阶段块级作用域是如何实现的，也就是 ES6 如何既支持变量提升，又支持块级作用域呢？

```js
function foo() {
  var a = 1;
  let b = 2;
  {
    let b = 3;
    var c = 4;
    let d = 5;
    console.log(a);
    console.log(b);
  }
  console.log(b);
  console.log(c);
  console.log(d);
}
foo();
```

![image-20210807141916003.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807141916003.png)

内部称为内部作用域块，外圈称为函数作用域块。

分析一下流程，第一步还是编译并创建执行上下文

![image-20210807140732943.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807140732943.png)

- 通过 var 声明的变量，在编译阶段会放到当前函数执行上下文的**变量环境**中。
- 通过 let 声明的变量，在编译阶段会被存放到**词法环境**(栈结构)中。
- 在函数作用域内的作用域块内部，通过 let 声明的变量还没有到词法环境中。

接着执行代码，当执行到代码块内部的时候，a 被赋值为 1，词法环境中的 b 被赋值为 2：

![image-20210807141546291.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807141546291.png)

当进入函数内部的作用域块的时候，作用域块中通过 let 声明的变量，会被存放在词法环境中的一块单独的区域中，这个区域的变量不影响作用域块外面的变量。比如你在个内部作用域块声明用 let 声明变量 b 的时候，是不会影响到外部作用域声明的变量 b 的，他们虽然变量名相同，但是是独立的存在。

接着执行 console.log(a)，**如何查找这个变量呢，实际上就是根据作用域链，首先需要从词法环境和变量环境中找，具体查找方式是沿着词法环境的栈顶向下查询，如果在词法环境中的某个块找到了，就直接返回给 JavaScript 引擎，如果没找到，就去变量环境中继续查找。**

![image-20210807144526129.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807144526129.png)

当**内部作用域块执行完毕之后，内部用 let 定义的变量就会从词法环境的栈顶弹出**，最后执行上下文如下

![image-20210807145257788.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210807145257788.png)

执行外部代码，console.log(b)的时候自然还是从词法环境开始找，

在词法环境内部，维护了一个小型栈结构，栈底是函数最外层的 let 或 const 声明变量，进入一个作用域块后，就会把该作用域块内部的 let 或 const 声明变量压到栈顶；当作用域执行完成之后，该作用域的信息就会从栈顶弹出。（这也是为什么内部作用域的 console.log(b)输出的是内部定义的 b=3 的值，而块外的 console.log(b)输出的则是外部定义的 b=2，因为 b=3 是先压到栈顶，当执行到外部的 console.log(b)的时候 b=3 已经被弹出了，此时栈顶就是 b=2 了。）

一道题

```js
let myname = "极客时间";
{
  console.log(myname);
  let myname = "极客邦";
}
```

结果 Uncaught ReferenceError: Cannot access 'myname' before initialization。变量没被初始化

原因是**const 和 let 存在暂时性死区**，var 声明变量的时候回将变量创建和初始化为 undefined，所以当你在 var 声明的变量前 console.log()这个变量就是 undefined。但是 let 和 const 和 var 有所不同，块级作用域的用 let 声明的变量是当代码执行到当前块内才放入词法环境的，变量被放到词法环境中的时候是未被初始化(赋值)的存在暂时性死区，因此当你执行 console.log(变量)(访问该变量)的时候会报错。

结论：**v8 虚拟机会禁止你访问 let 和 const 声明变量之前调用变量的行为**
