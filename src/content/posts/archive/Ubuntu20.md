---
title: "Ubuntu20.04 简单上手及安装软件"
published: 2021-02-09
description: "Ubuntu 20.04 的安装和上手：断网加速安装、换 apt 源、设置 root 密码、中文界面和安装软件。"
tags: ["Linux", "Ubuntu"]
category: "工具与环境"
---

##### 下载安装 Ubuntu20.04

需要先下载一个 VMware。
[ubuntu 20.04 下载及安装教程](https://www.cnblogs.com/ubuntuanzhuang/p/ubuntu2004.html)

<font color='red'>完成安装正常启动后，以下是一些使用需要注意的步骤，建议按顺序完成。</font>

##### 断网加速安装

因为如果默认安装在联网状态下会给你装包，都是国外的，所以特别特别慢。断网后很快就能装好，然后你改了 apt 源以后安装各种包就会飞速。

##### 网络配置问题

20.04 在使用过程中发现会有消失联网图标断网的情况，[解决办法](https://blog.csdn.net/lezeqe/article/details/83501723?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.control)

##### 换 apt 源 加速

[换 apt 源方法](https://www.jb51.net/article/187442.htm)

##### 设置 root 密码

第一次使用时需要设置 root 用户以及密码(因为普通用户不加 sudo 缺少很多权限，root 相当于管理员有最高权限，进入 root 用户后原本需要加 sudo 的操作可以不用加 sudo)

```
sudo passwd root
```

![image-20210204153207632](https://img-blog.csdnimg.cn/img_convert/8b6b92603dc01422c8bfeefe3f81422c.png)

设置完毕后，su 后输入密码进入 root 用户

```
su
```

![image-20210204153330334](https://img-blog.csdnimg.cn/img_convert/638f3b3e8c43afa83ddc396111b33916.png)

##### 界面改成中文

界面中文可以二倍速看这个教学视频 ：[视频地址](https://www.bilibili.com/video/av457685711)

然后在以上的基础上添加中文输入法

<img src="http://typora-an.oss-cn-hangzhou.aliyuncs.com/img/20210206202600.png" alt="image-20210206202600699" style="zoom:33%;" />

<img src="http://typora-an.oss-cn-hangzhou.aliyuncs.com/img/20210206202617.png" alt="image-20210206202617613" style="zoom:33%;" />

<img src="http://typora-an.oss-cn-hangzhou.aliyuncs.com/img/20210206202700.png" alt="image-20210206202700087" style="zoom:33%;" />

![image-20210206202747167](https://img-blog.csdnimg.cn/img_convert/c46cc72ea42c0a877cbaf89efed412ae.png)

然后打开浏览器就可以输入中文了

<img src="http://typora-an.oss-cn-hangzhou.aliyuncs.com/img/20210206203332.png" alt="image-20210206203332813" style="zoom:33%;" />

##### 设置屏幕时间

设置永久不睡眠(学习用比较方便，不然需要反复去解锁)，

![image-20210206165705011](https://img-blog.csdnimg.cn/img_convert/9fd436303a5bbf18052d70b1751b1ddd.png)

##### 安装软件（VScode 为例子）

下载安装使用 VScode

1. 用火狐进入 vscode 官网 进入下载页面，点击.deb 下载

![image-20210208221815928](https://img-blog.csdnimg.cn/img_convert/a4f3f46487eb8be8bf908b1975566b7e.png)

2. 保存文件

![image-20210209071246912](https://img-blog.csdnimg.cn/img_convert/37a245d6db71726dfdf127d678333643.png)

下载完成并打开所在文件夹。

![image-20210209071317187](https://img-blog.csdnimg.cn/img_convert/72114f45663419e9e119a40776136f9d.png)

3. 右键在当前目录打开终端

![image-20210209071428509](https://img-blog.csdnimg.cn/img_convert/e2f56d4765e450c994208643de727be6.png)

输入命令，不同软件就是不同的`.deb`文件

```
sudo dpkg -i code_1.53.0-1612368357_amd64.deb
```

安装成功

![image-20210209071622767](https://img-blog.csdnimg.cn/img_convert/d334e31789747e840e9e07ff9a73127d.png)

![image-20210209071742129](https://img-blog.csdnimg.cn/img_convert/c48b389b706f56ca35c0469db11f2962.png)

![image-20210209071759683](https://img-blog.csdnimg.cn/img_convert/fd1b051bda23e5f1c99f4c83178f49c6.png)

以上就是 Ubuntu20.04 的简单上手了。
