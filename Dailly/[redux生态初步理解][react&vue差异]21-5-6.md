项目里一下接收的概念有点多（主要围绕 redux 生态），好记性不如烂笔头...

# redux、react-redux、@reduxjs/toolkit、reselect 傻傻分不清楚

## redux

官方中文文档 [https://cn.redux.js.org/](https://cn.redux.js.org/)

本质是一种状态容器，提供可预测化（immutable）的状态管理，不仅限于 react 框架。

三大原则：

1. 单一数据源（中心化管理的 store），提供 getState 用于获取 state，dispatch 用于更新 state，subscribe 用于订阅 state 变化
2. 数据（state）只读，改变数据需要触发 action（dispatch），action 的本质是普通的 js 对象，而所谓的 action 创建函数本质是工厂函数
3. 使用纯函数（reducer）执行修改，且每个 reducer 只负责 state 中涉及到自己的部分

## react-redux

目前好像只有英文文档：[https://react-redux.js.org/introduction/getting-started](https://react-redux.js.org/introduction/getting-started)，redux 那个文档里只有简要的介绍

react-redux 是 redux 官方提供的 react 绑定库，它能够使你的 react 组件从 redux store 中读取数据，并且向 store 分发 actions 以更新数据

核心思想：容器组件（负责处理和 redux 相关的所有逻辑）+ 展示组件（具体 UI 展示逻辑）

![image.png](https://i.loli.net/2021/05/25/YT8rolLNJbPitek.png)

### Provider

内置组件，需要在根节点外进行包裹，并且传入唯一的 store prop

### connect

顾名思义，连接 react 组件和 redux 的桥梁或者说是容器组件

`connect(mapStateToProps?: Function, mapDispatchToProps?: Function | Object, mergeProps?: Function, options?: Object)`高阶函数生成容器组件，其做了很多性能优化避免重复渲染（主要是通过 shouldComponentUpdate 生命周期函数做判断）

## reselect

一个配合 redux 使用的的轻量型状态选择库，属于增强型控件

最终实现的效果和 vue 中的 computed 近似，大致都是提供了一层缓存，但是实现思路不同，vue 是通过拦截 set，reselect 是通过传入变量的判断（===），核心代码

```jsx
if (prev === null || next === null || prev.length !== next.length) {
  return false;
}
```

reselect 在处理引用类型的时候（同一个对象属性修改）需要结合 immutable.js 使用，否则不会触发重新求值

## @reduxjs/toolkit

简称 RTK，官方打造的 redux 工具包，以下为转载待归纳总结吸收...

redux 常见问题：

- 配置复杂，devtool...
- 模板代码太多，创建 constant，action，reducer...
- 需要添加很多依赖包，如 redux-thunk、immer...

主要干了这些事：

- `configureStore()` 包裹 createStore，并集成了`redux-thunk`、`Redux DevTools Extension`，默认开启
- `createReducer()` 创建一个 reducer，action type 映射到 case reducer 函数中，不用写 switch-case，并集成`immer`
- `createAction()` 创建一个 action，传入动作类型字符串，返回动作函数
- `createSlice()` 创建一个 slice，包含 createReducer、createAction 的所有功能
- `createAsyncThunk()` 创建一个 thunk，接受一个动作类型字符串和一个 Promise 的函数
- ...

# 问题记录

1. react-router 采用异步懒加载路由的方式会导致动态加载的模块对应的 reducer 不存在，因此要将当前模块对应的 reducer 和已有的静态和动态 reducers 进行一次合并然后动态注入（store.replaceReducer）。这样可以充分发挥懒加载的威力，减少”白屏“时间，但是多了一些切换路由（没有进行缓存）运行时的消耗。对应在我们系统的工具方法叫 injectReducer，维护了一个 asyncReducers 对象，在路由切换时不断进行对新旧 reducer 进行合并操作
2. CSS Modules 支持后可以通过 xxx.module.xxx 的方式引入样式文件，在 jsx 中直接通过对象的方式写样式名，通过添加命名空间前缀和 hash 值实现样式局部作用域（react-dev-utils/getCSSModuleLocalIdent）。通过:global(.className)的方式实现样式透传，跟 vue scoped styles 的概念很像
3. 异步 reducer 写起来挺麻烦的...
   1. 引入 react-thunk
   2. 引入 { applyMiddleware } from 'redux'
   3. createStore(reducer, applyMiddleware(thunk))
   4. 异步 action 返回一个 function
4. @ycg/widgets 为云采购公共业务聚合组件，文档地址:[http://vdoc.mycaigou.com/widgets](http://vdoc.mycaigou.com/widgets)
5. TRTC：腾讯云实时音视频，trtc-js-sdk 为官方 sdk
6. 项目里有引入 graphql 但是好像没用到

# react 对比 vue 差异收集

1. vue slot 对应到 react 中是 props.children
2. react 中万物皆可 props
3. vue 中的 scoped styles 对应到 react 的解决方案是 CSS Modules
4. 疑问：react 每次 state 变化都会触发完整的 render 方法进而依赖 diff 算法进行 dom 更新，如果这时候的 state 通过 props 传递到了一颗非常大的组件依赖树，深度遍历下是否会带来明显的性能问题？
