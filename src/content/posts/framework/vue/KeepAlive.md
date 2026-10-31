---
title: "通过 LRU 理解 Vue3 中 keep-alive 部分源码"
published: 2022-02-20
description: "keep-alive 标签包裹的组件在切换时可以保留状态避免重新渲染。"
tags: ["Vue"]
category: "框架"
---

keep-alive 标签包裹的组件在切换时可以保留状态避免重新渲染。

但是缓存不能是无限的，否则会挤爆内存，有三种形式去进行缓存的淘汰。

1、 **FIFO 队列**。这个更适合做任务，不适合做组件的。

2、**LFU**。统计每个任务出现的次数，来淘汰出现次数较少的。缺点是比较耗费计算资源。

3、**LRU 缓存**。全称 Least Recently Used。也就是最近最少使用。

把所有元素按最近使用情况排序，比如已经到达固定存储量，添加新元素时需要判断当前缓存中是否存在相同元素，若有相同元素则将相同元素放到最后(更新)，若无相同元素则添加该元素并删除第一个元素(也就是最早添加的)。

例子：
最大长度为 4 的缓存

| 当前缓存   | 添加元素 | 更新后缓存 |
| ---------- | -------- | ---------- |
| 1，2，3，4 | 2        | 1，3，4，2 |
| 1，2，3    | 4        | 1，2，3，4 |

组件缓存用的最多的就是 LRU 缓存。(LRU Cache)

### 源码文件对应代码段

在 Vue 的源码文件中的 packages/runtime-core/src/components/KeepAlive.ts 中就有用到，采用的是 set 的实现方式。

**setup 函数**

#### 声明 cache(Map)和 keys(Set)

![Image.png](https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/A8945B95-AB59-4A24-8632-484A898E1271/D00FB1D2-1FFC-414F-9DA4-3351AA5BCE4F_2/tmEEVE8uVXBEU86reQJ3xyOB8WSBSONykX0yLVV9RV8z/Image.png)

#### pruneCacheEntry（超出大小时，用于淘汰缓存）

若新增时超出缓存最大长度，需要用 pruneCacheEntry 删除 keys 中最早添加的 key 对应到 cache 中的数据。

![Image.png](https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/A8945B95-AB59-4A24-8632-484A898E1271/8952BD1B-7681-41BB-B01A-EBDE1B425B3B_2/r8hfPtfdSAuB4FnDUVYziuRNdkgEKdpByRvildoyc5Iz/Image.png)

#### 在组件挂载或者更新时,向 cache 中新增数据

渲染函数(return ()=> {...})中为 pendingCacheKey 赋值

![Image.png](https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/A8945B95-AB59-4A24-8632-484A898E1271/E01A8962-4471-44F6-BEA5-96DB60852AD4_2/1xuNxW2VjCW5S1BeWxXHHKkJkRxHm4lqpMaxdwiVgIIz/Image.png)

**执行 render 的时候，pendingCacheKey 会被赋值为 vnode.key**

在组件挂载或者更新(onMouted, onUpdated)时，向 cache 中新增 <key, vnode>

![Image.png](https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/A8945B95-AB59-4A24-8632-484A898E1271/31812574-83B0-43B1-81E5-503D4BFD352F_2/xkiuASa1XGKrYQQUcxHyW1fhyDVnmbb2nOEv2fxdSx8z/Image.png)

**setup 函数中 return 的渲染函数**

#### 获取子节点 vnode 和 key

获取到当前 keep-alive 包裹的子节点

![Image.png](https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/A8945B95-AB59-4A24-8632-484A898E1271/8B36CF6B-353B-4834-B519-54C66C18F9BE_2/q2HV45rSXZlHuC7w5haisWeRcktqE1vcSVmVKyjt2H0z/Image.png)

![Image.png](https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/A8945B95-AB59-4A24-8632-484A898E1271/DAB62B95-2BC1-4B75-84A9-78D6E8C1C939_2/onRXEk4hYlM8TTbgcZ10jNtbUG8tcZ0wrCJ79Zjy7UEz/Image.png)

获取到当前节点的 key 值

