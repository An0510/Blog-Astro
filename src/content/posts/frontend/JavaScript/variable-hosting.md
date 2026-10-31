---
title: "JavaScript 变量提升"
published: 2021-10-23
description: "理解了 JavaScript 执行上下文，才能更好的理解 JavaScript 语言本身，比如变量提升，作用域和闭包等。"
tags: ["JavaScript"]
category: "前端基础"
---

> 为什么需要了解执行上下文？

理解了 JavaScript 执行上下文，才能更好的理解 JavaScript 语言本身，比如变量提升，作用域和闭包等。

先来看段代码测试一下吧

```javascript
show();
console.log(Name);
var Name = "AN";
function show() {
  console.log("我出现了");
}
```

大家都知道 JavaScript 是解释型的语言，就是说应当是一行行顺序执行的，那是不是应该是

- show()的时候，因为 show()还没定义，直接报错
- console.log(Name)，Name 也没定义，报错

实际的结果是什么呢

![image-20210630212728979.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210630212728979.png)

可以看到虽然 show()之前并未定义 show()函数，可却正确的执行出来了。这个地方我们可以得出一个结论:就是说执行前函数直接被移到调用函数的前面去了。这叫变量提升。

console.log(Name)结果并不是 AN，而是 undefined。这是怎么回事呢？难道说是只要 console.log(变量)就会自动给分配个 undefined 吗？试着不声明直接随便 console.log 一个变量试试

```javascript
console.log(Anyone);
```

![image-20210630212304757.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210630212304757.png)

由此可以看出，声明变量是不能缺的。我们又知道`var Name = 'AN'`是可以拆分成`var Name`（声明)和`Name = 'AN'`(赋值)的，

![image-20210630214225720.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210630214225720.png)

而在 JavaScript 中仅声明未赋值的变量默认的值就是 undefined，自然可以想到，当 console.log(Name)在前的时候起作用的仅仅只有`var Name`这部分，可以简化为以下代码验证一下

```javascript
console.log(Name);
var Name;
```

![image-20210630212657114.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210630212657114.png)

可以看到和上面是一样的结果。也意味着，JS 在执行的时候仅仅只是提前了声明但是而并没有赋值。这样我们就可以得出一条结论：JavaScript 在执行过程中会将变量的声明`var Name`提前，这个概念也叫做变量提升。

#### 变量提升

还是刚才的案例

```javascript
show();
console.log(Name);
var Name = "AN";
function show() {
  console.log("我出现了");
}
```

模拟一下变量提升的情况

```javascript
//变量提升部分
var Name;
function show() {
  console.log("我出现了");
}

//执行部分
show();
console.log(Name);
```

实际上这就是为什么可以在定义之前使用变量或者函数的原因，因为函数和变量在执行之前都提升到了代码的开头。这就叫变量提升。那这个执行之前到底是啥意思？啥就叫执行之前？

那就得提提**JavaScript 代码的执行流程**了。

`一段JavaScript代码`>>`编译阶段`>>`执行阶段` 一段代码在被执行之前需要被 JavaScript 引擎编译，编译之后才进入执行阶段。可以看出这里的执行之前就是编译阶段。

编译阶段都做了啥事呢，经过编译阶段后，会生成两个部分：**执行上下文**和**可执行代码**，执行上下文是 JavaScript 执行一段代码时的运行环境，包括变量环境和词法环境。

![image-20210630223553880.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210630223553880.png)

```javascript
show();
console.log(Name);
var Name = "AN";
function show() {
  console.log("我出现了");
}
```

上面的`Name`和`show`函数都保存在变量环境(Viriable Eviroment)这个对象中。变量环境的样子可以简单理解为

```javascript
VariableEnvironment:
     Name -> undefined,
     show ->function : {console.log('我出现了')}
```

如果调用一个函数，就会进入这个函数的执行上下文，确定函数在执行期间的 this，变量，对象，函数等。

> 编译过程中对这段代码都干了什么？

- 第 1 行和第 2 行不涉及声明，所以 JS 引擎不处理
- 第 3 行是用`var`声明了变量 Name，因此 JavaScript 引擎会在变量环境中创建一个名为 Name 的属性，并且用 undefined 对其进行初始化
- 第 4 行，JavaScript 引擎发现了一个 function 定义的函数，会将函数定义存储到堆(HEAP）中去，并且在变量环境中创建一个 show 属性，这个属性指向堆中函数的位置。

这样就生成了变量环境对象，接着 JavaScript 引擎会把声明外的代码编译成字节码对应就是可执行代码

```javascript
show();
console.log(Name);
Name = "AN";
```

#### 执行阶段

得到了可执行代码之后，就按照顺序一行行执行

- 执行 show 函数的时候，JavaScript 引擎在变量环境对象中查找这个函数，因为变量环境对象里存着这个函数的引用，因此 JavaScript 执行直接就出结果了。”我出现了”
- 打印 Name 信息，JavaScript 引擎在变量环境对象中查找改对象，并且此时值为 undefined，输出 undefined
- 执行第三行，把`"AN"`赋给 Name 变量，赋值后的 Name 变量属性值变为了"AN"，变量环境对象如下

```javascript
VariableEnvironment:
     Name -> "AN",
     showName ->function : {console.log("我出现了")}
```

如果代码中出现重名的变量或者函数怎么办

```javascript
function show() {
  console.log("我出现了");
}
show();
function show() {
  console.log("出现了但是没完全出现，哎，就是玩儿");
}
show();
```

在编译阶段，执行上下文阶段，先存入了第一个 show，存入第二个的时候会把第一个覆盖掉。执行阶段，然后两个 show()出来的结果就是

![image-20210630232902812.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210630232902812.png)

以上就是 JavaScript 执行顺序的简单总结了。
