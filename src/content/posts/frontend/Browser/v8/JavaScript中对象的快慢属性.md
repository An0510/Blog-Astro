---
title: "JavaScript的快慢属性"
published: 2025-05-25
description: "V8 中对象由隐藏类、Properties 和 Elements 构成，快属性和慢属性分别是怎么存储的。"
tags: ["浏览器", "V8"]
category: "前端基础"
---

[ V8 是怎么跑起来的 —— V8 中的对象表示 本文创作于 2019-04-30，2019-12-20 迁移至此 本文基于 Chrome 73 进行测试。前言V8，可能是前端开发人员熟悉而又陌生的领域。 当你看到这篇文章时，它已经迭代了三版了。目的只有一个，在保证尽可能准确的前提下… https://zhuanlan.zhihu.com/p/98434092](https://zhuanlan.zhihu.com/p/98434092)

[ Fast properties in V8 · V8 This technical deep-dive explains how V8 handles JavaScript properties behind the scenes. https://v8.dev/blog/fast-properties](https://v8.dev/blog/fast-properties)

[   https://gist.github.com/kevincennis/0cd2138c78a07412ef21](https://gist.github.com/kevincennis/0cd2138c78a07412ef21)

在V8中，对象主要由三个指针构成，分别是隐藏类(Hidden Class)，`Property` 还有 `element` 

![https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/06303CE3-9E74-4AC9-A169-5F37BEFA7856/8B1CB330-6E81-4BFB-8219-33FF6D63F98E_2/HICTgZCIdZp1dJ9qp0pYCLIExER62QGllhsQgLjQqxYz/image_nyzFWT3aPq.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_nyzFWT3aPq.png)

其中，隐藏类用于描述对象的结构。`Property` 和 `Element` 用于存放对象的属性，它们的区别主要体现在键名能否被索引。

### Properties 与 Element

在 V8 内部，为了有效地提升存储和访问这两种属性的性能，分别使用了两个线性数据结构Properties、Element来分别保存排序属性和常规属性

```
// 可索引属性会被存储到 Elements 指针指向的区域
{ 1: "a", 2: "b" }

// 命名属性会被存储到 Properties 指针指向的区域
{ "first": 1, "second": 2 }
```

这是为了满足 [ECMA 规范](https://link.zhihu.com/?target=https://tc39.github.io/ecma262/#sec-ordinaryownpropertykeys) 要求所进行的设计。按照规范中的描述，可索引的属性应该按照索引值大小升序排列，而命名属性根据创建的顺序升序排列。

```
var a = { 1: "a", 2: "b", "first": 1, 3: "c", "second": 2 }

var b = { "second": 2, 1: "a", 3: "c", 2: "b", "first": 1 }

console.log(a) 
// { 1: "a", 2: "b", 3: "c", first: 1, second: 2 }

console.log(b)
// { 1: "a", 2: "b", 3: "c", second: 2, first: 1 }
```

可以发现b的对象顺序和声明的不太一样。

可以看到索引属性【integer-indexed】(如1，2)按照升序排列。

而命名属性【named properties】(如first，second)则是按照声明顺序排列。

在同时使用索引属性和命名属性时可以看到两者发生了分隔。

![https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/06303CE3-9E74-4AC9-A169-5F37BEFA7856/D630DD6D-DF09-4581-AEFE-5992B2B692A5_2/nEVKy9KtkmInODf89q56xrX4WiGye487ltYmeWjuXREz/image_cLrUIFtC9J.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_cLrUIFtC9J.png)

将属性分解成这两种线性数据结构之后，如果执行索引操作，那么 V8 会先从 elements 属性中按照顺序读取所有的元素，然后再在 properties 属性中读取所有的元素，这样就完成一次索引操作。

### 命名属性的不同存储方式

通过上述，我们知道V8将不同属性保存在elements属性和properties属性中，这样简化了程序复杂度，但是查找元素时却多了一步操作，比如bar.B，V8会先找出properties属性所指向对象，然后在properties对象上查找B属性，这种方式增加一步操作，就会影响到元素的查找效率。

基于这个原因，V8使用一种权衡策略用以提高查找属性效率。这个策略就是将部分常规属性存储到对象本身，这种称为对象内属性(in-object-properties)

V8 中命名属性有三种的不同存储方式：对象内属性（in-object）、快属性（fast）和慢属性（slow）。

用例子来说明对象内属性、快属性和慢属性

```
function foo() {}

let a = new foo()
let b = new foo()
let c = new foo()

for(let i = 0; i<10; i++){
  a[new Array(i+2).join('a')] = 'aaa'
}
for(let i = 0; i<12; i++){
  b[new Array(i+2).join('b')] = 'bbb'
}
for(let i = 0; i<30; i++){
  c[new Array(i+2).join('c')] = 'ccc'
}
```

a、b、c 三个对象分别有10、12、30个属性，分别会以对象内属性，对象内属性+快属性、对象内属性+慢属性这三种方式存储。

通过控制台执行上述脚本，在控制台的Memory内存处，获取内存快照，并在筛选框搜索foo。

![https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/06303CE3-9E74-4AC9-A169-5F37BEFA7856/911CCF71-552C-4B2D-AB7C-E1686F9F2EFB_2/I2ScATQJwr1ysM6FhSbbLojslw0ZdL3HGDMR5qQmnTYz/image_2KAtm0sJlz.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_2KAtm0sJlz.png)

a - 对象内属性

![https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/06303CE3-9E74-4AC9-A169-5F37BEFA7856/7DAB0AC1-9AC1-44AF-9C63-F79FC1E48B11_2/WTvOl2zPxR9txpcKTvZxkZXrowZRUCbg4jUl6xpcqxUz/image_-LgcBK4DoM.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_-LgcBK4DoM.png)

b - 对象内属性+快属性

![https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/06303CE3-9E74-4AC9-A169-5F37BEFA7856/364A9FC2-6E22-44B0-9DC9-78161F7095A2_2/kAhypj9Acmd9SoXyWaamDxxqK8DstBcxmHEu8tnuZmoz/image_a6o-HosWZ7.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_a6o-HosWZ7.png)

c - 对象内属性+慢属性

![https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/06303CE3-9E74-4AC9-A169-5F37BEFA7856/5BB29943-25AB-4733-9B6A-EE1374F83312_2/yWxrktmhSeHqvzHzryYAExPLqDrh3TGk5cU105qIhHEz/image_mJvvR0BUJC.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_mJvvR0BUJC.png)

## 结论与启示

- 属性分为命名属性和可索引属性，命名属性存放在 `Properties` 中，可索引属性存放在 `Elements` 中。
- 命名属性有三种不同的存储方式：对象内属性、快属性和慢属性，前两者通过线性查找进行访问，慢属性通过哈希存储的方式进行访问。