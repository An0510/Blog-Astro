---
title: "队列"
published: 2025-05-05
description: "队列是先进先出的数据结构。"
tags: ["队列"]
category: "算法"
---

### 队列是什么？

![img](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/1ec7750387d946518c9cf4171b5eea3f.gif)

队列是先进先出的数据结构。

JavaScript没有队列的结构，但是可以通过Array实现队列的结构

主要就是用到数组的push和shift方法，以及找到队头 queue[0]

```javascript
const queue = []
queue.push('1')
queue.push('2')
const item1 = queue.shift()
const item2 = queue.shift()
```

### 队列使用场景

当无法多个任务并行时，采用先进先出，保持有序性。

食堂排队打饭，JS异步中的任务队列，计算最近的请求次数(队列)。

![image.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image.png)

计算最近的请求次数

计算最近3000ms内发送的请求

[0,1,100,3001,3002] 

[null,1,2,3,3]

当队头和新插入的元素插值大于3000ms时队头出队。

### JS异步中的队列

![image.png](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image%20(2).png)

webApi执行完毕后会有回调函数里的代码进入Callback Queue，当主线程的同步任务执行完毕以后再执行异步任务。

### 队列总结

先进先出的数据结构

树和图会用到队列进行广度优先遍历。