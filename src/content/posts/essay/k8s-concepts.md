---
title: "K8s 核心概念图解：从一家汉堡店开始"
published: 2026-10-29
description: "一份可交互的 Kubernetes 入门图解：集群、Pod、工作负载、Service、Ingress、Helm、镜像仓库，点一点就能看懂请求怎么流转。"
tags: ["Kubernetes", "交互图解"]
category: "随笔"
---

把 TKE 产品概念（集群 / Pod / 工作负载 / Service / Ingress / Helm / 镜像仓库）放进一张可以点击的图里，再在本机 colima k3s 上动手跑一遍。

**👉 [打开全屏交互图解](/demos/k8s-concepts/)**

图解里包含五个部分：

1. 全景图：点击任意方块查看解释，点「模拟一次请求」看流量怎么走
2. 七个核心概念
3. TKE 控制台流程与本机命令的对照
4. 动手实践（逐行讲解）
5. 常见坑
