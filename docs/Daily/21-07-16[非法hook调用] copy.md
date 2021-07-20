---
slug: 21-07-16
---

# 21-07-16[非法 hook 调用]

## 背景

开发过程中引用了一个公司内部的业务组件，正常调用如下（伪代码）：

```typescript title="项目使用"
import ServiceCategory from 'xxx';
// ...
const render = () => {
  const [visible, toggleVisible] = useState(false);
  const [data, setData] = useState({
    // ...
  });
  // ...
  return (
    <ServiceCategory
      visible={visible}
      data={data}
      // other props...
    />
  );
};
```

结果浏览器报错了：

![wecom-temp-2fa52d617e91b15bd9d73c1a5904bb04.png](https://i.loli.net/2021/07/19/xT6LcsvhgObHekf.png)

## Debug 过程

![image.png](https://i.loli.net/2021/07/19/vDdpzVRUGuKQHf8.png)

根据上图圈起来的部分我祭出了逐个排除法。

首先排除了 React 和 React DOM 的版本匹配问题，因为项目两者的版本是一致的。

### 陷阱一

然后我开始排查错误使用 React Hook 规则的问题，结果在外部代码中也并不存在条件语句/循环体里使用 hooks 等情况。

看来问题有可能出现在业务组件内部？那就按 F11 步进到 ServiceCategory 里面审查吧。找到源码文件，首当其冲就发现这么一行扎眼的代码（伪代码）：

```typescript {3} title="业务组件内部实现"
const ServiceCategory = (props) => {
  // 注意这里的return
  if (!props.visible) return null;
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // ...
  }, []);
  // ...
};
```

代码本意是想进行性能优化，也就是当 visible 为 false 时就不走下面的一大堆逻辑。此时我基本认定它是错误的写法，因为它违背了在函数的顶层进行调用的写法，因为在这里`return null`才是顶层。

于是我注释掉了这行代码，经过一番折腾之后自信满满的重新发了个组件包，并搓小手等待着一次成功的组件调用，然后控制台相同的鲜红报错狠狠打了脸...

此刻我陷入了一个误区，也是这次 debug 过程中的第一个错误：**我对其它项目能正常调用这个业务组件的现状选择性忽略，或者说莫名其妙的没有去深思这背后的原理，而是选择跟上面这个“错误的写法”死磕，一次次的更新试错我认为业务组件内部错误的写法**，发包、安装、调试占用了大量时间，结果却是徒劳。

#### 事后思考

事后静下心来仔细思考会发现：**这种做法看起来错了，但是没完全错**。

错的地方在于：如果这么写，eslint `react-hooks/rules-of-hooks`的规则会在开发环境报错并予以警醒，但其实我们可以禁用或者绕过这条校验规则，比如在文件顶部使用`/* eslint-disable react-hooks/rules-of-hooks */`这条特殊注释，实际上在生产环境是可以运行的。但这会大大带来不可预知的风险，因此**强烈不推荐**。

![image.png](https://i.loli.net/2021/07/19/NaT1zqWeFES8ufV.png)

~~没错~~的地方在于：由于这里的`return null`逻辑判断语句只有一行，并且上面再也没有其他的分支或者循环语句，换言之 visible 这个布尔变量无论如何变化确实不会影响底下 hooks 代码块的逻辑，也就不会影响 react 在背后为你构造逻辑链表的顺序，因此在实际生产环境里不会有混乱或者其它影响，这也是为什么在其它项目里它活的好好的。

这种 hack 做法虽然被 react 官方所不齿，但吊诡的是它确实是理论上性能上更佳的写法！但仅限于这种情况，如果你把这段 return 逻辑放在几段 hooks 逻辑中间或者下面的任何位置，出现难以定位问题的概率基本是 100%。

### 陷阱二

然后我把目光放到了业务组件包的 react 和 antd 依赖上，即使发现 `package.json` 中正确设置了 `peerDependencies` ，但事到如今我依然认为错出在业务组件内部，在项目里反复清空和重新安装 `node_modules` 之后报错依然如同幽灵般伴随，这个过程也消耗了不少时间，这是 debug 过程中的第二个错误：没有善用对照组，不见南墙不回头。

### See You Tomorrow

此时身为清晰的旁观者的“你”肯定注意到了：**开始的报错提示里不是还有第三种错误方式吗**？是的，这却是迷局中的我第二天早上才意识到的...

## 解决方案

[官方教程：警告：非法 Hook 调用](https://zh-hans.reactjs.org/warnings/invalid-hook-call-warning.html)

针对第三种报错方式，也就是项目中使用了不同的 react 版本，使用如下命令：

```bash
npm ls react
```

结果很明显，问题就出在本项目的 react 的版本上。找出了问题之后，寻找解决方案的过程依然有一些小波折:

在我试过强制设置项目 react 版本重新安装所有依赖后，报错还是离谱的复现！此时`npm ls react`的结果也一毛一样！这几乎让我“道心”产生了动摇，到底是业务组件的锅还是项目的锅？

### 惊鸿一瞥

偶然的一瞥，我发现项目中同时存在`package-lock.json`和`yarn.lock`两个文件，我在两个文件中分别搜索了一下 16.13.1 和 16.14.0 两个关键词，`yarn.lock`中只能搜到 16.13.1，而`package-lock.json`却出现了两个版本的记录，幕后黑手居然藏在这！

### 初步总结

原来，旧项目采用 npm 维护，因此生成了一份`package-lock.json`文件，而我 clone 完代码之后本地就一直使用 yarn 作为管理工具，而 yarn 貌似在 1.7.0 之后的版本对`package-lock.json`和`yarn.lock`文件进行了错误的合并策略或者什么其它奇怪的东西影响了最终的依赖版本，而之前所有的重装一直修改的只是`yarn.lock`文件，（这块尚且存疑，后面有时间可以更仔细研究一下具体的执行策略更新此文）

[参考链接：Yarn import now uses package-lock.json ](https://classic.yarnpkg.com/blog/2018/06/04/yarn-import-package-lock/)，yarn 也提供了一个 Selective dependency 的解决方案：

```json title="package.json"
{
  "name": "project",
  "version": "1.0.0",
  "dependencies": {
    "left-pad": "1.0.0",
    "c": "file:../c-1",
    "d2": "file:../d2-1"
  },
  // highlight-start
  "resolutions": {
    "d2/left-pad": "1.1.1",
    "c/**/left-pad": "^1.1.2"
  }
  // highlight-end
}
```

### 重装大法好

最终，删掉`package-lock.json`和`yarn.lock`，重新安装依赖，执行`npm ls react`后依赖的版本终于一致了。

启动项目后，控制台安静了。

**小小的报错，背后的骚东西却挺多**。

## 总结

1. 项目中不要存在两个版本锁定文件，统一使用 npm 或者 yarn，不能交叉使用！
2. 遇到问题不要慌，先把报错认真阅读完整，在心中初步规划一条 Debug 路径！
3. 定位问题时要思路清晰，假如一个方向有陷入死胡同的倾向，应该果断先换一条路，不能深度遍历一条路走到黑，非常消耗时间！
4. 做技术要求甚解