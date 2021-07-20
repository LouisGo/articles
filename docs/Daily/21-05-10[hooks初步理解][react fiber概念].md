---
slug: 21-05-10
---

# 21-05-10[hooks初步理解][react fiber概念]

1. React Hooks 之所以不能写在 if-else 和 for 循环体里，是因为 react 需要严格确保每次调用函数时 hooks 的执行顺序时一致的，否则将出现不可控情况（类似于 jsx 用 index 作为可能打乱顺序的循环列表的 key 值），react 会帮你”记住“调用的值
2. useMemo 和 useCallback 的总结（都要避免滥用，适得其反）
   - useMemo 的设计初衷是减少计算量，缓存的是结果，只有当要使用的对象比较复杂的时候才需要用 useMemo 包裹起来，useMemo 的使用场景比较广泛，通过把函数作为结果也可以实现 useCallback
   - useCallback 的设计初衷并非解决组件内部函数多次创建的问题，缓存的是函数，而是减少子组件的不必要重复渲染，只有当子组件是一个昂贵组件的时候，传给子组件的方法才有必要用 useCallBack 包裹一下，结合 memo 函数（也就是 PureComponent 的函数式组件用法，都是对 props 进行了浅层比较）使用
3. React Fiber 的理解汇总：

   - React 维护了一个链表的数据结构（return、child、sibling），最终实现了一个与函数调用栈相似的虚拟栈帧，因此可以随时中断和恢复，在某些节点异常时，还可以很方便的查看调用栈，沿着 return 进行回溯。
   - 分别有协调阶段和提交阶段，为了防止在协调阶段（diff 阶段）被太多副作用干扰，react 废弃了之前的`compontentWillMount`和`componentWillUpdate`这两个生命周期函数；而提交阶段会同步的去处理商议阶段产生的各种副作用，包括 DOM 变更、还有你在 componentDidMount 中发起的异步请求、useEffect 等，这个阶段不能被打断。
   - 采用了类似图形化领域的双缓冲优化机制，提交阶段类似于 Git 的功能分支

   > 参考链接[https://juejin.cn/post/6844903975112671239#heading-9](https://juejin.cn/post/6844903975112671239#heading-9)
