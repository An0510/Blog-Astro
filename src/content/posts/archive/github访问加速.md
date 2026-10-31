---
title: "github 加速访问——Python 代码自动化实现"
published: 2021-04-11
description: "使用代码前可能要修改 hosts 的权限。如果是 windows 直接运行代码就可以了."
tags: ["GitHub", "Python"]
category: "工具与环境"
---

## Python 代码实现

使用代码前可能要修改 hosts 的权限。如果是 windows 直接运行代码就可以了.

```python
import re
import requests
import os

#1.若hosts中本身配置过就删除掉原来配置的。 地址是windows默认存放hosts的位置
with open("C:\Windows\System32\drivers\etc\hosts","r",encoding="utf-8") as f:
    lines = f.readlines()
    #print(lines)
with open("C:\Windows\System32\drivers\etc\hosts","w",encoding="utf-8") as f_w:
    for line in lines:
        #删除包括github.com的那一行内容
        if "github.com" in line:
            continue
        #和上面的同理
        if "github.global.ssl.fastly.net" in line:
            continue
        f_w.write(line)

#2.获取域名对应的ip地址
#二级域名
SecondLevelDomain = "github.com"
url1 = "https://{SecondLevelDomain}.ipaddress.com/".format(SecondLevelDomain=SecondLevelDomain)
#次级域名
SubDomain = "assets-cdn.github.com"
url2 = "https://{SecondLevelDomain}.ipaddress.com/{SubDomain}".format(SecondLevelDomain=SecondLevelDomain, SubDomain=SubDomain)
#大概是给github搞加速的厂商的域名fastly.net
url3 = "https://fastly.net.ipaddress.com/github.global.ssl.fastly.net"

#请求链接
r1 = requests.get(url1)
r1.status_code
r1.encoding = 'utf-8'
#获取响应体
r1=r1.text
# print(r1)
pattern = re.compile('https://www.ipaddress.com/ipv4/[0-9]*.[0-9]*.[0-9]*.[0-9]*')
#https://www.ipaddress.com/ipv4/140.82.113.4
res = pattern.findall(r1)
res = res[0].split("/ipv4/");#切片
res1 = res[1];#获取到ip地址
res1 = res1+" github.com"
print(res1)

r2 = requests.get(url2)
r2.encoding = 'utf-8'
#获取响应体
r2=r2.text
# print(r2)
pattern = re.compile('https://www.ipaddress.com/ipv4/[0-9]*.[0-9]*.[0-9]*.[0-9]*')
#https://www.ipaddress.com/ipv4/140.82.113.4
res = pattern.findall(r2)
res = res[0].split("/ipv4/");#切片
res2 = res[1];#获取到ip地址
res2 = res2+" assets-cdn.github.com"
print(res2)

r3 = requests.get(url3)
r3.encoding = 'utf-8'
#获取响应体
r3=r3.text
# print(r3)
pattern = re.compile('https://www.ipaddress.com/ipv4/[0-9]*.[0-9]*.[0-9]*.[0-9]*')
#https://www.ipaddress.com/ipv4/140.82.113.4
res = pattern.findall(r3)
res = res[0].split("/ipv4/");#切片
res3 = res[1];#获取到ip地址
res3 = res3+" github.global.ssl.fastly.net"
print(res3)

#3.写入hosts文件
f=open("C:\Windows\System32\drivers\etc\hosts","a")
f.write(res1+"\n");
f.write(res2+"\n");
f.write(res3+"\n");
f.close();

#4.刷新DNS缓存
os.system("ipconfig /flushdns")
```

下面是原本需要的操作。上面的操作是基于下面的理论的。

## 1. 获取 GitHub 官方 CDN 地址

链接：https://www.ipaddress.com/

打开后界面：

![image-20210411155236706](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/20210411155236.png)

## 2. 进入后查询这三个链接的 DNS 解析地址，并记录下，后面有用

①：github.com

②：assets-cdn.github.com

③：github.global.ssl.fastly.net

分别输入上面是三个地址，以 github.com 为例

![image-20210411155538104](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/20210411155538.png)

## 3. 修改系统 Hosts 文件

打开系统 hosts 文件(需管理员权限)。
路径：C:\Windows\System32\drivers\etc

![image-20210411155445551](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/20210411155445.png)

在末尾添加三行记录并保存。(需管理员权限，注意 IP 地址与域名间需留有空格)

![image-20210411155345178](https://typora-an.oss-cn-hangzhou.aliyuncs.com/前端/20210411155345.png)

## 4. 刷新系统 DNS 缓存

Windows+X 打开系统命令行（管理员身份）或 powershell

运行

```
 ipconfig /flushdns
```

手动刷新系统 DNS 缓存。

到这里所有工作完毕，可以直接访问了，发现访问速度很快！
