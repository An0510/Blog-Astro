---
title: "V8-隐藏类和内联缓存IC"
published: 2025-05-25
description: "对于以上的代码，底层是如何实现的呢？"
tags: ["浏览器", "V8"]
category: "前端基础"
---

```
function loadX(o) {
  return o.x
}

loadX({ x: 1 })
loadX({ x: 2 })
```

对于以上的代码，底层是如何实现的呢？

首先我们看看TC39中ECMA262怎么描述的
[ECMA262](https://tc39.es/ecma262/#sec-property-attributes)所描述的流程：

函数内部通过调用GET算法获取属性值。但是这存在一个问题，跟现代VM的速度差距太大了。这是因为解释器(生成字节码的)没有任何记忆，如下图

![https://mrale.ph/images/2015-01-11/v8-vs-ox.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/v8-vs-ox.png)

找出给定属性在任意对象的位置是成本很高的，我们应当让解释器可以学习记忆，简化查找过程，最好能一次就查找到。

来看看V8获取o.x的流程：

查找对象O的隐藏类，再通过隐藏类查找x属性偏移量，然后根据偏移量获取属性值。

### 什么是隐藏类？

[V8中的隐藏类](https://v8.dev/docs/hidden-classes)
V8会给每一个对象都分配一个隐藏类(Hidden Classes)， 用于描述对象的形状。

> intelligent design:  推断代码背后的思想(不知道你会怎么写，先假设，然后根据你的写法再去做优化)

为什么要有隐藏类？

对于C++这类静态类型语言，变量类型在定义时就决定了。
```c
int x = 5 ;
```
C++编译器通过一条指令就可以知道变量x的类型和内存位置。

但由于JavaScript并不是预编译的，因此在JavaScript中相同的操作，每次执行程序时，引擎都必须检查它是整数还是浮点数，或者任何其他有效的数据类型。所以JavaScript中的每条指令都要经过几次类型检查和转换，这会影响到它的执行速度。

隐藏类在概念上类似于典型的面向对象编程语言中的类。但这个类并不是提前预知或定义的，而是在创建对象时即时创建隐藏类，并根据对象的变化而动态更新。隐藏类用于标识对象特征，也对 V8 编译器的优化和内联缓存起到非常重要的作用。

#### 总结
- 总是以相同的顺序初始化对象成员，能充分利用相同的隐藏类，进而提高性能。
- 增加或删除可索引属性，不会引起隐藏类的变化，稀疏的可索引属性会退化为哈希存储。
- delete 操作可能会改变对象的结构，导致引擎将对象的存储方式降级为哈希表存储的方式，不利于 V8 的优化，应尽可能避免使用（当沿着属性添加的反方向删除属性时，对象不会退化为哈希存储）。

隐藏类是为了辅助进一步压缩重复查找的过程，提高对象的查找效率，这个加速函数执行的策略就是**内联缓存 (Inline Cache)**，简称为 IC。

### 什么是内联缓存

在V8执行函数时，会观察函数中一些调用点 (CallSite) 上的关键的中间数据(如上文所说，可以认为是一种记忆)，当下次再执行时，V8可以利用这些中间数据，有效提升`入参为相同隐藏类(的对象)的函数`**重复执行**的执行效率。

分析流程如下

IC会为每个函数维护一个反馈向量(FeedBack Vector)，可以认为每个函数对应了一张表如下

![](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_JbdKvhINKM.png)

每张表由很多项构成，每一项成为一个插槽(Slot)。V8会将loadX的中间数据写入反馈向量中的插槽里。

```
function loadX(o) {
   o.y = 4 
   return o.x
 }
```

V8执行这段函数时，会认为`o.y = 4` 及 `o.x`为调用点(CallSite)，因为他们调用了对象及属性，这时V8就会在loadX函数的反馈向量里给每个调用点分配一个插槽。

每个插槽中包含了插槽索引、类型、状态及隐藏类地址(map)、以及属性的偏移量。比如上面两个函数中都使用了对象o，那么这两个插槽的map指向的是同一个隐藏类，地址是相同的。

![](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_3011-GVTM0.png)

让我们来通过字节码来分析在V8执行loadX函数时，是如何将关键数据写入到反馈向量中的。

loadX的代码如下所示

```
function loadX(o) { 
    return o.x
}
loadX({x:1})
```

通过d8命令`d8 --print-bytecode <js文件>`  

可以看到上述代码转换成的字节码，如下

```
GetNamedProperty a0, [0], [0]
Return
```

他的具体含义是

- GetNamedProperty，取出参数a0中第一个属性值，并将属性值放到累加器中。a0后第一个[0]代表取参数的第一个属性值，第二个[0]就和反馈向量相关了，代表将操作的中间数据插入反馈向量的第一个插槽里。
- Return 返回累加器中的属性值。

> 累加器：一个非常特殊的寄存器，用于保存中间结果。

![](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_wO548iXzsL.png)

观察上图会发现：

- map一栏缓存的是o对象的隐藏类地址
- type代表当前的操作类型，o.x这种访问对象属性的操作被称为LOAD。
- state代表当前是单态(monomorphic)
- offset缓存了属性x的偏移量

V8除了缓存o.x这种LOAD类型操作之外，还会缓存存储类型(STORE)和函数调用(CALL)类型的中间数据。

以下面的代码为例

```js
function foo(){}
function loadX(o) { 
    o.y = 4
    foo()
    return o.x
}
loadX({x:1,y:4})
```

将上述代码转换为字节码

```c
LdaSmi [4]
SetNamedProperty a0, [0], [0]
LdaGlobal [1], [2]
Star0
CallUndefinedReceiver0 r0, [4]
GetNamedProperty a0, [2], [6]
Return
```

1. 首先是

```c
LdaSmi [4]
SetNamedProperty a0, [0], [0]
```

具体是将常数4加载到累加器中，然后通过SetNamedProperty将累加器中的4赋给o.y，这是一个存储(STORE)类型操作，将中间数据写入反馈向量的第1个插槽中。

2. 执行foo

```c
LdaGlobal [1], [2]
Star0
CallUndefinedReceiver0 r0, [4]
```

加载foo函数对象的地址到累加器中，这是通过LdaGlobal来完成的，然后V8将中间结果存放到反馈向量的第3个插槽，这是一个存储操作。

执行 CallUndefinedReceiver0调用foo函数，并将调用过程数据写入反馈向量的第5个插槽中，这是一个调用(CALL)类型操作。

3. 查询o.x

```c
GetNamedProperty a0, [2], [6]
Return
```

从a0参数中拿出第二个属性，并将中间数据写入反馈向量的第6个插槽中，这是一个加载(LOAD)类型操作。

说了这么多，它记录的实际意义是什么呢？

就是再loadX再次被执行，且入参的对象隐藏类与此前执行过的对象隐藏类相同时，在执行到`return o.x` 时，可以直接去反馈向量中根据偏移量直接查找到x属性所在位置，这样就可以大大提高V8的执行效率。

### 多态和超态

在之前的案例中，我们说到相同对象形状同时有相同隐藏类的条件下，重复执行会降低查找效率。

但是如果是多种对象呢，V8会怎么处理这种情况。

```js
function loadX(o) { 
    return o.x
}
var o = { x: 1,y:3}
var o1 = { x: 3, y:6,z:4}
for (var i = 0; i < 10000; i++) {
    loadX(o)
    loadX(o1)
}
```

可以看到o和o1形状是完全不同的。

当第一次执行loadX时，v8会将o的隐藏类记录在插槽中。但当第二次执行时，入参是o1，通过与插槽中隐藏类的比对发现并不是相同的隐藏类，此时V8就无法使用反馈向量中记录的偏移量信息了。

对于这种情况，V8会将新的隐藏类也记录在反馈向量中，同时记录属性的偏移量，反馈向量此时第一个槽中就包含了两个隐藏类及偏移量。如下图所示

![](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_5FdFlQAIlO.png)
![https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/2F4E1D78-7B67-47A7-BC77-FB8B38D8D52D/BDF9A6B0-95E0-4FCF-88F0-B4130ED377FA_2/6PMqoGWjDu2rAKZsyBmcNJP9O4NyeExOBrZyreZkjEsz/image_LKSRhAqUb0.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_LKSRhAqUb0.png)

当再次执行loadX中的o.x语句时，同样会查找反馈向量表，会发现第一个槽中记录了两个隐藏类。这时V8需要拿这个新的隐藏类和第一个插槽中的两个隐藏类来挨个比较，若相同，就用对应的偏移量，若不同则将新的隐藏类和偏移量添加到反馈向量的第一个插槽中。

> 若一个插槽中只包含1个隐藏类，这种状态叫单态。

> 若一个插槽中包含了2~4个隐藏类，这种状态叫多态。

> 若一个插槽中超过了4个隐藏类，这种状态叫超态。

若一个函数一直是单态的，其执行效率一定是最好的。如果是多态的情况，V8会用线性结构存储，可以挨个查找。若是超态的情况，则V8会采用hash表的结构存储。

![https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/2F4E1D78-7B67-47A7-BC77-FB8B38D8D52D/3547C94E-1658-4492-BB61-2E80545C21BF_2/hkBDM9O7fv9x5quyQyxro5rbzXBiXyDFPlukaeAtoqAz/image_lqBsnb1NII.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image_lqBsnb1NII.png)

### 总结

IC的本质就是让每个函数都有记忆，当第一次执行函数时，会将函数中的存储、加载、调用相关的中间结果保存到反馈向量中。当再次执行时，V8就会去反馈向量中查询相关中间信息，如果命中了，就可以直接利用。

单态的性能优于多态和超态。当你在写一个loadX(o)的函数时，尽量不要使用多个不同隐藏类的o对象。

单态不仅仅只应用于此处，对于JavaScript这门动态语言而言，引擎想要做优化，能准确推断数据结构非常重要，比如函数入参一直是字符串，那就会去调用内置方法中处理字符串的部分，次数多了就会转换为机器码。如果一会是字符串一会是数字，就会触发反优化，耗费性能。