---
title: "JavaScript数据类型检测"
published: 2021-06-19
description: "JavaScript中数据类型分为原始类型（number、string、boolean、null、undefined、bigint和symbol）和对象(Arr…"
tags: ["JavaScript"]
category: "前端基础"
---

JavaScript中数据类型分为原始类型（`number`、`string`、`boolean`、`null`、`undefined`、`bigint`和`symbol`）和对象(`Array - 数组对象`、`RegExp - 正则对象`、`Date - 日期对象`、`Math - 数学函数`、`Function - 函数对象`)。在JavaScript中，除了原始类型，其余都是对象，对象都是`Object`的实例。

对于数据类型需要了解两个概念：

1. 原始类型存储在栈内存中，被引用和拷贝的时候会创建一个完全相等的变量。

2. 对象类型存储在堆内存中，存储的是地址，可能会有多个变量都指向同一个地址的情况。

   举个🌰：a声明了一个对象，这个对象存储到了堆里面，a其实只是一个地址，如果这时候把a的值赋给b，那b也可以访问到a声明的这个对象了，a和b相当于共享这个对象。

   ![image-20210618220040652](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210618220040652.png)

   代码

   ```
   let a = {
   	name:"a"
   }
   b=a
   a.name //a
   b.name //a
   b.name = "b"
   b.name //b
   a.name //b
   ```

   第二个🌰

   ```js
   let a = {
   	age:18
   }
   function change(o){
   	o.age=20
   	o = {
   		name:"新的"
   	}
   	return o
   }
   b = change(a)
   console.log(a) //20
   console.log(b) //新的
   ```

   在function change中的`o.age=20`中的o实际上还是a对象的地址，因此a对象的age被改成了20，而function中`o=...`和`return o`则是新创建了一个对象，可以看到b中并没有age这个属性。若没有return语句，则函数默认返回的是undefined。

## 数据类型检查方法

- ### typeof

```
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'
typeof null // 'object'
typeof [] // 'object'
typeof {} // 'object'
typeof console // 'object'
typeof console.log // 'function'
```

typeof null为啥返回object，这是js一直以来的一个bug，虽然结果是object，但是null并不是对象类型，而是原始类型，如果要判断这个值是不是null，需要通过`===null`来来判断。

还有一个问题是，typeof对于除了function之外的对象类型没有区分能力。

- ### instanceof

`<object> instanceof <constructor>`

object：某个实例对象

constructor：某个构造函数

`intanceof`就是用来检查`constructor.prototype`是否存在在参数`object`的原型链上。如果constructor是object的构造函数，那么自然他们是相同的数据类型。

```
let constructor1 = function(){}
let o1 = new constructor1()
o1 instanceof constructor1 //true
let str1 = new String('构造出来的字符串')
str1 instanceof String //true
let str2 = '字符串'
str2 instanceof String  //false
```

由上可以看出instanceof在判断对象数据类型还行，但是判断基础数据类型就不行了，可以看到构造出来的字符串是正确的，但是直接声明的字符串却不行，因为String不在直接声明的字符串的原型链上。

> 那么instanceof是如何实现的呢

思路就是

1. 用typeof 判断 A 数据类型是不是原始类型，如果是的话就返回false(因为原始类型没有原型对象。)；
2. 当满足第一个条件后，用`Object.getPrototypeOf(A)`拿到A的原型对象。
3. 因为原型对象可能还有自己的原型对象，所以需要一个循环一直向内寻找，直到找到与B也就是对比目标相同的原型对象，返回true，代表是两个数据是相同数据类型的。若没有相同的，循环到原型对象链的头也就是null了，return false。

```js
function myInstanceOf(A,B){
  //如果不是对象类型而是原始类型就没法判断，因为原始类型没有
	if(typeof A !== 'Object'||A===null) return false;
  //获取A的原型对象
  let proto = Object.getPrototypeOf(A);
  while(true){
    //说明原型链到头了，代表A的原型链上没有与B的prototype(原型属性)相同，返回false
		if(proto === null) return false
    //当A的原型对象和B的数据类型相同时
    if(proto === B.prototype) return true
    //循环向上寻找原型链的原型对象 A的原型对象的原型对象...然后依次后面加的原型对象
    proto = Object.getPrototypeOf(proto)
  }
}
```

