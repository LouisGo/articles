# react + vite + ts + tailwindcss + react-query + 星舟不完全踩坑指北

**本文旨在记录许多第一次运用的技术的实战踩坑过程，实乃抛砖引玉**

项目背景：服务于峰会，一款较为独立的用于线下行业专家对供应商进行数字化评选的工具，业务本身并不复杂，因此可玩性主要在于技术的自由度

项目地址：https://git.mycaigou.com/ycg/offline-expert-review-tool

线上地址：https://summit-expert-review.[env].com?directoryId=[id]

主要技术选型：

- 前端框架：[react v17+](https://reactjs.org/)，完全 hooks 写法
- 前端路由：[react-router v5+](https://reactrouter.com/web/guides/quick-start)
- 开发和构建工具：[vite v2.6.10](https://cn.vitejs.dev/)，香气四溢
- 强类型约束：[typescript](https://www.typescriptlang.org/)，不解释
- css 框架：[tailwindcss](https://www.tailwindcss.cn/)，两级反转
- 数据管理：[react-query](https://react-query.tanstack.com/)，你可能真的不需要 redux
- 移动 UI 框架：[Zarm 众安](https://zarm.design/#/docs/introduce)，简约且简单
- 高性能表单：[React Hook Form](https://www.react-hook-form.com/)

## vite

首先应该是大多数人比较关心的 vite，先抛出结论：香。无论是 vue 还是 react 的新项目，建议无脑入，理由如下：

1. 市场反馈热烈，已经有 n 多最佳实践珠玉在前，在[Awesome Vite.js](https://github.com/vitejs/awesome-vite#templates)里你基本能找到你想要的一切快速启动模版，本文正是基于[vite-react-tailwind-template](https://github.com/Innei/vite-react-tailwind-template)
2. 现有版本已经来到 v2.6+，大多数实质影响开发和生产的 bug 已经排的差不多了
3. 尤大值得信赖
4. 最重要的一点：开发体验真的太太太好了，可以类比从刀耕火种的 jQuery 时代过渡到 react/vue 吞噬一切的时代，未来哪怕不属于 vite，也肯定会遵从 vite 的现有模式发展将 webpack 拍死在沙滩上

**值得注意的是：使用 SSR 渲染的项目可能仍需要进一步观察，因为 vite 官方的支持正处于试验阶段，属于实验性功能**。当然整套方案的输出还是有完整闭环的，[Awesome Vite.js](https://github.com/vitejs/awesome-vite#templates)也有相关的运行模版，未来可期

下面开始介绍几个大家关心的核心问题：

### react 支持

vite 其实与前端 UI 框架无关，就像 webpack 不会限制你使用 react、vue 还是 angular。

官方基于[@vitejs/plugin-react](https://github.com/vitejs/vite/tree/main/packages/plugin-react)提供了完整的 react 支持，提供了以下几个主要的能力：

- 基于[react-refresh](https://www.npmjs.com/package/react-refresh)实现开发环境的快速刷新（可配置 refresh 范围）
- 使用 [automatic jsx](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)运行时，react 官方钦定的未来 jsx transform，使得：
  1. 在.jsx 和.tsx 中可以不用再手动`import React from 'react'`
  2. 更好的性能表现
  3. 未来不再需要`React.forwardRef`
  4. 更小的打包尺寸
  5. 自动替换旧的`React.createElement`方法，获取更快的浏览器解析速度
- 通过 vite 的`resolve.dedupe`配置（默认不用配），对项目内引入的 react 和 react-dom 依赖去重
- 使用自定义的 babel 插件和预设
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

但是可以通过官方提供的[@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)插件获得传统浏览器的支持。

使用非常简单：

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
      polyfills: ['es.promise.finally'], // 获得promise.finally的支持
      // ...
      targets: ['ie >= 11'], // 假如需要获得IE11+的支持
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // 记得加上这个
    }),
  ],
  // ...
});
```

它将自动生成传统版本的 chunk 及与其相对应 ES 语言特性方面的 polyfill。兼容版的 chunk 只会在不支持原生 ESM 的浏览器中进行按需加载：

![index.html](https://i.loli.net/2021/10/26/kHC6N25DLoy7wBK.png)

可以看到在不支持 module type 的环境中运行时，vite 生成的 js 会自动帮我们切换到 legacy 版本的运行时 chunks

### 环境变量

传统 webpack 项目我们可以通过 NODE_ENV 传递环境变量，然后在`process.env.NODE_ENV`中取。

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

同时可以结合*模式*的概念在开发和生产环境完成更多灵活功能，举个例子：

我们的系统通常会有`dev`、`beta`、`prod`三个环境变量，可能用来处理请求 url，那么

```json
// package.json
// 通过--mode 传参
{
  "scripts": {
    "dev": "vite --mode dev", // 开发环境使用dev环境请求
    "dev:beta": "vite --mode beta", // 开发环境使用beta环境请求
    "dev:prod": "vite --mode prod", // 开发环境使用prod环境请求
    "build": "tsc && vite build" // 生产环境
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

有个误区是有人觉得 vite 只是用来提高开发效率的工具，无法完成生产环境的构建。但实际上依托 Rollup 社区，vite 已经完全可以开发构建一把抓，并且提供了健壮灵活的构建配置。

下面是我进行的一些构建优化：

#### 分包

当执行`yarn build`指令时我看到控制台有一行友情提示：

![image.png](https://i.loli.net/2021/10/26/tpJ1PEmfoluLqGr.png)

意思是我们第三方的 vendor 包打出来超过了 500K 的警告线，我们当然可以手动调整这个 size 到 800K 或者更高，但更好的做法可能是使用动态 import 或者使用`build.rollupOptions.output.manualChunks`进行精细化分包操作：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // ...
  ],
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

#### Zarm 样式按需加载

Zarm 默认支持基于 ES module 的 tree shaking，但是如果完整引入`zarm/dist/zarm.css`样式包，依然会带来额外的 100+kb 的大小，在移动端是个很大的负担

env 处理 dev beta prod

tsconfig： skipLibCheck 处理 paths

vite build:

分包 异步 chunk 优化

zarm 按需加载

# 全局状态管理思考：

# router-guard:

# react-query：

- 和 swr 和 ahooks 异同点
- query 和 mutation 的区别
- mutate 回调注意点
- id 的用法

# tailwindcss：

- 透过现象看本质
- 实际体验

# 接入新舟：

[云采购【星舟】上手攻略](https://docs.qq.com/doc/DUkFka3Ztd2NqQ09B?_t=1635233274506)

[星舟迁移-前端操作手册 by 国威]https://confluence.mysre.cn/pages/viewpage.action?pageId=49715566
