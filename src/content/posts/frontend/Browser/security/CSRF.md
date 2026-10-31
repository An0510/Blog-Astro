---
title: "CSRF攻击 - 陌生链接"
published: 2025-05-15
description: "全称 Cross-site request forgery 跨站请求伪造, 就是黑客引诱已经登录的用户打开黑客的网站, 然后在黑客网站中利用用户的登录状态来发起…"
tags: ["浏览器", "浏览器安全"]
category: "前端基础"
---

全称 Cross-site request forgery 跨站请求伪造, 就是黑客引诱已经登录的用户打开黑客的网站, 然后在黑客网站中利用用户的登录状态来发起的跨站请求.

简单说CSRF攻击就是黑客利用用户的登录状态,  通过第三方站点来做坏事

### 攻击方式

**1.自动发起Get请求**

比如此时你处于登录状态, 然后你打开了一个恶意链接, 这个链接的页面有一张图片, 图片的src就是一个Get请求, 当你打开这个链接的时候,  就会自动加载图片的src, 同时也执行了这个Get请求 

**2.自动发起Post请求**

当用户打开黑客的页面之后,  会自动提交POST请求

```
<html>
<body>
  <h1>黑客的站点：CSRF攻击演示</h1>
  <form>
    <input />
    <input />
  </form>
  <script> document.getElementById('hacker-form').submit(); </script>
</body>
</html>
```

**3.引诱用户点击链接**

除了Get和Post之外, 还有一种是引诱用户点击黑客站点的链接, 经常出现在论坛和恶意邮件中, 比如有一个美女图片

```
<div>
  <img width="150" src="http://images.xuejuzi.cn/1612/1_161230185104_1.jpg" />  </div> <div>
  <a href="https://time.geekbang.org/sendcoin?user=hacker&amp;number=100">
    点击下载美女照片
  </a>
</div>
```

以上就是CSRF攻击, 和XSS不同, CSRF不需要将恶意代码注入用户页面, 只是利用服务器漏洞和用户的登录状态来攻击. 

### 如何预防

首先了解如何才能发起CSRF攻击, 第一要找到服务器漏洞, 第二需要用户保持登录状态,  第三要打开第三方站点,  满足这些条件黑客就可以对用户进行CSRF攻击了

有这么几个途径来预防

1.**利用Cookie的SameSite属性**

黑客利用用户的登录态进行攻击, Cookie就是浏览器和服务器之间维护登录状态的一个关键数据, 通常CSRF攻击都是从第三方站点发起的, **可以通过服务端设置响应头上添加set-cookie的属性SameSite来解决, 这样再第三方站点发起请求时请求头就不会带着Cookie** . 

SameSite的目的就是限制第三方网站利用Cookie发起请求, 设置了三种值 Strict/Lax/None

2.**验证请求的来源站点**

在服务端验证请求来源的站点,  **服务器可以通过HTTP的请求头里的Referer和Origin属性来判断是否是第三方站点, 如果判断是第三方站点就直接禁止**

Referer是HTTP请求头中的一个字段, 记录了该HTTP请求的来源地址, Referer可以告诉服务器HTTP的请求来源, 但是有些场景不适合将来源URL暴露给服务器,  因此浏览器提供给开发者一个选项, 可以不用上传Referer值.标准委员会又指定了Origin属性, 和Referer不同的是不包含路径信息. 因为有些站点出于安全考虑不愿意暴露源站点的详细路径信息.

![image-20250515081704449](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20250515081704449.png)

因此服务器的策略是优先判断Origin, 如果没有Origin , 再根据情况判断是否判断Referer值.

**3.CSRF Token**

token认证可以避免CSRF攻击
就是在浏览器向服务器发送请求的时候, 服务器生成一个Token, 其实就是服务器生成的一个字符串, 每次发起请求时Token需嵌入到请求参数或头中（如隐藏表单字段、AJAX请求头），服务端验证token是否合法,  如果是**第三方站点发出的请求就无法获取到token的值所以会被服务器拒绝**,
