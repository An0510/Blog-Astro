---
title: "链表"
published: 2025-05-11
description: "数组：增删非首尾元素往往需要移动元素。比如说在数组中间加一个元素，那么这个元素之后的元素都被向后移了一位。删除则是前移。"
tags: ["链表"]
category: "算法"
---

### 链表是什么？

- 多个元素组成的列表。
- 元素的存储不连续，用next指针连在一起。

![image-20250505172151849](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20250505172151849.png)


### 数组VS链表

数组：增删非首尾元素往往需要移动元素。比如说在数组中间加一个元素，那么这个元素之后的元素都被向后移了一位。删除则是前移。

链表：增删非首尾元素，不需要移动元素，只需要更改next的指向就可以。

链表的优势：插入和删除非常快

时间复杂度取决于你找哪个元素，删除第一个就是O(1)，而删除最后一个就是O(n)

### 如何实现链表

JavaScript中可以用Object模拟链表。

### 遍历链表

```javascript
const a = {val: 'a'}
const b = {val: 'b'}
const c = {val: 'c'}
const d = {val: 'd'}
a.next = b
b.next = c
c.next = d

let p = a
while (p){
    console.log(p.val)
    p = p.next
}
```

### 在链表中插入值

添加e

```javascript
const e = {val: 'e'}
b.next = e
e.next = c
```

### 在链表中删除值

删除e

```javascript
b.next = c
```

自动垃圾回收。

### 链表与前端相关的地方

JS的原型链是一个链表。原型链是沿着__proto__指的。

工作中可以用链表指针获取JSON的节点值。

```javascript
const json = { a: { b: 'hello' }, c: [1, 2] };
const path = ['a', 'b'];
let point = json;
path.forEach(key => { point = point[key] });
```
