---
title:
date: 2021-11-12
author: LouisGo
author_title: 一介前端
author_image_url: https://i.loli.net/2021/07/10/sfmijBHXGraYDTA.jpg
keywords: [hooks, 最佳实践, react, 原文翻译, redux]
tags: [前端, 翻译, react]
---

# 可能是最完整的 React 渲染行为指南（原文标题）

原文较长，是一篇答疑性质的系列总结文，因此省去一些对话和周边性质的内容，直接提炼干货进行人肉翻译，英语水平确实有限，欢迎勘误~

获取原汁原味的体验，以下是原文链接：

> [Blogged Answers: A (Mostly) Complete Guide to React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/#rendering-process-overview)

## What is "Rendering"? 什么是渲染？

渲染是指 React 结合当前的 props 和 state 询问你的 UI 组件去描述最终期望呈现效果的过程

### Rendering Process Overview 渲染过程概述

React 从根组件向下遍历找到所有标记为需要更新的组件，对于：

- class 组件：执行 `classComponentInstance.render()`
- function 组件：执行 `FunctionComponent()`

保存执行后的输出结果。

通常一个组件的输出结果是基于 jsx 语法的，再通过编译器把 jsx 转化为 React.createElement()调用，最终返回 React elements（即虚拟 dom）， 对 UI 结构进行统一描述

```jsx
// This JSX syntax:
return <SomeComponent a={42} b="testing">Text here</SomeComponent>

// is converted to this call:
return React.createElement(SomeComponent, {a: 42, b: "testing"}, "Text Here")

// and that becomes this element object:
{type: SomeComponent, props: {a: 42, b: "testing"}, children: ["Text Here"]}
```

当从组件树收集完所有 render 输出的结果最终会形成一颗新的虚拟 dom 树，React 会拿这颗新的树和旧的进行差异比较，然后收集并且列出真实 dom 中所有需要进行变更的部分。这个比对和计算的过程称为：**reconciliation 协调阶段**

React 将在一次同步序列中对所有计算之后的更改内容应用到真实 dom 上

### Render and Commit Phases 渲染和提交阶段

概念上来说：

- 渲染阶段：包括渲染组件和计算更改
- 提交阶段：将更改映射到真实 dom 上

React 在提交阶段更新完 dom 后：

1. 相应的更新所有指向这次变更的 dom 节点和组件实例的 refs
2. 同步的运行 `componentDidMount` 和 `componentDidUpdate` 生命周期函数和 `useLayoutEffect` 勾子函数
3. 设置一个短暂的 timeout，结束之后运行 useEffect 勾子函数，这一步也称之为“被动副作用阶段”

> 在即将来临的 Concurrent 模式下，可以在渲染阶段暂停，此时浏览器可以处理其他事件。React 将在适当的时机执行恢复、抛弃或者重新计算的工作。一旦渲染传递完成，React 仍然会在一次同步中运行提交阶段

**理解“渲染”的关键在于“渲染”不等同于“更新 dom”**，并且组件最终有可能看起来没有任何可见的变化。

当 React 渲染组件时：

- 组件可能返回和上一次相同的渲染结果，因此不需要变更
- 在 Concurrent 模式下，组件可能会渲染多次，但是期间会抛弃那些无效的更新引起的渲染结果

## How Does React Handle Renders? React 如何处理这些渲染？

### Quening Renders 队列渲染

初始渲染结束后，有以下途径可以触发 React 的重渲染

- class 组件：
  - `this.setState()`
  - `this.forceUpdate()`
- 函数组件
  - useState 的 setter 函数
  - useReducer 的 dispatcher
- 其它
  - 重新调用 `ReactDOM.render(<APP/>)`，等同于根组件调用 `forceUpdate()`

### Standard Render Behavior 标准渲染行为

标准默认更新行为：**当父组件发生渲染，React 会递归渲染其内部的所有子组件**

如以下的组件树构造：

A → B → C → D

当 B 中一个 state 发生变化，则：

1. 从顶层树开始往下渲染
2. 发现 A 没变化，跳过
3. 发现 B 需要更新，于是更新，B 最终返回的 C，进入 C
4. C 没有变化不需要更新，但是因为父组件 B 重渲染了，C 也不得不重渲染，然后来到 D
5. 重复上面一步，重渲染 D

当渲染一个组件时，默认所有存在该组件内部的组件都会被重新渲染。

所以说，普通渲染中，**React 可以说并不关心 props 的改变，无条件的更新子组件只是因为父组件更新了而已**

比对的过程当然需要耗费时间和性能

但记住：**渲染并不是一件坏事，正因如此 React 才能知道是否需要变更 dom**

### Rules of React Rendering React 渲染时的准则

一条让人听起来既棘手又容易困惑的 React 重要渲染准则是：渲染必须够“纯”且不能有任何的“副作用”

举例解释一下上面的规则：

- 渲染逻辑错误行为：
  - 直接改变已经存在的变量和对象
  - 通过`Math.random()`或者`Date.now()`创建随机值
  - 直接发起网络请求
  - 队列式的状态更新
- 渲染逻辑正确行为：
  - 基于旧对象重新创建的新对象（无引用关系）
  - 抛出错误
  - 对还没有创建的数据进行延迟初始化，比如一个缓存的值

### Component Metadata and Fibers 组件元数据和 Fibers

React 在其内部维护了一种数据结构，追踪一个应用中存在的所有组件实例并保存。该数据结构中一个核心的组成部分是一个称之为 fiber（纤维）的对象，其包含一些 metadata（元数据） 字段用于描述：

- 当前组件用于在组件树中渲染的组件类型
- 与当前组件关联的 props 和 state
- 父组件、兄弟组件和子组件的指针
- 其他用于追踪渲染进程的内部元数据

[React 17 的完整 Fiber 定义](https://github.com/facebook/react/blob/v17.0.0/packages/react-reconciler/src/ReactFiber.new.js#L47-L174)

在整个渲染过程中，React 将会遍历这颗 fiber 树，并且在产生新的渲染结果时构造一颗新的树

fiber 对象中存放的是真实的组件 props 和 state，当你在组件中使用 props 和 state 时，事实上是 React 授权给你访问 fiber 对象值的访问权限。

尤其对于 class 组件来说，在渲染前，React 直接了进行`componentInstance.props = newProps`的拷贝操作。因此，`this.props`是存在了，但它只是 React 内部数据结构的一个拷贝副本。

从这个意义上来说，**组件其实是 React fiber 对象的一种外化形式**

相同的，React hooks 的基本工作原理是 React 以链表的形式存储了一个组件用到的所有 hooks，同时该链表结构也隶属于这个组件的 fiber 对象。当 React 渲染一个函数组件时，它会从 fiber 对象中拿到对应的有着 hooks 描述信息的链表，每次当你调用另外的 hook 函数时，它会返回存储在 hook 描述对象中的相应的值（如 useReducer 中的 state 和 dispatch 值）

当父组件首次渲染给定的子组件时，React 会创建一个 fiber 对象用来追踪组件的“实例”：

- 对于 class 组件，调用`const instance = new YourComponentType(props)`，之后将实际上的组件实例保存到 fiber 对象中
- 对于函数组件，就只是单纯的调用`YourComponentType(props)`函数

### Component Types and Reconciliation  组件类型和协调阶段

[React 为了高效的重渲染，会尽可能的复用已经存在的组件树和 dom 结构](https://reactjs.org/docs/reconciliation.html#elements-of-different-types)。对于相同组件树位置中相同类型的组件或者 HTML 节点的重渲染来说，React 会遵循这条原则而不是从头开始创建新的相同结构，意味着只要你继续让 React 渲染相同位置相同类型的组件，React 将始终保持该组件实例的存活。

- 对于 class 组件来说，它实际上已经使用了相同的组件实例
- 对于函数组件来说没有真正的“实例”，但是我们可以用`<MyFunctionComponent />`这种结构代表一种“这种类型的组件将在这里展示并且始终保持存活”的标记概念

那么，React 怎么知道输出是何时并且如何发生实际改变的呢？

React 的元素比对逻辑渲染逻辑基于类型字段优先的方式，使用 `===` 的方式进行比较。如果给定的元素已经变成了不同的类型，比如从 div 变成了 span，或者 componentA 变为 componentB，那么 React 便会假设整颗组件树都发生变化从而加速比对的过程。此时 React 将会销毁整颗已经存在的组件树，包括所有的 dom 节点，然后从头开始创建一个新的组件实例。

这意味着渲染过程中一定要避免重新创建一个新的组件类型。每当你创建一个新的组件类型时，它都是一个不同的引用，将导致 React 重复的销毁和创建新的子组件树。

换言之，避免：

```jsx
function ParentComponent() {
  // This creates a new `ChildComponent` reference every time!
  function ChildComponent() {}

  return <ChildComponent />;
}
```

如果要做，总是分开定义该组件：

```jsx
// This only creates one component type reference
function ChildComponent() {}

function ParentComponent() {
  return <ChildComponent />;
}
```

### Keys and Reconciliation Keys 和协调

### Render Batching and Timing 批量更新及其时机

### Render Behavior Edge Cases 渲染行为的边界案例

## Improving Rendering Performance 提升渲染性能

### Component Render Optimization Techniques 组件渲染优化技巧

### How New Props References Affect Render Optimizations 新 Props 的引用如何影响渲染优化

### Optimizing Props References 优化 Props 的引用

### Memoize Everything? 万物皆可缓存？

### Immutability and Rerendering 不可变性和渲染

### Measuring React Component Rendering Performance 衡量 React 组件渲染性能

## Context and Rendering Behavior 上下文和渲染行为

### Context Basics 上下文基础

### Updating Context Values 更新上下文的值

### State Updates, Context, and Re-Renders 状态的更新、上下文以及重渲染

### Context Updates and Render Optimizations 上下文的更新和渲染优化

## React-Redux and Rendering Behavior React-Redux 和渲染行为

### React-Redux Subscriptions React-Redux 的订阅行为

### Differences between connect and useSelector connect 和 useSelector 之间的差别
