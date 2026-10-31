---
title: "jenkins自动化部署Vuepress(下)-新建任务以及任务配置"
published: 2021-06-04
description: "在 Jenkins 中新建任务，配置源码管理、SSH 密钥和构建步骤，实现 push 后自动部署。"
tags: ["Jenkins", "CI/CD"]
category: "工具与环境"
---

### 新建任务

![image-20210506211405930](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506211405930.png)

### General

![image-20210506211649955](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506211649955.png)

### 源码管理

![image-20210506212623976](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506212623976.png)

生成公私钥

```
ssh-keygen -t rsa -C "你的邮箱地址"
```

连续回车三次，会在linux(云服务器)的~/.ssh文件里生成公钥`id_rsa.pub`和私钥`id_rsa`，公钥需要添加到github的

```
cd ~/.ssh
cat id_rsa.pub
```

#### 1.复制返回的公钥的值，添加到github的SSH key中

![image-20210506213121935](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506213121935.png)



```
cat id_rsa
```

#### 2.复制返回的私钥的值，添加到Credentials中，点击添加

![image-20210506213752198](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506213752198.png)

#### 3.然后在Credentials选中该凭证即可。

![image-20210506225214579](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506225214579.png)

### 构建触发器

![image-20210506213910710](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506213910710.png)

### 构建环境

#### 1.添加webhook(你当前项目的settings里选)

![image-20210506214424259](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506214424259.png)

点击添加

![image-20210506214614024](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506214614024.png)

因为我们的目的是push后自动化构建，所以其实只需要push event就行，添加好以后测试连接

#### 2.安装nodejs

![image-20210506224404226](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506224404226.png)

在可选插件里搜索NodeJS Plugin安装并restart jenkins

![image-20210506224429572](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506224429572.png)

然后到

![image-20210506224833300](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506224833300.png)

#### 3.接着配置任务

![image-20210506224116398](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506224116398.png)

### 构建

![image-20210506230333986](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210506230333986.png)

```shell
echo $WORKSPACE #看一下工作目录在哪
node -v
npm -v
npm install&& #更新依赖
npm run docs:build #build打包
```

构建和打包是在jenkins服务器内部的，你在构建这一部分写的所有的命令行，其实是以`/var/lib/jenkins/workspace/你的任务名称`为路径的操作,shell也只能在以jenkins为~的情况下进行操作，就是说你虽然把jenkins部署在云服务器上，但是这里的shell脚本只能管云服务器里的jenkins服务器(/var/lib/jenkins/)里的东西。
然后直接就可以保存了。

## 执行任务测试

![image-20210507170920367](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210507170920367.png)

点击build now进行测试。

![image-20210507170950287](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210507170950287.png)

在每一次的测试中都可以看控制台输出，方便快速定位错误。

## 修改Nginx指向

这时候把Nginx指向每次在jenkins工作空间下打包好的静态文件就行了。

```
/var/lib/jenkins/workspace/vuepress下运行的
```

因此是`/var/lib/jenkins/workspace/vuepress/public`(这里静态文件夹每个项目不同，我这个是public,有的是dist之类的)。

## VSCode提交和Push

1. 把github仓库clone到本地(如果你本地已经有了库就可以跳过这一步)

   在你想要存放的文件夹下执行

   ```
   git clone https://github.com/用户名/xxx.git
   ```

   文件目录

   ```
   --你执行命令的文件夹
     --xxx文件夹(你clone下来的)
   ```

   每次把文章写好直接放在分类下就可以了。只要放到你的本地从github上clone下来的文件夹的任意位置或是你修改了任何东西，vscode都会提醒你有改变

2. 提交，下面显示的就是你修改的或是添加的文件或文件夹

   ![image-20210512114527982](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210512114527982.png)

3. 根据提示，你需要填写你的提交信息并回车提交。

   ![image-20210512114742796](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/image-20210512114742796.png)

4. 推送到你的远程github库里，也就是Push

   ![image-20210512115026617](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210512115026617.png)