为什么这里不用`__proto__`而是`Object.getPrototypeOf(参数)`：原因是因为**兼容性问题**，由于`__proto__`是内部属性不是一个真正对外的API，只有浏览器必须部署此属性其他环境不一定要部署。从兼容等方面考虑许多人不建议使用此属性而推荐使用setPrototypeOf、getPrototypeOf、create来代替。此处是把`A.__proto__`替换成了`Object.getPrototypeOf(A)`

```js
//测试
console.log(myInstanceof(new Number(123), Number));// true
console.log(myInstanceof(123, Number));//false
```

> 为什么原始类型没有原型对象，但是浏览器中测试却可以获取到呢？

```
let a = "a"
a.__proto__ 
```

![image-20210619231811192](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210619231811192.png)

不仅有，而且还和new出来的`__proto__`是一摸一样。这就没法比了，是因为原来原始值类型（布尔值、数字、字符串）有其对应的包装器对象：Boolean（布尔对象）、Number（数字对象）、String（字符串对象），在这些原始值类型上尝试调用属性或方法（比如 constructor 等）时，JS会自动进行 Auto-Boxing（临时包装）的过程，首先将其转换为临时包装器对象，再访问其上的属性或方法，而不会影响原始值类型的属性。所以在函数myInstanceOf中，遇到非对象类型，也就是原始类型，直接就返回false了，不然原始类型被临时包装成了对象，判断成对象就更乱了。

### 小节

从上面可以看出`instanceof`通过原型链来判断数据类型是否相同，缺点是无法判断原始数据类型，只能判断对象数据类型。`typeof`则是对于原始类型的判断没有问题，但是对于对象数据类型，只能判断出是不是function，除此之外的对象类型都认为是object类型。虽然混写能一定程度解决问题，但是还是推荐以下的typeof+Object.prototype.toString()的方法。

- ### Object.prototype.toString()

toString()是Object的原型方法，调用这个方法可以返回格式为`[Object XXX]`的字符串，其中XXX就是对象的类型，也就是说对于Object对象，直接调用toString就可以返回`[object Object]`，而对于其他的对象，则需要通过call来调用，才能返回正确的类型信息。

```js
Object.prototype.toString({})       // "[object Object]"
Object.prototype.toString.call({})  // 同上结果，加上call也ok
Object.prototype.toString.call(1)    // "[object Number]"
Object.prototype.toString.call('1')  // "[object String]"
Object.prototype.toString.call(true)  // "[object Boolean]"
Object.prototype.toString.call(function(){})  // "[object Function]"
Object.prototype.toString.call(null)   //"[object Null]"
Object.prototype.toString.call(undefined) //"[object Undefined]"
Object.prototype.toString.call(/123/g)    //"[object RegExp]"
Object.prototype.toString.call(new Date()) //"[object Date]"
Object.prototype.toString.call([])       //"[object Array]"
Object.prototype.toString.call(document)  //"[object HTMLDocument]"
Object.prototype.toString.call(window)   //"[object Window]"
```

可以看出这个方法很不错。能准确的判断出对象数据类型是哪种，甚至可以区别document和window。

有一点需要注意，就是typeof和Object.prototype.toString.call(参数)最后的返回数据是不同的，typeof返回的都是小写字母，而Object.prototype.toString.call(参数)返回的是Xxx首字母大写的格式。最后我们只需要进行一些优化就行，因为并不需要前面的object，我们只关心后面的数据类型判断结果。

```js
function getType(obj){
  let type  = typeof obj;
  if (type !== "object") {    // 先进行typeof判断，如果是基础数据类型，直接返回
    return type;
  }
  // 对于typeof返回结果是object的，再进行如下的判断，正则返回结果
  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');  // 注意正则中间有个空格
}
```

测试

```
getType("str") //"String"
getType(123) //"Number"
...
```

最后返回的就直接是对应的数据类型了，非常人性化。

以上就是数据类型检测的三种方法总结了。