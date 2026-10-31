---
title: "jenkins自动化部署Vuepress(上)-安装jenkins和基本配置"
published: 2021-06-03
description: "将Vuepress，也就是本网站的文件，放在github的私有仓库里，每当从vscode中把文章代码什么的push到私有仓库的时候，jenkins服务器自动将更…"
tags: ["Jenkins", "CI/CD"]
category: "工具与环境"
---

## 目的

将Vuepress，也就是本网站的文件，放在github的私有仓库里，每当从vscode中把文章代码什么的push到私有仓库的时候，jenkins服务器自动将更新后的代码从github上fetch下来，然后再自动打包。

## 将Vuepress代码上传到github上

1. [git的安装和配置密钥](https://blog.csdn.net/huangqqdy/article/details/83032408)

2. github创建库 

   ![image-20210512144157790](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210512144157790.png)

   ![image-20210512145053209](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210512145053209.png)

   

   下面的三个`README、.gitignore、license`感兴趣可以在下面介绍的Learn more中看具体的解释，对于个人博客来说都不用勾选也不影响。

   有两种情况：

   第一种是你按我上图Add a README file，直接就会出现你的仓库信息，会有一个默认的README.md

   ![image-20210512145946648](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210512145946648.png)

   第二种是你什么也没选，github会告诉你怎么操作，你只需要找一个文件夹，在cmd下执行以下的操作就可以看到和上面一样的了。

   ![image-20210512145912270](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210512145912270.png)

   区别是第二种在执行的过程中已经生成了本地的库。

   ![image-20210512150158944](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210512150158944.png)

   而第一种则需要复制SSH地址

   ![image-20210512150454189](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210512150454189.png)

   在选定文件夹路径下用cmd命令行

   ```
   git clone git@github.com:An0510/test_git.git
   ```

## 安装Jenkins

Centos根目录下执行以下命令

安装：[官网安装教程](https://pkg.jenkins.io/redhat-stable/)

根目录下运行以下命令安装(2021.4.30/centos7.8)

```
 sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
  sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
```

```
yum install jenkins
```

浏览器访问：`http://你的服务器IP地址:8080/`

打开网页按照提示继续操作

`/var/lib/jenkins/secrets/initialAdminPassword`

![image-20210430160652908](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210430160652908.png)

```
cat /var/lib/jenkins/secrets/initialAdminPassword
```

复制结果直接输入密码貌似不让你进，我是手打进去的(你也可以右键检查给input框的value直接赋值)。(使用admin账户继续的话，下次就是输入上面获取的密码)

![image-20210430173808722](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210430173808722.png)

![image-20210430173924640](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210430173924640.png)

保存并完成，jenkins就搭好了。

##### 安装文件位置

```
安装目录：/var/lib/jenkins
日志目录：/var/log/jenkins/jenkins.log
```

##### 启动/停止/重启

```
sudo /etc/init.d/jenkins start
sudo /etc/init.d/jenkins stop
sudo /etc/init.d/jenkins restart 
```

重启restart也可以直接浏览器输入`http://你的服务器IP地址:8080/restart`来进行

##### 访问

Jeckins默认端口是8080 浏览器访问

```
http://你的服务器IP地址:8080/
```



## 汉化jenkins

1. 主界面 -> 系统管理 -> 插件管理 -> 可选插件 

![img](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/817863-20191013023933669-399525050.png)

![img](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/817863-20191013024238739-885010179.png)

2. 系统管理 -> 系统设置 -> Locale

![image-20210506203700311](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506203700311.png)

记着勾选下面的选框，否则不生效的。但是我的不知道为啥有些汉化的地方还是不太完全。但是基本都汉化完成，不影响使用。

3. 重启生效

```
浏览器地址栏输入
http://localhost:8080/restart
```

## 安装nodejs插件

安装NodeJS Plugin

开始我试了试把云服务器之前装的node路径放上去，可是好像不起作用，所以就在插件的地方让他自动安装一个nodejs了

![image-20210506204336676](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506204336676.png)
