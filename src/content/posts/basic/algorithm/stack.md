---
title: "栈"
published: 2025-05-05
description: "栈是一个后进先出的结构，像一个蜂窝煤炉子"
tags: ["栈"]
category: "算法"
---

栈是一个**后进先出**的结构，像一个蜂窝煤炉子

![image-20250505095836099](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20250505095836099.png)

放进去是push, 弹出就是pop。栈顶就是top。

对应的就是Array的方法push和pop，栈顶可以表示为 arr[arr.length-1]

栈可能需要的方法

- size 获取栈大小
- peek 获取栈顶元素
- clear 清空栈



JavaScript是没有栈的，但是JS的数组可以实现栈。

```javascript
const stack = []
stack.push('1')
stack.push('2')
stack.pop()
stack.pop()

console.log(stack)
```

使用场景

- 十进制转二进制
- 栈可以检查字符串的括号是否有效闭合
- 倒序输出
- 浏览器历史记录
- JS的函数调用背后也是栈来控制顺序，JS的词法环境也是栈来控制