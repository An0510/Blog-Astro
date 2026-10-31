---
title: "async/await"
published: 2021-08-05
description: "为了解决异步操作对于代码的可读性，避免回调地狱(很多个异步回调嵌套的请况)，JavaScript社区先后退出Promise+then和generator+co的…"
tags: ["JavaScript"]
category: "前端基础"
---

为了解决异步操作对于代码的可读性，避免回调地狱(很多个异步回调嵌套的请况)，JavaScript社区先后退出`Promise+then`和`generator+co`的解决方案，直到现在的`async/await`，也叫异步编程的终极解决方案，可以在不阻塞主线程的情况下用同步代码的写代码方式实现异步访问资源的能力，而且代码逻辑更清晰。

async/await的使用到的就是Generator和Promise两个技术。Promise可以看看[八段代码彻底掌握 Promise](https://juejin.cn/post/6844903488695042062)，这里只写生成器概念。

#### 生成器(Generator)和协程

##### 生成器函数相关概念

- `function*`声明的函数就是生成器函数，**在生成器函数内部执行代码过程中，要是遇到yield关键字，JavaScript引擎会返回关键字后面的内容给外部，并暂停该函数的执行。**
- **可以通过`函数名.next()`方法恢复函数继续向下执行并会返回一个对象，有value和done两个属性，value是yeild后面的值，done的值是布尔值，代表生成器是否执行完毕，执行完毕就是true**。

引例

```js
function* genDemo() {
    console.log("开始执行第一段")
    yield 'generator 1'

    console.log("开始执行第二段")
    yield 'generator 2'

    console.log("开始执行第三段")
    yield 'generator 3'

    console.log("执行结束")
    return 'generator over'
}

console.log('main 1')
let gen = genDemo()
console.log(gen.next().value)
console.log('main 2')
console.log(gen.next().value)
console.log('main 3')
console.log(gen.next().value)
console.log('main 4')
console.log(gen.next().value)
console.log('main 5')
```

执行结果

![image-20210803212944644](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210803212944644.png)

可以看到是一段段执行的，全局代码和生成器内部代码交替执行，这就是执行器的特点，可以暂停函数的执行，也可以恢复执行。

##### 协程

协程是一个比线程更加轻量的存在，是跑在线程上的任务，**一个线程上存在多个协程**，但是**在线程上同时只能执行一个协程**，**若此时A协程正在执行，需要启动B协程，那么A协程就需要把主线程的控制权给B协程，此时A协程就暂停执行，B协程恢复执行，同理，也可以从B协程中启动A协程，如果从A协程中启动B协程，就把A协程称为B协程的父协程**。

一个进程可以有多个线程，一个线程也可以有多个进程，协程不是被操作系统控制的，而是程序操控，好处就是性能可以提升很多，不会像线程切换那样消耗资源。

再来分析一下上面那段代码：

- 首先`let gen = genDemo()`，这个时候并没有执行，实际上是创建了gen协程
- 然后执行gen.next()，当执行gen.next()的时候协程会继续执行，此时协程拿到主线程执行权开始执行
- 执行到协程中的yeild关键字的时候，协程停止执行，返回yeild 'msg' 中的 msg信息，并交出主线程执行权
- 当协程gen在执行期间碰到return的时候，JavaScript引擎会结束当前的协程，并把return后面的内容返回给父协程(创建他的协程)

![image-20210709100716144](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210709100716144.png)

​	把代码看成是一个还未播放的音乐，gen.next()和yeild相当于是播放和暂停键，return相当于关闭当前设备的播放器。

​	首先是电脑(父协程)连接了蓝牙音箱开始播放(执行代码)，到了`let gen = genDemo()`，就类似于你通过电脑把蓝牙音箱又连了一个手机(实际就是父协程创建了一个子协程)，蓝牙音箱发声(主线程)只能有一个，播放的声音相当于是主线程此时执行的代码，然后当电脑音乐播放到gen.next()(主线程执行gen.next())的时候，电脑(父协程)这边停止播放，手机(gen协程)继续播放，当手机(gen协程)播放到yeild的时候就停止手机播放，然后如果电脑还有没放完的音乐那么继续播放电脑的音乐，如果正播放手机，执行到了return，相当于断开手机和音箱的蓝牙连接了，此时只有电脑还连着音箱，如果电脑音乐还没结束就继续放电脑的音乐了。

有两个问题：

第一个，就是gen协程和父协程是在主线程上交替进行执行的，切换是通过yield和gen.next来配合完成，就像蓝牙音箱连接两个设备你没法让他们同时发声。

第二个，就是为什么gen协程可以被暂停又接着刚才执行完的代码继续执行？这是因为gen协程和父协程都是有自己独立的调用栈的，当gen协程执行到yeild的时候，JavaScript引擎会保存gen协程当前的调用栈信息，就好比你播放音乐点了暂停，下次播放还是从你暂停的地方开始放。当gen.next()的时候，JavaScript引擎会暂停父协程的执行并保存父协程的调用栈然后执行gen协程代码，就是说电脑(父协程)的播放器停了，继续播放手机(gen协程)的音乐，此时音箱播放(主线程执行)的就是gen协程的音乐(代码)。

### 结合生成器函数和Promise

结合一下这两个东西。

用fetch进行演示，fetch函数用网络请求获取资源，并且会返回一个promise对象(fetch只要不是网络故障或请求被拒绝就不会返回reject，即使响应的Http状态码是404或500 promise状态还会是fullfilled)。例如在掘金页面https://juejin.cn/下调用控制台输入测试一下

```js
fetch('https://juejin.cn/').then(function(){
    console.log('success')
})
```

案例

```js
function* foo(){
  let response1 = yield fetch('https://juejin.cn/')
  console.log('response111')
  let response2 = yield fetch('https://www.Anblog.top')
  console.log('response222')
}
//创建gen协程
let gen = foo()
//获取返回的promise对象
function getGenPromise(gen){
  return gen.next().value
}
//通过判断promise对象的状态，传入promise对象中的属性PromiseResult为response的内容输出出来
getGenPromise(gen).then((response)=>{
	console.log('response1')
  console.log(response)
  return getGenPromise(gen)
}).then((response)=>{
	console.log('response2')
  console.log(response)
})
```

步骤：

1. 创建生成器foo函数。
2. `let gen = foo()` 创建gen协程
3. 创建`getGenPromise(gen)`函数，目的是执行并gen.next().value的执行结果，也就是将主线程的执行权移交gen协程的函数
4. `getGenPromise(gen)`返回promise对象，然后执行执行gen协程上的fetch函数，then里传入fetch函数返回的promise对象中的response，第一个then函数执行并返回`getGenPromise(gen)`的结果给下一个then的response参数，然后再执行。

一般情况下会把执行生成器的代码封装成一个函数，并叫这个执行生成器的函数为执行器，上面就是生成器和Promise相互配合的一个流程。不过通常我们会把执行生成器的部分封装成一个函数。

采用co框架后代码会更精简，co函数可以代替上面的执行生成器的代码，co函数也可以叫做执行器。

```js
const co = require("co");
const fetch=require("node-fetch")
function* foo(){
    let response1 = yield fetch('https://juejin.cn/')
    console.log('response111')
    let response2 = yield fetch('https://www.Anblog.top')
    console.log('response222')
}
co(foo());
```

这样虽然不错了，但是还有更终极的方案就是async/await

## async/await

根据MDN的定义，async是一个通过异步执行并隐式返回Promise作为结果的函数。**异步执行和隐式返回Promise**怎么理解。

隐式返回:可以看到async标记的函数执行后最终返回的是一个Promise对象。

```js
async function foo(){
	return 2
}
console.log(foo()) //Promise {<fulfilled>: 2}
foo().then((val)=>{console.log(val))} //2
```

对应Promise的写法

```js
function foo(){
	return new Promise((resolve)=>{
		resolve(1)
	})
}
console.log(foo()) //Promise {<fulfilled>: 1}
foo().then((val)=>{console.log(val)}) //1
```

await，async函数返回的是一个Promise对象，结合下面代码体会一下await是什么

```js
async function foo() {
    console.log(1)
    let a = await 100
    console.log(a)
    console.log(2)
}
console.log(0)
foo()
console.log(3)
```

结果是: 0 - 1 - 3 - 100 - 2

结合一下之前说的协程的概念,  此时外部环境就是父协程,  而foo就是子协程

1. 首先执行了`console.log(0)`

2. 然后父协程将线程执行权交给了foo协程,  由于foo 函数被async标记过,   JavaScript 引擎会保存当前的调用栈等(相当于有个独立的调用栈)信息， foo协程执行了` console.log(1)`,  此时遇到了await 100,  此时foo协程创建了一个promise

   ```js
   let promise_ = new Promise((resolve,reject)=>{
   	resolve(100)
   })
   ```

   可以看到在 executor 函数中调用了 resolve 函数，JavaScript 引擎会将该任务提交给微任务队列.

   然后JS引擎会暂停当前foo协程的执行, 将主线程的控制权交给父协程执行,   同时将这个新建的promise_对象返回给父协程 ,  **此时父协程还有一件事, 就是用promise\_.then中的回调函数来监控promise\_状态的改变**

3. 此时父协程就接着执行`console.log(3)`,  并且打印出来3 ,  随后父协程即将执行结束,  在结束前,   就会检查是否有微任务,  开始执行微任务队列,  微任务队列中有一个`resolve(100)`的任务等待执行,     Promise\_执行之后的触发promise_.then 中的回调函数

   ```js
   promise_.then((value)=>{
      //回调函数被激活后将主线程控制权交给foo协程，并将vaule值传给协程
   })
   ```

   该回调函数被激活以后，会将主线程的控制权交给 foo 函数的协程，并同时将 value 值传给该协程。foo 协程拿到主线程执行权后，会把得到的 value 值赋给了变量 a，然后 foo 协程继续执行后续语句`console.log(2)`，执行完成之后，将控制权归还给父协程。

   这么看来await就是promise.then

总结一下: await之后的行为实际上就是让子协程创建了一个promise.resolve(),  然后返回给了父协程微任务队列,   当父协程要执行微任务队列的时候,  触发promise_.then的回调函数,   然后在回调函数中将执行权和返回值都交给子协程 .


```js
let p1 = new Promise((resolve)=>{
	resolve(1)
})
let p2 = new Promise((resolve)=>{
		resolve(2)
})
async function fun(){
	let a = await foo()
	let b = await bar()
	console.log(a)
	console.log(b)
}
fun()
```

async 返回一个promise对象

```js
async function fun(){
	return 1
}
let f = fun()
console.log(f)
fun().then((data)=>{
	console.log(data)
})
```

![image-20210715170230898](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210715170230898.png)



async和await

```js
let a1 = new Promise(resolve){
	resolve(1)
}
let a2 = new Promise(resolve){
	resolve(2)
}
async function fun(){
	let a = await p1;
	let b = await p2;
	console.log(a)
	console.log(b)
}
fun()
```

可以看出来这样的代码把异步代码写成了同步的感觉

```js
async function fun1(){
	let data = await fun2()
	console.log(data)
}
async function fun2(){
	console.log(200)
	return 100
}
//200
//100
```

在async函数中 await后执行的相当于then后的函数

题

```js
console.log(1)
async function async1(){
	await async2()
	console.log(2)
}
async function async2(){
	console.log(3)
}
async1()
setTimeout(function(){
	console.log(4)
},0)
new Promise(resolve => {
	console.log(5)
	resolve()
}).then(function(){
	console.log(6)
}).then(function(){
	console.log(7)
})
console.log(8)
```
同步任务：1、3、5、8
微任务：2、6、7
宏任务：4
1 3 5 8 2 6 7 4

1.同步
2.微任务 promise.then process.nextTick
3.宏任务 setTimeout Ajax 读取文件 setImmediate
