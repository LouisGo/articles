# 问题记录

## 环境问题记录

`connectMobileFrontend` 项目构建之后持续 502 的问题根源是**npm 依赖进行了更新，然而 jenkins 构建却并没有自动执行 `npm install` 指令**

现在的解决办法是依赖运维在容器里手动触发指令

后续的方案是把这个奇怪的旧项目链路梳理完成并上到 k8s，规范化自动化构建流程

## Canvas 和 SVG

### Canvas 适用场景

Canvas 提供的功能更原始，适合像素处理，动态渲染和大数据量绘制

### SVG 适用场景

SVG 功能更完善，适合静态图片展示，高保真文档查看和打印的应用场景

![](https://pic4.zhimg.com/80/9b0e2025971c2ee23154f7331ac59426_720w.jpg?source=1940ef5c)
