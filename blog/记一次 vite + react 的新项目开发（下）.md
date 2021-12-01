---
title: 记一次 vite + react 的新项目开发（下）
date: 2021-10-27
author: LouisGo
author_title: 一介前端
author_image_url: https://i.loli.net/2021/07/10/sfmijBHXGraYDTA.jpg
keywords:
  [
    react,
    vite,
    react-query,
    tailwind,
    tailwindcss,
    typescript,
    全局状态管理,
    router
  ]
tags: [前端, 最佳实践]
---

# react + vite + ts + tailwindcss + react-query + 星舟不完全踩坑指北（下）

**本文主要记录许多第一次运用的技术的实战探索踩坑过程**

项目背景：服务于峰会，一款较为独立的用于线下行业专家对供应商进行数字化评选的工具，业务本身并不复杂，因此可玩性主要在于技术的自由度

项目地址：https://git.mycaigou.com/ycg/offline-expert-review-tool

线上地址：https://summit-expert-review.b2btst.com?directoryId=64

主要技术选型：

- 前端框架：[React v17+](https://reactjs.org/) Hooks 写法
- 前端路由：[react-router v5+](https://reactrouter.com/web/guides/quick-start)
- 开发和构建工具：[Vite v2.6.10](https://cn.vitejs.dev/)
- 强类型约束：[TypeScript](https://www.typescriptlang.org/)
- css 框架：[TailwindCss](https://www.tailwindcss.cn/)
- 数据管理：[react-query](https://react-query.tanstack.com/)
- 移动 UI 框架：[Zarm 众安](https://zarm.design/#/docs/introduce)
- 高性能表单：[React Hook Form](https://www.react-hook-form.com/)

## react 全局状态管理思考

### 你可能不需要 redux

真没必要

### 全局状态管理的是什么

梳理真正需要贯穿始终的数据和状态

### 现有做法

redux/mobx/recoil/unstated/context/

### 如何抉择

## react-query

响应式
基于Context Api
结合hooks写法
全局缓存

### 理念和动机

### 全局状态管理方案

### 缓存

### swr 和 ahooks

### 坑

## router-guard

### vue-router 的做法

路由守卫勾子函数
### react-router 的做法

HOC