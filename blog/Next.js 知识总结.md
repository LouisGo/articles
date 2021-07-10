---
title: Next.js 知识点总结
date: 2021-07-02
author: LouisGo
author_title: 一介前端
author_image_url: https://i.loli.net/2021/07/10/sfmijBHXGraYDTA.jpg
keywords: [Next, Next.js, nextjs, nextjs中文文档, react]
tags: [前端, Next.js]
---

# Next.js 知识点总结

根据 Next 英文文档翻译（中文站翻译进度捉鸡）加以自己的实践总结而成，不会照本宣科照搬，直切关注点。

## 核心概念

首先摆脱传统 CSR 的观念，即：所有数据异步获取，在这之前要么白屏要么用骨架屏占位。

next 是围绕着页面（pages）的概念构造的。一个 page 就是从一个`pages`目录下的`.js`、`.jsx`、`ts`、`tsx`文件中导出的 React 组件，根据其文件名自动与路由进行关联。

next 最重要的概念是**预渲染（Pre-rendering）**。

默认情况下，所有页面都将被提前预渲染成 HTML。每个生成的 HTML 只关联这个页面所需的最小可执行 JS 代码，当页面被浏览器加载、JS 运行并使得该界面变成可交互状态（Time to Interactive）。**这个过程被称之为水合（hydration）**。

next 有两种主要的预渲染方式，两者的不同之处在于为页面生成 HTML 的时机（在开发环境中为了方便调试，强制开启 SSR），允许两种方式混合使用，可结合实际业务场景灵活选择。

- **静态页面生成 SSG（Static Side Generation）**：在构建时生成 HTML 的预渲染方法，每次请求都会返回**相同的预渲染页面**，千人一面。该模式下还派生出一种混合式的 **ISR**（Incremental Static Regeneration）增量静态重新生成方式。
- **服务端渲染 SSR (Service Side Rendering)**：每次请求**都会生成新的 HTML** 的预渲染方法，千人千面。

<!--truncate-->

### SSG 和 ISR

SSG 不完全是静态的，可以通过在渲染页面中同级暴露一个`getStaticProps` **async** 方法根据动态数据展示界面。在**构建时**会自动探测执行这个方法，根据返回的异步结果做下一步的渲染。（开发环境中，每次请求都会触发）

```typescript
// 基本用法
export default function Home(props) { ... }

// 暴露这个函数
export async function getStaticProps(context) {
  // Get external data from the file system, API, DB, etc.
  const data = ...

  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: ...
  }
}
```

context 对象包含如下字段：

- `params`：包含使用动态路由页面的路由参数，需要结合`getStaticPaths`使用
- `previews`：设置为 `true` 则该页面处于预览模式，默认 `undefined`
- `previewData`：存放`setPreviewData`后的预览数据
- `locale`：当前激活的多语言（如开启开语言）
- `locales`：当前支持的多语言（如开启开语言）
- `defaultLocale`：配置的默认多语言（如开启开语言）

`getStaticProps`函数的返回对象格式如下：

- `props`：一个可选对象，将会被 page 通过 props 参数接收，需是一个可序列化的对象
- `revalidate`：一个可选的布尔值或者数值（默认为 false），**用于 ISR**，以秒为单位来确定静态页面增量重新生成的频率。
- `notFound`：一个可选的布尔值，允许页面返回 404 状态以进入 not found 页面（即时该页面之前被成功生成）
- `redirect`：一个可选的配置对象，用来重定向内部和外部资源。类型信息略。

**`getStaticProps` 只会在服务端运行，只能 page 模块中页面中导出**。

实际上当静态生成后，运行`getStaticProps`的结果信息将以 JSON 的格式持久化在页面 HTML 的 script 引用中，这意味着 next 在此时只是从 JSON 中获取所需的数据并且注入到页面中。

