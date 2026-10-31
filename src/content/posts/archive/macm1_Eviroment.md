---
title: "MacM1 常用环境搭建"
published: 2021-06-01
description: "在 M1 Mac 上搭建常用开发环境：JDK、Maven、MySQL、Homebrew、Node、Python。"
tags: ["macOS", "开发环境"]
category: "工具与环境"
---

## JDK

进入 Zulu openjdk 的[下载页面](https://www.azul.com/downloads/?version=java-8-lts&os=macos&package=jdk)

1. 点击 Choose Your Download

![image-20210601105122111](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ad2affa945d4416b96f9f331059561e~tplv-k3u1fbpfcp-zoom-1.image)

2. 选择你需要的版本，下载 arm 版本的.dmg 文件

![image-20210601105354315](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac85f4b2a3da46e4af4bbe750f8fd2bf~tplv-k3u1fbpfcp-zoom-1.image)

3. 点击.dmg 文件安装,注意这里只支持 1.8 及以上版本

4. 在终端输入

   ```shell
   java --version
   ```

   ![image-20210601105616814](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5e0c86e3f53e477699ddb3f3b0b5d74d~tplv-k3u1fbpfcp-zoom-1.image)

   就成了

参考：https://blog.csdn.net/luoaki/article/details/113749054

## Maven

1. 去官网下载 bin.tar.gz 文件，[下载地址](http://maven.apache.org/download.cgi)

![image-20210601144945668](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/588b9a26b33649c6a15ebb6f76c3f4a2~tplv-k3u1fbpfcp-zoom-1.image)

2. 下载后解压，然后移动到/usr/local 下的文件夹(通过访达的前往文件夹去)

![image-20210601145135004](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2f225da0377d48d08b58a7d39542f346~tplv-k3u1fbpfcp-zoom-1.image)

3. 配置环境变量

   ```
   vim ~/.zshrc
   ```

   在下面添加(注意自己安装的版本和位置)

   ```
   export MAVEN_HOME=/usr/local/apache-maven-3.8.1
   export PATH=$PATH:$MAVEN_HOME/bin
   ```

   保存并退出。ESC+`:wq`+回车

4. 让环境变量生效

   ```
   source ~/.zshrc
   ```

5. 查看是否配置成功

   ```
   mvn -v
   ```

   ![image-20210601145642780](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a43f11a7a83e4d74a86b8b687dd9a894~tplv-k3u1fbpfcp-zoom-1.image)

6. 改镜像为阿里云，加速下载依赖

   进入 local/你的 maven 仓库/conf/settings.xml 修改 mirrors 标签内的 mirror 标签

   ```xml
   <mirror>
     <id>mirrorId</id>
     <mirrorOf>aliyun</mirrorOf>
     <name>aliyun Maven</name>
     <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
   </mirror>
   ```

   ![image-20210601150415425](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/90112724a61f4370bea26379bd62086b~tplv-k3u1fbpfcp-zoom-1.image)

参考：https://blog.csdn.net/qq1808814025/article/details/112306747

## MySQL

### 用安装包方式安装

[安装包下载地址](https://downloads.mysql.com/archives/community/) 选择 8.0 或者自己需要的版本进行下载

![WeChat9c990980ae55c3db16f8844772d7e6e5](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aadca59cf9cd4a249a15f3c9a45e98b3~tplv-k3u1fbpfcp-zoom-1.image)

Next

![image-20210601191449323](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2e550e0379ea4358bf9215074a5464f0~tplv-k3u1fbpfcp-zoom-1.image)

这时候进入系统偏好设置就能看到 mysql 已经运行了

![image-20210601193011107](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c4a00121d2c4d0f97030f8de39ee57a~tplv-k3u1fbpfcp-zoom-1.image)

这个小海豚就是 mysql 8 了 点进去默认是启动的。

### 配置环境变量

打开终端输入

```
vim ~/.zshrc
```

在.zshrc 下添加

```
export PATH=$PATH:/usr/local/mysql/bin
export PATH=$PATH:/usr/local/mysql/support-files
```

source 一下，让环境生效

```
source ~/.zshrc
```

测试

```
mysql -uroot -p你的密码
```

![image-20210601193837546](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/597ff35932894809ac218ff280bade16~tplv-k3u1fbpfcp-zoom-1.image)

成功进入 mysql 了

参考：https://blog.csdn.net/qq_42006613/article/details/111773038

## Homebrew

在系统根目录下运行以下命令

```shell
/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"
```

一直回车就行。

安装成功后

```
brew -v
```

![image-20210601110120423](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b58a328779848219c5cf7b05c9e6bc1~tplv-k3u1fbpfcp-zoom-1.image)

参考：https://zhuanlan.zhihu.com/p/111014448

## Node

我用的用 brew 命令安装的

```
brew search node
```

![image-20210601110300711](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6b4ed7b22814a15a0a43cbce4c7f994~tplv-k3u1fbpfcp-zoom-1.image)

可以看到有很多种选择，我直接选的 node，安装下来应该是最新的版本

```
brew install node
```

![image-20210601110419591](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8275a044cb684398a5c343ca2edabd44~tplv-k3u1fbpfcp-zoom-1.image)

## Python

通过 homebrew 命令行安装

```
brew install python3
```

输入`python3`然后弹出以下，代表安装成功

![image-20210601143940289](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/28497e9448c3416b8870e11935a9087a~tplv-k3u1fbpfcp-zoom-1.image)

## 附加一个= =图床工具 PicGo

虽然不是环境，但是确实是电脑必下的软件=-= 毕竟传图得用它

[下载链接](https://github.com/Molunerfinn/PicGo/releases/) 配置在 finder,右键打开详细窗口进行配置

![image-20210601111043398](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6684e1ba69b7474995807ca8ff189a1d~tplv-k3u1fbpfcp-zoom-1.image)

![image-20210601111114537](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fe057d17d6a94e0aaf650909e9f6f66e~tplv-k3u1fbpfcp-zoom-1.image)

如果有什么遗漏的欢迎提供可行的链接，我补充在文章, 节省大家上手 m1 的时间。
