---
title: "JavaScript数据类型转换"
published: 2021-06-21
description: "JavaScript 中的强制类型转换和隐式类型转换，以及 == 比较背后的规则。"
tags: ["JavaScript"]
category: "前端基础"
---

JavaScript数据类型转换 有时候需要强制转换，有时候JavaScript会自己进行隐式转换，此时就得注意了。

```js
'1' == 1 //true
'' == null //false
'' == 0 //true
[] == 0 //true
[] == '' //true
[] == ![] //true
null == undefined //true
Number(null) //0
Number('') //0
parseInt('') //NaN
{}+10 //10

let obj = {
	[Symbol.toPrimitive](){
		return 200
	},
	valueOf() {
		return 300
	},
	toString(){
		return 'Hello'
	}
}
console.log(obj+200) //400
```

## 强制类型转换

强制类型转换方式包括`Number()`、`parseInt()`、`parseFloat()`、`toString()`、`String()`、`Boolean()`,这些方法都比较相似，就是通过自身的方法来进行数据类型的强制转换。

### Number()强制转换

- 布尔值，true转换为1，false转换为0
- 数字返回自身。
- null返回0
- undefined返回NaN
- 如果是字符串
  - 如果字符串中只包含数字(或是0x/0X开头数字可以有正负)将其转换为十进制
  - 如果字符串中包含有效的浮点格式，转化为浮点数
  - 如果是空字符串，转换为0
  - 如果不是以上的，返回NaN
- 如果是Symbol，抛出错误
- 如果是对象，并且部署了[Symbol.toPrimitive]，调用对象的valueOf()方法，然后根据前面的规则转换返回的值，如果转换的结果是NaN,那么调用对象的toString方法，再次按前面的顺序返回对应的值。

```js
Number(true);        // 1
Number(false);       // 0
Number('0111');      //111
Number(null);        //0
Number('');          //0
Number('1a');        //NaN
Number(-0X11);       //-17
Number('0X11')       //17
```

### Boolean()方法的强制转换规则

undefined, null, false, '', 0(+0,-0), NaN转换的是false，其他转换的都是true。

```js
Boolean(0)          //false
Boolean(null)       //false
Boolean(undefined)  //false
Boolean(NaN)        //false
Boolean(1)          //true
Boolean(13)         //true
Boolean('a')       //true
```

### parseInt()

直接转换

```
parseInt("1234blue");   //returns   1234
parseInt("0xA");   //returns   10
parseInt("22.5");   //returns   22
parseInt("blue");   //returns   NaN
```

根据进制转换

```
parseInt("AF",   16);   //returns   175
parseInt("10",   2);   //returns   2
parseInt("10",   8);   //returns   8
parseInt("10",   10);   //returns   10
```

### parseFloat()

跟parseInt()基本一样，不过是转换浮点数，但是没有进制转换的功能

```
parseFloat("1234blue");   //returns   1234.0
parseFloat("0xA");   //returns   NaN
parseFloat("22.5");   //returns   22.5
parseFloat("22.34.5");   //returns   22.34
parseFloat("0908");   //returns   908
parseFloat("blue");   //returns   NaN
```

### toString()

对于原始类型，null转化成"null" , undefined转换成 “undefined”, true转换成“true”, false转化成“false”, 数字除了极大和极小的数字采用指数形式。

```
var a = 1.07*1000*1000*1000*1000*1000*1000*1000
a.toString()    //"1.07e21"
var b = 15
b.toString() //"15"
```

对普通对象来说，除非自行定义，否则toString()返回内部属性[[Class]]的值，如"[object Object]"

```
let a = {
 name:"a"
}
a.toString() //"[object Object]"
```

数组对象重写了toString方法，把每个位置的都转换成字符串然后用`,`拼接

```
var a = [1,2,3]
a.toString() //1,2,3
```

### String()

和toString()的转换基本上是一样的，只不过toString没办法直接转换原始类型，只能转换经过js包装的对象。

```
11.toString() //报错
String(11) //"11"
```



## 隐式类型转换

通过逻辑运算符(`&&`，`||`，`!`)，运算符(`+`,`-`,`*`,`/`)，关系操作符(`>`,`<`,`<=`,`>=`)，相等运算符（`==`）或者if/while条件操作，如果遇到两个数据类型不同的情况，都会出现隐式转化。

### `==`的隐式类型转换规则

- 如果类型相同，无需进行转换
- 如果其中一个值是null或者undefined，那么另一个操作符必须也是null或者undefined，不然返回的就是false不是true
- 如果其中一个是Symbol类型，那么返回false
- 两个操作值如果一个为String类型一个为Number类型，那么会将String类型转换为Number类型
- 如果一个操作值是boolean，会被转换成number
- 如果一个操作值是object，另一个操作值是string/number/symbol，就会把object转换为原始类型再进行判断（调用object的valueOf/toString方法进行转换）

```
null == undefined       // true  规则2
null == 0               // false 规则2
'' == null              // false 规则2
'' == 0                 // true  规则4 字符串转隐式转换成Number之后再对比
'123' == 123            // true  规则4 字符串转隐式转换成Number之后再对比
0 == false              // true  e规则 布尔型隐式转换成Number之后再对比
1 == true               // true  e规则 布尔型隐式转换成Number之后再对比
var a = {
  value: 0,
  valueOf: function() {
    this.value++;
    return this.value;
  }
};
// 注意这里a又可以等于1、2、3
console.log(a == 1 && a == 2 && a ==3);  //true f规则 Object隐式转换
// 注：但是执行过3遍之后，再重新执行a==3或之前的数字就是false，因为value已经加上去了，这里需要注意一下
```
