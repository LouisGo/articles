---
title: 记一次 vite + react 的新项目开发（上）
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
  ]
tags: [前端, 最佳实践]
---

# react + vite + ts + tailwindcss + react-query + 星舟不完全踩坑指北（上）

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

## Vite

首先应该是大多数人比较关心的 [Vite](https://cn.vitejs.dev/)

先抛出结论：香。无论是 vue 还是 react 的新项目，建议无脑入，理由如下：

1. 尤大值得信赖
2. 市场反馈热烈，已经有 n 多最佳实践珠玉在前，在 [Awesome Vite.js](https://github.com/vitejs/awesome-vite#templates) 里你基本能找到你想要的一切快速启动模版，这个项目正是基于 [vite-react-tailwind-template](https://github.com/Innei/vite-react-tailwind-template) 开发
3. 现有版本已经来到 v2.6+，绝大多数实质影响开发和生产的 bug 已经排的差不多了~~（虽然此时此刻 issues 的数字也来到了 500+）~~
4. 各种现代的开发工具和插件开箱即用，比如各种 CSS 预处理器、ts、monorepo、节省了很多 webpack 那样倒腾配置的时间
5. 最重要的一点：开发体验真的好太多了，启动快、热更新快、构建快各种快，丝般顺滑。有兴趣可以了解下[基本原理](https://cn.vitejs.dev/guide/why.html#slow-server-start)

![image.png](https://i.loli.net/2021/10/27/nykqpGv5xfEZmIu.png)

**值得注意的是：使用 SSR 渲染的项目可能仍需要进一步观察，因为 vite 官方的 SSR 支持正处于试验阶段，属于实验性功能**。当然整套方案的输出还是有完整闭环的，[Awesome Vite.js](https://github.com/vitejs/awesome-vite#templates) 也有相关的运行模版

以下是几个大家可能关心的问题：

### react 支持度

vite 其实与前端 UI 框架无关，就像 webpack 不会限制你使用 react、vue 还是 angular

官方基于 [@vitejs/plugin-react](https://github.com/vitejs/vite/tree/main/packages/plugin-react) 提供了完整的 react 支持，具备以下几个主要的能力：

- 基于 [react-refresh](https://www.npmjs.com/package/react-refresh)实现开发环境的快速刷新（可配置 refresh 范围，搭配原生 ESM，使得开发体验丝滑如德芙
- 使用 [automatic jsx](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) 运行时，react 官方钦定的未来 jsx transform，使得：
  1. 在.jsx 和.tsx 中可以不用再手动`import React from 'react'`
  2. 更好的性能表现
  3. 未来不再需要`React.forwardRef`
  4. 更小的打包尺寸
  5. 自动替换旧的`React.createElement`方法，获取更快的浏览器解析速度
- 通过 vite 的`resolve.dedupe`配置（默认不用配），对项目内引入的 react 和 react-dom 依赖去重
- 使用自定义的 babel 插件和预设，具备自由度
- 中间件模式的支持

使用方式很简单：

```typescript
// vite.config.ts
// 所有配置项均可获得完美的ts类型提示
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // 使用
  server: {
    host: true,
    port: 3090,
    https: true, // 开启https
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 别名，结合tsconfig.json.compilerOptions.paths使用
    },
  },
});
```

### 兼容性支持

vite 默认的生产构建环境假设你的目标浏览器支持现代 js 语法，所以 vite 只做语法转译，默认不包含任何 polyfill。

但是可以通过官方提供的 [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) 插件获得传统浏览器的支持。

使用同样非常简单：

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
// ...
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    //...
    legacy({
      polyfills: ['es.promise.finally'], // 获得promise.finally的支持，用来控制polyfill粒度
      // ...
      targets: ['ie >= 11'], // 假如需要获得IE11+的支持
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // 加上整套polyfills
    }),
  ],
  // ...
});
```

它将注入`import.meta.env.LEGACY`环境变量，然后自动生成传统版本的 chunk 及与其相对应 ES 语言特性方面的 polyfill。兼容版的 chunk 只会在不支持原生 ESM 的浏览器中按需加载：

![index.html](https://i.loli.net/2021/10/26/kHC6N25DLoy7wBK.png)

可以看到在不支持 module type 的环境中运行时，vite 生成的 js 会自动帮我们切换到 legacy 版本的运行时 chunks

### 环境变量

传统 webpack 项目我们可以通过`NODE_ENV`传递环境变量，然后在`process.env.NODE_ENV`中取。

在 vite 中则是暴露在一个特殊的`import.meta.env`全局对象中，其中有一些内置的变量：

- `import.meta.env.MODE`: {string} 应用运行的模式。
- `import.meta.env.BASE_URL`: {string} 部署应用时的基本 URL。他由 base 配置项决定。
- `import.meta.env.PROD`: {boolean} 应用是否运行在生产环境。
- `import.meta.env.DEV`: {boolean} 应用是否运行在开发环境 (永远与 - import.meta.env.PROD 相反)。

vite 遵循 dotenv 规范从项目根目录的下列文件中加载额外的环境变量，通过`import.meta.env`可以获取：

```
.env                # 所有情况下都会加载
.env.local          # 所有情况下都会加载，但会被 git 忽略
.env.[mode]         # 只在指定模式下加载
.env.[mode].local   # 只在指定模式下加载，但会被 git 忽略
```

为了防止意外的环境变量泄露，只有以 `VITE_`为前缀的变量才会暴露给经过 vite 处理的代码，如下面的 PASSWORD 不会出现在客户端

```
# .env
PASSWORD=123456
VITE_DEBUG_TOKEN=666666
```

同时可以结合*模式*的概念在开发和生产环境完成更多灵活功能，比如在我们的项目中通常会有`dev`、`beta`、`prod`三个环境变量，可以用来处理请求 url，那么

```json
// package.json
// 通过--mode 传参
{
  "scripts": {
    "dev": "vite --mode dev", // 开发环境使用dev环境请求
    "dev:beta": "vite --mode beta", // 开发环境使用beta环境请求
    "dev:prod": "vite --mode prod", // 开发环境使用prod环境请求
    "build": "tsc && vite build" // 生产环境，默认读取.env
  }
}
```

本地根目录新增对应的三个.env 文件：`.env.dev`、`.env.beta`、`.env.prod`，以`.env.beta`为例：

```
# .env.beta
VITE_APP_HOST_ENV=b2bmir
```

`utils/path.ts`处理实际环境地址：

```typescript
const isProduction = import.meta.env.PROD;

// 开发环境取实际传递的mode
let appHost = import.meta.env.VITE_APP_HOST_ENV;

// 生产环境根据实际host解析（星舟打包的特殊性，没办法通过环境变量做环境区分，因为prod直接从beta拉取文件资源）
if (isProduction) {
  const host = window.location.host;
  if (host.includes('b2btst')) {
    appHost = 'b2btst';
  } else if (host.includes('b2bmir')) {
    appHost = 'b2bmir';
  } else if (host.includes('mycaigou')) {
    appHost = 'mycaigou';
  }
}
```

### 构建优化

有个误区是很多人觉得 vite 只是用来提高开发效率的工具，无法取代 webpack 完成生产环境的构建。但实际上依托 Rollup 社区，vite 已经完全可以开发构建一把抓，实现了如 CSS 分割避免 FOUC、预加载指令生成、异步 Chunk 加载优化等优化方案，并且提供了较为健壮灵活的构建配置。

下面是我进行的一些构建优化：

#### 代码分割

当执行`yarn build`指令时有时会看到控制台有一行友情提示：

![image.png](https://i.loli.net/2021/10/26/tpJ1PEmfoluLqGr.png)

意思是我们第三方的 vendor 包打出来超过了 500K 的警告线，当然可以手动调整这个 size 到 800K 或者更高，但更好的做法可能是使用运行时动态 import 或者使用`build.rollupOptions.output.manualChunks`进行 Code Splitting 操作：

```typescript
import { defineConfig } from 'vite';
// ...

// https://vitejs.dev/config/
export default defineConfig({
  // ...
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // split chunk
          if (id.includes('node_modules')) {
            // 找到包名
            const packageName = id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
            // 这里的操作视项目而定，甚至可以打每个包
            // 单独的众安包（after tree-shaking）
            if (packageName === 'zarm') {
              return 'zarm';
            }
            // 单独的lodash包（after tree-shaking）
            if (packageName === 'lodash') {
              return 'lodash';
            }
            // 其它
            return 'vendor';
          }
        },
      },
    },
  },
});
```

![image.png](https://i.loli.net/2021/10/26/3S74irW5lBdPucq.png)

值得注意的是此时所有打包出来的 js、css 静态资源都平铺在`dist/assets/`目录下，强迫症患者可以通过下列配置（参考[Rollup 配置文档](https://rollupjs.org/guide/en/#big-list-of-options)）整理一下目录：

```typescript
export default defineConfig({
  // ...
  build: {
    assetsDir: 'static/img/',
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  // ...
});
```

#### Zarm 样式按需加载

Zarm 默认支持基于 ES module 的 tree shaking，但是样式包`zarm/dist/zarm.css`引入默认是全量的，会带来额外 170+kb 的大小，在移动端是个不小的负担，可以通过`vite-plugin-importer` plugins 进行样式的按需引入（其他 UI 框架同理）：

```typescript
import usePluginImport from 'vite-plugin-importer';

export default definConfig({
  plugins: [
    //...
    usePluginImport({
      libraryDirectory: 'es',
      libraryName: 'zarm',
      style: 'css', // 用css可以不用安装sass
    }),
  ],
});
```

我这个项目打包出来的 css 减到了 50kb

## tailwindcss

对于这个众说纷纭的 CSS 框架，真正实践前我也是带着很多的问号。告一段落之后，这里更多谈自己的一些感悟和体会

### 心理障碍

还未开始使用前阻挡我使用 tailwindcss 的最大障碍可能是**学习成本**。

无论 sass 还是 less，一旦配置好环境后续的开发过程是能直接提速的，加了嵌套语法非但不会影响我们从传统 css 写法过渡，甚至更加解放了程序员的生产力，这些都是肉眼可见的提升

然后对比 tailwindcss 这种原子化的写法：

1. 要记各种样式的简称，看起来是个超大的工程
2. 没办法随意写样式，毕竟提供的预设样式肯定不可能面面俱到，css 的灵动思考似乎被束缚了
3. 要改变传统引入样式文件和与之配套的优化操作等习惯

看起来就头大？

实践过这个项目之后，这 3 点分别迎刃而解：

1. 跟任何一门新概念的技术一样，该记的东西肯定是要记，但是 tailwindcss 的记忆量可能比你想象的少很多很多。依托 VS Code 的[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)插件，能迅速联想到你需要的样式，并且因为这些样式实际上都是有迹可循的，任何一个普信猿在一个下午的开发时间内也能掌握 80% 左右的样式名，剩下的翻文档就行了，真的不是事儿 ![image.png](https://i.loli.net/2021/10/27/CKnNgrXxWf7ltc3.png)

2. 看目的。如果项目本意便是天马行空纵情山水，则 tailwindcss 对你施加的限制确实如同紧箍咒，肯定不如直接 css 一把梭痛快；但如果想要制定 CSS 样式规范，那 tailwindcss 则是一把趁手的好武器，至少样式规范约束方面我真的没想到有其他更优解。此时的限制正实实在在的帮助团队建立规范，当然，事在人为 ![image.png](https://i.loli.net/2021/10/27/8OPp3WKyvwuFx1e.png)

3. 如果有更好的形式去解决问题，那么传统习惯就是用来打破的，不破不立。并且，tailwindcss 和传统 css 写法并非水火不容，你完全可以两个都要，~~当然不太建议~~

#### 透过现象看本质

我把 tailwindcss 之于 css 类比于 typescript 之于 js：

- 想用 typescript 需要先理解概念，学习用法
- 用强类型约束弱类型的 js 语言。需要花很多时间定义 interface 和 type、花很多时间在代码运行前解决类型错误、花一些时间迁移旧的代码
- 不能再任性，当然你可以 any script，但，事在人为

转换一下角度你就会发现，如果你在一个项目中支持使用 typescript 就很难有理由拒绝 tailwindcss，因为本质上他俩解决的是同一类问题

更何况，用了 tailwindcss 还可以摆脱**取名字**这么一个千古难题，什么 BEM 规范、命名空间、样式污染统统丢掉，美妙的样式巧妙的收束在了每个 UI 框架都突出的核心——组件里。换言之，我们写一个 react 组件无需再花费大量的心智去思考 html 构造和 css 层级的关系，因为他们都封装在了你最应该关注的组件里，**如果你的样式需要复用，那就抽成组件吧**。

**什么是组合大于继承啊？**战术后仰.jpg。

#### 还得扯点技术

如果有人用了 tailwindcss 却不加 purge 配置，成分绝对有问题，完全可以打成甲级战犯。因为全量打入的代价是生产包会多出来接近 4M 的体积，可能是你项目本体的好几倍，所以一定要记得加上 purge 配置：

```javascript
// tailwind.config.js
module.exports = {
  purge: ['./src/pages/**/*.tsx', './src/components/**/*.tsx'], // 实际写css的地方
  // ...
};
```

purge 之后我的项目打包之后 css 部分只有 17k，成功瘦身 99.54%

`tailwind.config.js`里其他颜色、字体、动画等完全可以抽成公共配置对象，新项目引入即带来相当程度的样式规范，这不比博人传燃？

## 接入新舟

可以参考一下两篇好文，后面我也要适时梳理一下更详细的步骤，以防忘记：

[云采购【星舟】上手攻略](https://docs.qq.com/doc/DUkFka3Ztd2NqQ09B?_t=1635233274506)

[星舟迁移-前端操作手册]https://confluence.mysre.cn/pages/viewpage.action?pageId=49715566

## To be continued

- [ ] react 全局状态管理思考
- 几种方案的探索过程
- 各自的痛点
- [ ] react-query
- 实际解决了什么问题
- 和 swr 和 ahooks 异同点
- query 和 mutation 的区别
- 记录一些坑
- [ ] router-guard
- vue-router 是怎么做的
- 代码献丑
