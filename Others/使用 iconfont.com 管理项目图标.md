# 使用 iconfont.com 管理项目图标
#文章/前端

## iconfont.com
网址：[iconfont-阿里巴巴矢量图标库](https://www.iconfont.cn/)

> 阿里妈妈 MUX 倾力打造的矢量图标管理、交流平台。设计师将图标上传到 `iconfont` 平台，用户可以自定义下载多种格式的 `icon`，平台也可将图标转换为字体，便于前端工程师自由调整与调用。  

以上是从官方摘录的关于 `iconfont.com` 的介绍，那么前端工程师怎么使用这样一个平台呢？

## 基本使用
> 新版支持彩色图标，使用彩色字体图标需要在「编辑项目」中开启「彩色」选项后并重新生成。这里有个限制，如果是多彩图项目，目前最多只能存放40个图标。  
### Unicode 引用
Unicode 是字体在网页端最原始的应用方式，特点是：
* 支持按字体的方式去动态调整图标大小，颜色等等。
* 默认情况下不支持多色，直接添加多色图标会自动去色。

1. 在 HTML 页面为字体增加 preload，提升字体加载速度：
```html
<link rel="preload" href="//at.alicdn.com/t/font_2551636_xl6cf0tszy.woff2" as="font" type="font/woff2" crossorigin="anonymous">
```

2. 拷贝以下 css 代码到项目全局 css 的起始位置
```css
@font-face {
  font-family: 'iconfont';
  src: 
       url('//at.alicdn.com/t/font_2551636_xl6cf0tszy.woff2?t=1625561279918') format('woff2'),
       url('//at.alicdn.com/t/font_2551636_xl6cf0tszy.woff?t=1625561279918') format('woff'),
       url('//at.alicdn.com/t/font_2551636_xl6cf0tszy.ttf?t=1625561279918') format('truetype');
}
.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

```

3. 挑选相应图标并获取字体编码，应用于页面
```html
<span class="iconfont">&#x33;</span>
```

### font-class 引用
Font-class 是 Unicode 使用方式的一种变种，主要是解决 Unicode 书写不直观，语意不明确的问题。
与 Unicode 使用方式相比，具有如下特点：
* 相比于 Unicode 语意明确，书写更直观。可以很容易分辨这个 icon 是什么。
* 因为使用 class 来定义图标，所以当要替换图标时，只需要修改 class 里面的 Unicode 引用。

1. 在 HTML 页面为字体增加 preload，提升字体加载速度：
```html
<link rel="preload" href="//at.alicdn.com/t/font_2551636_xl6cf0tszy.woff2" as="font" type="font/woff2" crossorigin="anonymous">
```

2. 引入项目下面生成的 fontclass 代码
```html
<link rel="stylesheet" href="//at.alicdn.com/t/font_2551636_xl6cf0tszy.css">
```

3. 挑选相应图标并获取类名，应用于页面
```html
<span class="iconfont icon-xxx"></span>
```

### Symbol 引用
这是一种全新的使用方式，应该说这才是未来的主流，也是平台目前推荐的用法。这种用法其实是做了一个 SVG 的集合，与另外两种相比具有如下特点：
* 支持多色图标了，不再受单色限制。
* 通过一些技巧，支持像字体那样，通过 font-size, color 来调整样式。
* 兼容性较差，支持 IE9+，及现代浏览器。
* 浏览器渲染 SVG 的性能一般，还不如 png。

1. 在 HTML 页面为字体增加 preload，提升字体加载速度：
```html
<script src="//at.alicdn.com/t/font_2551636_xl6cf0tszy.js"></script>
```

2. 拷贝以下 css 代码到项目全局 css 的起始位置
```css
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
```

3. 挑选相应图标并获取类名，应用于页面
```html
<svg class=“icon” aria-hidden=“true”>
  <use xlink:href=“#icon-xxx”>”/use>
</svg>
```


## 如何在 Antd+React 中使用？
> 由于 Symbol 引用实际上是用的是 svg，支持多彩图标，所以这里主要介绍这种引用方式  

简单的来讲具有两种引用方式

1. 使用 `Antd` 提供引用功能，可以使用 iconfont.com 自己的 CDN 服务器
```tsx
import React from 'react'
import { createFromIconfontCN } from '@ant-design/icons'
import type { IconFontProps } from '@ant-design/icons/lib/components/IconFont'

export interface IconProps extends IconFontProps {
  type:string
}
// scriptUrl 在 iconfont.com 项目中获取，可通过下方所述命令行接收 scriptUrl 写到该位置
const IconWithURL = createFromIconfontCN({ scriptUrl: '//at.alicdn.com/t/font_1456887_2u0nqqk3n6x.js' })

export const Icon: React.FC<IconProps> = React.memo(props => <IconWithURL {...props} />)
```

2. 如果比较介意使用别人的 CDN 服务器，也可以将 svg 资源下载到本地，打包进项目源代码，部署到自己的 CDN 服务器上
index.module.less
```less
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
```
Icon.tsx
```tsx
import React from 'react'
import './iconfont.js'   // 在 iconfont.com 项目中下载下来的图标 svg 资源文件
import styles from './index.module.less'  // 上方的样式文件

export interface IconProps {
  type: string
	// ... 其他自定义属性
}

export const Icon: React.FC<IconProps> = React.memo(props => (
  <svg className={styles.icon} aria-hidden="true">
    <use href={`#${props.type}`} />
  </svg>
))
```

其实能够发现，该方法就是最原始的引用方式，只是进行了组件化封装。

## 能否做到 TypeScript 类型提示，校验？
> 答案当然是可以的  

将图标封装为组件后，使用方式为：
```tsx
<Icon type="xxx"/>
```

我们是不是只要获取到 `type` 属性的联合类型就可以了？其实很简单，让我们看看字体图标资源的内容：
```js
!function(t){var e,n,c,l,o,h,i='<svg><symbol id="icon-yinhangka1" viewBox="0 0 1724 1024"><path d="M301.756473 0.000539H916.210044l-203.721998 1023.999461H162.276967A161.684125 161.684125 0 0 1 3.77263 830.78747l139.42561-700.63121A161.684125 161.684125 0 0 1 301.756473 0.000539z" fill="#D43634" ></path><path d="M717.500254 0.000539h614.453571l-203.721998 1023.999461H578.020748a161.684125 161.684125 0 0 1-158.558232-193.21253l139.425611-700.63121A161.684125 161.684125 0 0 1 717.500254 0.000539z" fill="#034582" ></path>
// ...更多内容
```
我们可以看到，源代码中时存在 `symbol#id` 元素，我们只需要将所有的 `symbol` 元素的 `id` 提取出来组合为联合类型，通过 `nodejs` 脚本一同生成组件代码（unicode 和 font-class 同理可以生成联合类型）。

让我们来看看脚本大致的模样：
```ts
async function run() {
  const data = await getResource(url) // url 从命令行获取，下载图标资源文件内容
  writeResource(data)   // 写入组件 Icon 同级目录，生成 iconfont.js 文件，由组件引入 iconfont.js
	/**
	* getIconNames: 正则提取 id 集合
	* createComponentCode: 生成 Icon 组件代码(需要模板代码，先读取再写入 type 字符串)
	* formatCode: 通过 prettier 格式化代码字符串
	* updateIconCode: 将生成的组件代码写入到项目中
	*/
  updateIconCode(formatCode(createComponentCode(getIconNames(data))))
  console.log('更新组件 Icon 完成'.green)
}

run()
```

将该脚本加入到 `package.json` `script`中，那么设计师增删改图标后，我们只需要在项目中执行以下命令即可自动更新图标资源，极大的提高了使用效率：
```
yarn icon [url]
```

执行上述命令生成的接口代码大致为如下所示：
```ts
//...
// NOTE: 该文件由脚本生成，禁止修改
export type IconType = "icon-jujueyaoqing" | "icon-jieshouyaoqing" | "icon-yiwancheng" | "icon-yiwanchengbeifen";

export interface IconProps {
    type: IconType;
}
// ...
```

最终效果：
![](%E4%BD%BF%E7%94%A8%20iconfont.com%20%E7%AE%A1%E7%90%86%E9%A1%B9%E7%9B%AE%E5%9B%BE%E6%A0%87/E415CEA5-3FFA-4D10-A3DD-BF8DC9554996%202.png)


## 如何定位图标的错误使用？
那么如何定位到项目中使用到的图标是否被修改名字或者删除呢？可以有两种方法解决：
1. 项目 typescript 静态检查做的非常好的情况下，是可以依赖类型检查机制做到，执行：`tsc —noEmit`，即可找到使用错误的位置
2. 如果项目比较老，类型系统不够严格，`tsc` 编译存在大量的错误，是很难在海量的错误中过滤出 `Icon` `type` 造成的异常信息，此时可以编写脚本，匹配出项目中 `Icon` 所有的 `type` 使用值，再和 `iconfont.com` 中提取的 `id` 集合做比较，找到不同处，定位项目中错误的使用位置。

## 思考
1. 如何使 `iconfont.com` 集成到小程序中，并支持多彩图标？
相关文档：[iconfont-阿里巴巴矢量图标库](https://www.iconfont.cn/help/article_detail?spm=a313x.7781069.1998910419.30&article_id=7)