![Image.png](https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/A8945B95-AB59-4A24-8632-484A898E1271/8F9E8F19-DEE6-49BD-9398-15792F74634B_2/60yDkfw8zhRdzwEt43TrgxpNF24ZguZl4IyEumWiDxAz/Image.png)

#### 通过 cachedNode 判断

通过 cachedNode(cache 中是否已经有这个 key 对应的 vnode)来判断是否当前被组件是否已被缓存过。

1. 若以被缓存过，则更新被缓存的节点到 keys 的末尾(更新)
2. 若未被缓存过
   1. 向 keys 中添加当前 node 的 key
   1. 判断是否超出缓存最大值，若超出缓存最大值则调用 pruneCacheEntry 传入最早 add 进 keys 的 key 作为参数，在 pruneCacheEntry 中 cache 根据入参的 key 来删除 keys 和 cache 对应数据。

![Image.png](https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/A8945B95-AB59-4A24-8632-484A898E1271/77E70A56-D751-492C-8F81-8EE913B56513_2/JaL6zIhq2YoxNxVTdCzQdW2SCG2ebiQH9JZxoTnkicIz/Image.png)

![Image.png](https://res.craft.do/user/full/6f904f60-12ad-396f-3e1d-d95d9b03bd08/doc/A8945B95-AB59-4A24-8632-484A898E1271/5CBDC4BC-5E03-4B70-8A33-6AAB2D7420EC_2/IqKFI0BP3xJ17FQZaZ27UhhIyhOKxkFNBDxlxWauziQz/Image.png)

总结：

**可以看出是通过 cache(map)和 keys(set)配合实现了缓存功能。本质上可以说实际上是对 keys 实现了 LRU 算法，只是通过 keys 中的 key 确保 cache 中缓存数据没问题。**

在 setup 函数返回的渲染函数中。

1.  获取当前 keep-alive 的子节点以及 key。
2.  当缓存中存在与当前组件相同的 key 时，keys 将该数据更新到末尾(将相同 key 的数据先删除后添加，达到更新的效果)。
3.  若无相同 key 的节点已缓存，则直接向 keys 中 add 当前的 key。同时需要判断是否超过缓存最大长度，若超过长度则通过 pruneCacheEntry 函数淘汰(删除)最早 add 进 keys 的 key 和该 key 在 cache 中对应的数据。

当组件挂载或更新(onMounted 和 onUpdated)时触发 cacheSubtree，给 cache 添加当前 key 和 vnode。

### Map 实现

1. 通过 has 判断是否存在相同的数据(也就是判断当前节点和缓存过的节点是否相同)。
2. 通过 map.keys().next().value 可以获取到第一位元素(这是由于 map.keys()返回的是一个迭代器，可以通过 next 拿到第一个值)可以获取到 map 中最先放入的 key。也就意味着可以通过 delete 这个 key 来淘汰最早 set 进去的 key。

```javascript
let cache = new Map();
cache.set("a", 1);
cache.set("b", 2);
cache.set("c", 3);
console.log(cache.keys().next().value); // a 也就是最先放入的key
```

3. set 新的 key 是有序的，可以删除掉相同的 key 然后再次 set 达到将相同值更新到 map 末尾的效果。

满足实现 LRU 算法的条件。以下是 leetcode 算法题通过 Map 的实现。

### LRU 算法题

[力扣](https://leetcode-cn.com/problems/lru-cache/)

```javascript
var LRUCache = function (capacity) {
  this.cache = new Map();
  // max赋值为缓存最大大小
  this.max = capacity;
};

LRUCache.prototype.get = function (key) {
  if (this.cache.has(key)) {
    // 用临时变量存储键值
    let tmp = this.cache.get(key);
    // 删除原来的键和值，再次添加，达到更新到末尾的效果
    this.cache.delete(key);
    this.cache.set(key, tmp);
    return tmp;
  }
  return -1;
};

LRUCache.prototype.put = function (key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key);
    // 当当前cache大小超出最大时需要有缓存淘汰机制
  } else if (this.cache.size >= this.max) {
    // 删除map头部元素，也就是最开始set的key
    this.cache.delete(this.cache.keys().next().value);
  }
  this.cache.set(key, value);
  return;
};
```
