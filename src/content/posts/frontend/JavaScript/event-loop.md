---
title: "事件循环"
published: 2021-06-08
description: "从调用栈、Web APIs 和回调队列理解 JavaScript 的事件循环。"
tags: ["JavaScript"]
category: "前端基础"
---

V8是Chrome里的JavaScript运行环境 (runtime)

JavaScript是一个单线程,非阻塞,异步,解释性语言.

有调用栈(call stack),事件循环(event loop),回调队列(callback queue),一些其他的API.

JavaScript的运行环境示意图,堆(heap)记录了内存的分配(memory allocation),调用栈(stack)里是执行上下文(execution contexts)

![image-20210318152528512](https://typora-an.oss-cn-hangzhou.aliyuncs.com/img/image-20210318152528512.png)

**setTimeout,DOM,HTTP请求**这些东西他们并不在V8源码中,这些是异步编程首先考虑要使用的东西

![image-20210318153650494](https://typora-an.oss-cn-hangzhou.aliyuncs.com/img/image-20210318153650494.png)

webAPIs: DOM,AJAX,setTimeout....

![image-20210318153755980](https://typora-an.oss-cn-hangzhou.aliyuncs.com/img/image-20210318153755980.png)

### 线程==调用栈==一次只做一件事

#### 案例1-进入函数，函数就入栈，return函数函数就出栈

```
function multiply(a,b) {
	return a * b;
}
function square(n) {
	return multiply(n,n);
}
function printSquare(n) {
	var squared = square(n);
	console.log(squared);
}
printSquare(4);
```

**当进入某个函数的时候,这个函数就会被放在栈中,当return离开这个函数的时候这时函数就会被弹出栈外**

##### <font color='cornflowerblue'>调用栈工作过程</font>

当你运行这个文件的时候,会有一个类似main的函数,它代表文件本身,先将它放入栈中,紧接着是printSquared(4),然后是square(n),multiply(n,n)
![image-20210318163848350](https://typora-an.oss-cn-hangzhou.aliyuncs.com/img/image-20210318163848350.png)

出栈,先按顺序依次弹出,当进入printSquare(4)的时候将console.log(squared)压入栈中,然后再依次弹出,直到空栈结束.

![image-20210318164335344](https://typora-an.oss-cn-hangzhou.aliyuncs.com/img/image-20210318164335344.png)

#### 案例2 - 被依赖的函数后入栈，后入先出

```
function foo() {
	throw new Error('Oops!');
}
function bar() {
	foo();
}
function baz() {
	bar();
}
baz();
```

输入控制台返回结果

![image-20210318173933449](https://typora-an.oss-cn-hangzhou.aliyuncs.com/img/image-20210318173933449.png)

baz函数调用了bar函数,bar函数调用了foo函数.foo函数抛出了一个错误.
打印出了整个栈树包括匿名函数(也就是main()函数),被依赖的是后进入调用栈的,后入先出，baz依赖bar,bar依赖foo，所以进入调用栈的顺序是baz,bar,foo，出的时候就是foo,bar,baz.

#### 案例3 - 疯狂的自调用导致内存泄漏

如果有一个疯狂调用自身的函数

```
function foo(){
	return foo();
}
foo();
```

结果

![image-20210319084459923](https://typora-an.oss-cn-hangzhou.aliyuncs.com/img/image-20210319084459923.png)

### 什么让程序变慢?-异步

![image-20210319084645843](https://typora-an.oss-cn-hangzhou.aliyuncs.com/img/image-20210319084645843.png)

谈谈阻塞,没有严格的定义说什么是阻塞,什么不是阻塞,主要就是程序运行的比较慢.比如说cosole.log不慢,遍历1到10亿很慢,请求网络很慢.总之,在栈内表现很慢的东西都叫阻塞.
例子 jQuery的AJAX请求问题
伪代码

```
var foo = $.getSync("//foo.com");
var bar = $.getSync("//bar.com");
var qux = $.getSync("//qux.com");
console.log(foo)
console.log(bar)
console.log(baz)
```

如果没给AJAX请求加上回调函数,它们是会同步的.
请求一次,就是等待一次(网络请求),将所有的都跑一遍,程序才最终结束
![image-20210322074612849](https://typora-an.oss-cn-hangzhou.aliyuncs.com/img/image-20210322074612849.png)
因为**JavaScript是单线程的语言,如果这样做的话就容易导致一个问题,就是阻塞(原因是网络请求的等待时间比较长),用户没办法很快的看到渲染后的界面.**

所以我们应该如何做呢?最简单的方式就是提供<font color='red'>异步回调</font>

#### setTimeout案例

```
console.log('Hi');
setTimeout(function(){
	console.log('There')
},5000)
console.log('JSConfEU');
```

按照之前的理解，那就是依次去执行，为何There神奇的在5秒后出现在了栈里面呢？

这就是Concurrency&Event Loop并发性和事件循环，虽然javascript是单线程的，但是浏览器是多线程的，提供了很多api去供你调用，

**就像setTimeout其实并不存在于V8引擎(也就是运行环境)中,而是浏览器提供的API中的**

```js
console.log("我是一个同步任务")
setTimeout(function(){console.log("等到api运行结束，我就从task queue中被推到栈中执行。")},5000)
```

首先调用栈执行了`console.log("我是一个同步任务")` 输出我是一个同步任务

然后调用栈只剩main()，setTimeout进入调用栈，setTimeout运行后被弹出,调用了浏览器的api(timer),当计时结束后,回调函数进入task queue(任务队列)

<img src="https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210608204816129.png" alt="image-20210608204816129" style="zoom:25%;" />

等到调用栈空的时候(也就是说同步任务执行完毕),task queue的任务就会被push到调用栈中,调用栈运行回调函数.

<img src="https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210608204920325.png" alt="image-20210608204920325" style="zoom:25%;" />

所有的web API的工作方式是相同的,如果我们有一个AJAX请求,用一个回调的URL,工作原理相同

>  这里你可能想问, 那么setTimeout(function,0)是什么情况呢

webapi的setTimeout刚计时就直接被放到task queue中了，这样只要调用栈一空，就可以直接执行。

> setTimeout并不是说到了你设定的时间就会执行，前提条件是你的调用栈中的任务已经空了。

比如说你有几个等待一秒就执行的函数，那么最后一个函数执行的时候已经超过1秒了，这里的一秒是你最快一秒，同步代码执行的时间是不算在其中的，还有task queue排队的时间。也就是说后面的等待一秒执行的函数首先一样的进入webapi开始等一秒，然后进入task queue等待调用栈空并且轮到自己，然后才能运行代码。

结论就是 你最终执行完成的时间 = 同步代码执行到这段函数的时间+webapi的倒计时一秒(你设定的那个时间)+task queue的排队时间(也就是前面队伍push到调用栈然后执行的时间和)+当前函数的执行时间。这个应该是大于一秒的。

#### 异步请求的案例

伪代码

```
console.log("Hi")
$.get('url',function(){
	console.log(data)
})
console.log("JSconf")
```

`console.log("Hi")` 被放到调用栈中，执行后被弹出

<img src="https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210608190717321.png" alt="image-20210608190717321" style="zoom:25%;" />

异步请求进入调用栈

<img src="https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210608191403790.png" alt="image-20210608191403790" style="zoom:25%;" />

在webApi中加载XHR异步请求 在调用栈中弹出异步请求

<img src="https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210608202619091.png" alt="image-20210608202619091" style="zoom:25%;" />

这时候调用栈空了，接着执行`console.log("JSconf")`

<img src="https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210608202908769.png" alt="image-20210608202908769" style="zoom:25%;" />

执行后弹出，异步请求有可能一直都结束不了，也可能就结束了，结束后`cb`就会进入task queue，当`console.log("JSconf")`

<img src="https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210608203436789.png" alt="image-20210608203436789" style="zoom: 25%;" />

当调用栈空了之后，就把`cb`推到调用栈中，然后执行里面的方法 console.log(data)

<img src="https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210608204045060.png" alt="image-20210608204045060" style="zoom:25%;" />

最后栈空，结束

#### DOM案例

代码

```
$.on('button','click',function(){
	console.log('clicked')
})
```

执行代码之后，调用了Webapi ，然后每点击一次就会把函数到task queue中去排队，然后推入栈中；栈中每执行完空一次，task queue就把排队中的task再推一个进去，直到全部调用栈空，task queue也空了。

![image-20210608222158438](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210608222158438.png)

### 总结

通过以上可以发现，setTimeout ， DOM ， 包括异步请求是一个新的小组，只要进了api小组里(开始调用webapi时)他们可以开始执行了，不需要像一个个挨个排队，谁先执行完谁就去task queue ，到了task queue就跟排队一样了，哪个先结束就先进task queue，同时也代表会先被执行。

Render Queue 和 Callback Queue

渲染比回调函数有更高的优先级,每16毫秒它就要

如果渲染被阻塞,你不能再屏幕上选择文本,你不能点击东西看到响应

文章主要参考Philip Roberts：[What the heck is the event loop anyway? | Philip Roberts | JSConf EU - YouTube](https://www.youtube.com/watch?v=8aGhZQkoFbQ)







https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/

**宏任务是开会分配的工作内容，微任务是工作过程中被临时安排的内容**
