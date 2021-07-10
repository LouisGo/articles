---
slug: 21-05-25
---

# 21-05-25[SSR思考][redux思考][react概念记录][控制台技巧]

## SSR 思考

- 首先 SSR 带来的最重要优势：首屏性能和 SEO
- 云采购作为一个类电商的平台化网站，SEO 自然非常重要，但是我们的大部分后台管理系统 / 强交互型界面 / 工具型界面可以考虑只首页 SSR，剩下的交给 CSR，甚至完全做成 SPA，这么做有以下好处：
  - 界面交互使用体验大幅上升
  - 客户端可以做更多针对性的性能优化（拆包 / 懒加载 / 骨架屏 / 请求合并...）
  - 解放服务器性能，节约成本
  - 节省维护成本
  - 关注分离
- next 可以很好的解决上面的一些问题，但仍然有一些局限：

  - 代码的组织结构固定，对于 page 和 component 的选择有一定心理负担，很容易写重复代码
  - 多页面传参不够灵活

  初步理解 next 不是所有问题的银弹，更贴合真正适合 SSR 的场景

## redux

- 大部分项目的业务场景复杂度是否完全用不到 redux？完全可以手写一个轻量级的基于事件订阅机制的中心化管理类（类似于 vue 中的 eventBus）或者使用 context + useReducer
- redux 社区的解决方案太混乱，表单场景下就有：redux-form-utils/redux-form/rc-component... 再有 redux-thunk/redux-sage/redux-observable 等千奇百怪的中间件，每个都带来不同的概念，在我们的不同项目里也有不同的实践，有点 “乱花渐欲迷人眼”

## react

- `useState` 具有 capture value（数据快照）特性，想要实时获取最新的值（比如定时器里取值），可以使用 `useRef`
- 关于 Functional 组件

  替代 `shouldComponentUpdate`：

  ```jsx
  const Button = React.memo((props) => {
    // your component
  });
  // or
  function Parent({ a, b }) {
    // Only re-rendered if `a` changes:
    const child1 = useMemo(() => <Child1 a={a} />, [a]);
    // Only re-rendered if `b` changes:
    const child2 = useMemo(() => <Child2 b={b} />, [b]);
    return (
      <>
        {child1}
        {child2}
      </>
    );
  }
  ```

  替代 `forceUpdate`：

  ```jsx
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  function handleClick() {
    forceUpdate();
  }
  // or
  const useUpdate = () => useState(0)[1];
  ```

  替代 `componentDidUpdate`：

  ```jsx
  const mounting = useRef(true);
  useEffect(() => {
    if (mounting.current) {
      mounting.current = false;
    } else {
      fn();
    }
  });
  ```

## 控制台相关

- `debug(function)` 可以把传入 function 的执行时自动添加断点调试
- 可以在控制台直接输入 `$()` 相当于 `document.querySelector()`,`$$(selector)` 相当于 `document.querySelectorAll()`
- `$_` 返回最近一次执行表达式的返回值
- `$0`-`$4` 返回最近 5 个被审查的 dom 元素，`$0` 是最新一次，以此类推
- `getEventListeners(object)` 用来返回当前对象注册的监听器
- 可以单击小眼睛按钮创建实时活动表达式