但当使用 ISR 时，我们无需重新生成整个站点便可新建或者更新页面。**在发生新的请求的前提下，`getStaticProps`将在服务端根据`revalidate`配置的时间（以一种类似于 throttle 的形式）重新执行并生成新的 JSON**。用户会在合适的时间看到更新后的页面（值得注意的是，下图中超过 60s 后的**第一次请求仍然将返回之前缓存页面**，哪怕在 10min 中后访问，但这次请求将在服务器后台触发一次 ISR，更新成功后的请求才可以看到船新版本）。这一个过程对终端用户是无感的，因为遵循 SWR（Stale While Revalidate） 策略。

当访问一个从未生成页面的路径，next 将在这次请求中执行服务端渲染，以后的请求将访问这之后缓存的静态文件。

![ISR](https://i.loli.net/2021/07/05/CgjtSVYPLUvEoI1.png)

**ISR 同样并非所有问题的银弹，根据场景正确使用**。

为了性能考虑，官方推荐尽可能使用 SSG 和 ISR，因为每个页面只需要构建一次并且可以托管到 CDN 服务器。

参考 SSG & ISR 的如下使用场景：

- 渲染页面所需的数据构建时可以提前获取，无需依赖用户请求
- 数据来自于无头的内容托管平台
- 数据可以被公开缓存（不是用户特定数据）
- 页面需要极致的 SEO 和访问速度

### SSR

SSR 中取代 `getStaticProps` 的是 `getServerSideProps`，用法是一样的。

因为 `getServerSideProps` 的请求时机是请求时（request time），因此该函数的 context 参数包含了特定请求参数。

```typescript
export async function getServerSideProps(context) {
  return {
    props: {
      // props for your component
    },
  };
}
```

context 对象包含如下字段：

- `params`：如果页面使用了动态路由，该对象则包含相关的路由参数，如果 page 的名字为`[id].js`，那么该对象看起来就是`{ id: 'xxx' }`
- `req`：HTTP IncomingMessage object，HTTP 请求信息对象，参考 NextApiRequest ts 类型
- `res`：HTTP response object，HTTP 返回信息对象，参考 NextApiResponse ts 类型
- `query`：url 查询对象
- `previews`：设置为 `true` 则该页面处于预览模式，默认 `undefined`
- `previewData`：存放`setPreviewData`后的预览数据
- `resolvedUrl`：标准化的请求 URL
- `locale`：当前激活的多语言（如开启开语言）
- `locales`：当前支持的多语言（如开启开语言）
- `defaultLocale`：配置的默认多语言（如开启开语言）

`getServerSideProps`函数的返回对象格式如下：

- `props`：一个可选对象，将会被 page 通过 props 参数接收，需是一个可序列化的对象
- `notFound`：一个可选的布尔值，允许页面返回 404 状态以进入 not found 页面（即时该页面之前被成功生成）
- `redirect`：一个可选的配置对象，用来重定向内部和外部资源。类型信息略。

**只有当页面需要的预渲染数据必须在请求时（request time）才能获取方才考虑这种方案**。`getServerSideProps`的 TTFB 时间会比 `getStaticProps` 慢，因为服务器必须在每个请求中计算结果，并且在没有额外配置的情况下无法通过 CDN 缓存结果。

SSR 也可以结合传统的 CSR（Client Side Rendering）策略，根据实际业务场景灵活搭配。

### 图谱

无数据的静态生成： ![无数据的静态生成](https://www.nextjs.cn/static/images/learn/data-fetching/static-generation-without-data.png) 根据动态数据的静态生成： ![根据动态数据的静态生成](https://www.nextjs.cn/static/images/learn/data-fetching/static-generation-with-data.png)

getStaticProps： ![getStaticProps](https://www.nextjs.cn/static/images/learn/data-fetching/index-page.png)

服务端渲染： ![服务端渲染](https://www.nextjs.cn/static/images/learn/data-fetching/server-side-rendering-with-data.png)

无数据静态生成+客户端渲染： ![无数据静态生成+客户端渲染](https://www.nextjs.cn/static/images/learn/data-fetching/client-side-rendering.png)

## 动态路由

### 使用方式

在 next 中可以在 pages 的页面中用 `[param]` 的形式创建一个动态路由，其中`[` 和`]`中间的单词可以根据实际业务更改，如 id、content、slug...

比如在 `pages/post/[pid].js`中，`post/1`、`post/abc`等会被路由匹配上，命中的路由参数将以 query 的形式合并其它 query 参数传入实际页面。如`post/abc?foo=bar&pid=123`的 query 对象就是：

```javascript
{
  pid: 'abc', // pid=123这条参数将被路由参数重载
  foo: 'bar'
}
```

嵌套路由遵循相同规则，如`pages/post/[pid]/[comment].js`将会匹配`/post/abc/a-comment`，query 对象为：

```javascript
{
  pid: 'abc',
  comment: 'a-comment'
}
```

值得注意的是, 假如 `[pid].js` 的同级存在其它具名路由页面（如此时存在`pages/post/create.js`），则动态路由不会匹配该具名路由。也就是匹配`/post/1`、`/post/abc`, 不会匹配 `post/create`。

#### 捕捉所有路由

上面的例子使用 `[...pid]`这种格式可以拓展捕捉所有子孙路径（不包含自身），如`pages/post/[...pid].js`匹配：

- `/post/a`
- `/post/a/b`
- `/post/a/b/c`
- ...

匹配的路由参数将以数组的形式存在 query 对象中：

```javascript
// /post/a
{
  pid: ['a'];
}
// /post/a/b/c
{
  pid: ['a', 'b', 'c'];
}
```

#### 可选的捕捉所有路由

使用两个中框号 `[[...pid]]`可以拓展捕捉包括自己（空对象`{}`）在内的所有子孙路径，如`pages/post/[[...pid]].js`匹配：

- `/post`
- `/post/a`
- `/post/a/b`
- `/post/a/b/c`
- ...

此时的 query 对象：

```javascript
// post
{
}
// /post/a
{
  pid: ['a'];
}
// /post/a/b/c
{
  pid: ['a', 'b', 'c'];
}
```

### 页面改造

除了渲染逻辑外，在`pages/post/[pid].js`中新增 `getStaticPaths` async 函数，该函数返回的 paths 信息里携带一个 params 对象包含 pid 的信息： `{ params: { pid: 'xxx' }}`。同`getStaticProps`一样，在开发环境中，每次请求都会触发

```typescript
// 函数体
export async function getStaticPaths(): GetStaticPaths {}
// 大致类型信息
type GetStaticPaths<P extends ParsedUrlQuery = ParsedUrlQuery> = (
  context: GetStaticPathsContext
) => Promise<GetStaticPathsResult<P>> | GetStaticPathsResult<P>;

export type GetStaticPathsResult<P extends ParsedUrlQuery = ParsedUrlQuery> = {
  paths: Array<string | { params: P; locale?: string }>;
  fallback: boolean | 'blocking';
};
```

#### fallback

- `fallback: false`：所有没有经过 `getStaticProps` 返回的页面将在`getStaticPaths`中统一指向 404 页面，不再往下进行其它操作
- `fallback: true`：
  - `getStaticPaths`中返回的路径将会继续在构建时运行`getStaticProps`生成 HTML
  - 不再统一指向 404 页面，取而代之的是提供一个 fallback“回退版本”的页面给第一次访问这个页面的请求（fallback 的页面逻辑需要结合`next/router`的`useRouter`判断`router.isFallback === true`进行）
  - 与此同时在后台 next 将会为这次请求执行 SSG 策略生成对应的 HTML 和 JSON，走完整的`getStaticProps`
  - 当 SSG 完成时，浏览器接收生成路径的 JSON，它将被用于根据所需的 props 自动生成页面。从用户的角度来看，页面只是从回退页面切换到了完整的页面
  - 同时 next 会把该路径添加到预渲染页面列表中，再次访问该页面与其他静态生成的页面将别无二致
  - 该配置不会影响已有的页面
- `fallback: 'blocking'`，整体与`fallback: true`相似，不同的点在于：
  - 不再统一指向 404 页面，取而代之的是为这次请求执行 SSR 策略并返回生成的 HTML
  - 等待 SSR 完成后，浏览器接收 HTML 并完成页面渲染。从用户的角度来看，页面只是等待稍长时间之后拿到了完整的页面，并没有当前页面切换的感受
  - 其它缓存策略一致

#### 后续

在 `getStaticProps` 中根据 params 的信息做进一步请求处理。

### 图谱

路径分发： ![路径分发](https://www.nextjs.cn/static/images/learn/dynamic-routes/page-path-external-data.png)

基本流程： ![基本流程](https://www.nextjs.cn/static/images/learn/dynamic-routes/how-to-dynamic-routes.png)

## API 路由

在`pages/api`目录下添加的文件都将作为 API 端点映射到`/api/*`，并不作为页面（page）存在，这些文件只会增加服务器文件包的大小而不是客户端，如：

```javascript
// pages/api/user.js
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' });
}
```

此时访问`xxx/api/user`时会看到`{"name": "John Doe"}`。

- `req`：一个 http.IncomingMessage 实例，以及一些 预先构建的中间件
- `res`：一个 http.ServerResponse 实例，以及一些 辅助函数
- API 路由 未指定 CORS 标头意味着它们在默认情况下 仅是同源（same-origin）策略。你可以通过使用 cors 中间件 包装出一个请求处理器来自定义此行为。
- API 路由不能与 next export 一起使用
- 不要在`getStaticProps`或者`getStaticPaths`里获取 API 路由，应该直接在服务端代码里做。因为`getStaticProps`和`getStaticPaths`只在服务端运行，甚至不会出现在浏览器的运行时 js 文件中
- 一个比较好的运用场景是表单提交，可以发送一个 POST 请求到我们的 API 路由进行相关的服务端逻辑处理

## 图片

使用 `next/image` 的 `Image` 组件，该组件是对 `<img>` 元素的拓展，支持一系列自动优化功能，默认开启页面视口延迟加载，且无需在构建时进行额外优化。

可在`next.config.js`中进行其它诸如域名、缓存等配置。

## 身份验证

**首先明确需要根据我们的实际数据获取策略制定合适的身份验证方案**。跟预渲染方案一致，next 提供了针对 SSG 和 SSR 的两种验证模式。

并且 next 提供很多实用身份验证 providers：

- with-iron-session
- next-auth-example
- with-magic
- ...

### 静态生成页面验证

next 会根据是否存在 `getServerSideProps` 和 `getInitialProps` 来自动判断开启静态生成策略。在这种模式下，你可以从服务端返回加载状态，在客户端进行数据请求。一般这种模式会开启骨架屏加载，一旦数据返回，用户看到页面从骨架屏切换到正常页面：

```typescript
// pages/profile.js

import useUser from '../lib/useUser';
import Layout from '../components/Layout';

const Profile = () => {
  // 客户端获取用户信息
  const { user } = useUser({ redirectTo: '/login' });

  // 服务端加载状态
  if (!user || user.isLoggedIn === false) {
    return <Layout>Loading...</Layout>;
  }

  // 请求完成展示用户信息
  return (
    <Layout>
      <h1>Your Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  );
};

export default Profile;
```

### 服务端渲染页面验证

当导出一个 `async getServerSideProps` 方法时则进入这种模式，需要保证身份验证足够快，否则白屏时间会很长。该情况不存在骨架屏加载。

```typescript
// pages/profile.js

import withSession from '../lib/session';
import Layout from '../components/Layout';

export const getServerSideProps = withSession(async function ({ req, res }) {
  // 获取用户session
  const user = req.session.get('user');
  // 调整登录
  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { user },
  };
});

const Profile = ({ user }) => {
  // 无加载状态，直接展示
  return (
    <Layout>
      <h1>Your Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  );
};

export default Profile;
```

## 预览模式

特殊场景下，比如当需要绘制页面草稿并且实时预览时，我们希望 next 能绕过 SSG 策略而用请求时（request time）替代构建时（build time）去获取草稿而非发布内容。这个时候预览模式就派上用场了。

首先我们需要在 API 路由中做这件事：

```typescript title="pages/api/preview"
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ...
  res.setPreviewData({});
  res.end('preview mode enabled');
  // ...
}
```

关键的是 `res.setPreviewData`，它设置的值后续将被 `getStaticProps` 接收。并且会为预览模式设置一些必要的 cookies，所有携带这些 cookies 的请求都会被是为预览模式，这也意味着页面的生成策略将会发生改变。在开发模式下，可以在控制台看到设置了 `__prerender_bypass` 和 `__next_preview_data` 两个 cookie。

### 基本步骤

1. 创建一个只有 next app 和内容托管服务器知道的 secret token 字符串，确保权限
2. 假如此时的 API route 为 `pages/api/preview.js`，构造如下 url，其中 path 是预览路径，如想预览 `/posts/foo`，则 `slug=/post/foo`
   ```
   https://<site>/api/preview?secret=<token>&slug=<path>
   ```
3. API route 逻辑补齐：

   1. 检查 secret token 和 slug query 参数
   2. 调用 `res.setPreviewData`
   3. 跳转 slug 的路径

   ```typescript
   // pages/api/preview.js
   export default async function handler(
     req: NextApiRequest,
     res: NextApiResponse
   ) {
     // 确保秘钥安全性
     if (req.query.secret !== 'DEMO_SECRET' || !req.query.slug) {
       return res.status(401).json({ message: 'invalid token' });
     }
     Î;
     //获取内容
     const post = await getPostBySlug(req.query.slug);

     if (!post) {
       return res.status(401).json({ message: 'Invalid slug' });
     }
     /**
      * 开启预览模式
      * maxAge：preview cookie 的过期时间，以秒为单位
      * setPreviewData(data: object | string, options?: {
      *   maxAge?: number;
      * })
      */
     res.setPreviewData({});

     // 清除预览模式的cookies
     // res.clearPreviewData()

     // 页面跳转
     res.redirect(post.slug);
   }
   ```

4. 更新 `getStaticProps` 逻辑以支持预览模式（此时会转为 SSR），同时 `context.preview === true`， `context.previewData` 会是 `setPreviewData` 传入的值

## 动态 import

next 天然支持 ES2020 动态 import 的特性，并且支持 SSR。另外提供 `next/dynamic` 这种引入形式以支持 react 组件的动态 import：

```typescript
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/hello'));

function Home() {
  return (
    <div>
      <Header />
      <DynamicComponent />
      <p>HOME PAGE is here!</p>
    </div>
  );
}

export default Home;
```

这里的 `DynamicComponent` 是一个由 `../components/hello` 返回的默认函数，跟正常 react 组件一样使用。

`next/dynamic` 几个注意点：

1. 文件路径可以携带变量
2. `import()` 必须在 `dynamic（）` 内部调用以确保 webpack 的打包可以进行预渲染处理
3. `dynamic()` 不能在 react 渲染逻辑里面，因为它需要在模块顶层进行标记以便进行预加载工作，类似 `React.lazy`

如果不想使用默认导出的模块，可通过 promise 回调进行处理，如下：

```typescript
// ../component/hello.js
export function Named() {
  return <div>named</div>;
}
// home
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() =>
  import('../components/hello').then((mod) => mod.Named)
);

function Home() {
  return (
    <div>
      <Header />
      <DynamicComponent />
    </div>
  );
}

export default Home;
```

也可通过第二个配置参数使用自定义的加载组件或禁用 SSR：

```typescript
import dynamic from 'next/dynamic';

const DynamicComponentWithCustomLoading = dynamic(
  () => import('../components/hello'),
  {
    loading: () => <p>...</p>,
    ssr: false,
  }
);

function Home() {
  return (
    <div>
      <Header />
      <DynamicComponentWithCustomLoading />
      <p>HOME PAGE is here!</p>
    </div>
  );
}

export default Home;
```
