---
title: "“<”运算符是为将来使用而保留的。报错解决方法"
published: 2021-04-26
description: "在 VScode 下运行犀牛书第一章的一个词频统计代码出现的报错"
tags: ["VS Code", "PowerShell"]
category: "工具与环境"
---

在 VScode 下运行犀牛书第一章的一个词频统计代码出现的报错

```
node charfreq.js < corpus.js
```

报错信息

![image-20210426211849225](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210426211849225.png)

通过搜索发现类似问题的原因是和 VSCode 终端选择用 powershell 还是 cmd 有关。

### 解决方法

1. 打开 VSCode，在界面按快捷键`ctrl`+`shift`+`p`

   ![image-20210426212641166](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210426212641166.png)

2. 选择 cmd

   ![image-20210426212721514](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210426212721514.png)

3. 重启 VSCode

4. 解决

   ![image-20210426212820832](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210426212820832.png)

### 原因

在 windows 下 win+R，输入 cmd 回车进入 cmd 后，cd 到对应目录执行

```
node charfreq.js < corpus.js
```

是没问题的

![image-20210426212052743](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210426212052743.png)

说明 cmd 的执行是没问题的，因此可以基本确定是 VSCode 终端默认是 powershell 的问题。改成 cmd 就行。
