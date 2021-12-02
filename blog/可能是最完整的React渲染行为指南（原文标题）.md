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

React 识别组件实例的另一种方式是使用 `key` 这个伪 prop。`key` 对于 React 来说更像是一种指令，它不会被传入真实的组件中，可以将 `key` 视为一种用来区分特定的组件实例类型的特殊标识符。

key 的典型使用场景是渲染一个列表，用不会重复的 id 作为 key 值在这种场景下是很重要的，它将在列表项目发生排序、新增、删除时发挥重要作用，不到万不得已不要使用数组索引作为 key 值，否则可能会发生不可控的错误渲染、触发不必要的组件更新等等行为。

当然 key 的使用场景远远不限于列表。比如你可以利用 key 来手动控制新旧组件实例的创建和销毁，像切换不同表单时就可以避免 React 复用过期的数据。

### Render Batching and Timing 批量更新及其时机

默认情况下，每次调用 `setState()` React 都将开启一次新的渲染，同步的执行并返回。但是 React 也会以批量渲染的形式自动应用一系列的优化。所谓的批量渲染就是 `setState()` 的多次调用会导致单次渲染传递进入队列执行的方式，这一过程通常会带来轻微的延迟。这也正是为什么 React 官网说：[state 的更新可能是异步的](https://reactjs.org/docs/state-and-lifecycle.html#state-updates-may-be-asynchronous)。

值得注意的是，**在 React 的原生事件处理器中，React 会自动进行批量更新**。在一个典型的 React 应用中，事实 React 原生事件处理器是一个占比很大的组成部分，这意味着**大多数的数据更新实际上执行的都是批量更新机制**

对于事件处理器，React 实现批量更新的方式是把它们包裹在一个叫做 `unstable_batchedUpdates`的内部函数中，当这个内部函数运行时，React 会追踪所有排好队等待更新的数据，然后在之后的一次渲染传递中运用它们的变化。对于事件处理器来说这一机制运行良好，因为 React 清楚的知道对于给定的事件哪个事件处理器将被调用。

概念上来说，React 做的事其实就是下面这段伪代码：

```jsx
// PSEUDOCODE Not real, but kinda-sorta gives the idea
function internalHandleEvent(e) {
  const userProvidedEventHandler = findEventHandler(e);

  let batchedUpdates = [];

  unstable_batchedUpdates(() => {
    // any updates queued inside of here will be pushed into batchedUpdates
    userProvidedEventHandler(e);
  });

  renderWithQueuedStateUpdates(batchedUpdates);
}
```

但是，**这同时意味着队列更新时任何当前调用栈之外的数据更新将不会参与到这次批量更新**。举例说明：

```jsx
const [counter, setCounter] = useState(0);

const onClick = async () => {
  setCounter(0);
  setCounter(1);

  const data = await fetchSomeData();

  setCounter(2);
  setCounter(3);
};
```

思考一下以上代码会发生几次渲染呢？2 次？3 次？4 次？

答案是 3 次。

1. 首先`setCounter(0)`和`setCounter(1)`是发生在原生 react 事件处理器 onClick 中的两次 setter，因此他们都将进入`unstable_batchedUpdates()`，等待批量更新后合并为一次渲染
2. 但是，`setCounter(2)`是在 `await` 之后执行的，这意味此时 onClick 的同步执行栈已经结束了，它将等待异步任务完成，并在另一次独立的事件循环中被调用。正因如此，React 不会把它放入原生事件的那次批量更新中，而是在未来的某个时刻让它再同步的执行一次属于自己的数据更新，这时候发生一次 counter 为 2 的渲染
3. `setCounter(3)`就很好理解了，同 2 一样，发生一次 counter 为 3 的渲染

提交阶段的生命周期函数如 `componentDisMount`、`componentDidUpdate`和`useLayoutEffect`中还存在一些额外的边界情况。这些大量存在的边界情况**允许你在一次 React 渲染行为之后，浏览器绘制之前执行额外的逻辑**，比如：

- 用部分不完整的数据初始化渲染组件
- 在提交阶段的生命周期函数中，利用 refs 去测量页面真实 dom 的尺寸大小
- 根据上面测量的结果设置一些必要的值
- 根据更新后的数据立即执行重渲染

在这个案例中，我们其实并不想要初始状态中部分数据渲染的 UI 给用户看到，我们想要展现的是最终的效果。当 dom 结构被修改时，浏览器将会发生重新计算，但是实际上当 js 进程仍在执行并且阻塞着事件循环的时候，浏览器并不会进行任何绘制到屏幕上的操作。所以你可以在这个时候进行多次 dom 操作，比如`div.innerHTML = "a"; div.innerHTML = b";`，但此时"a"是永远不会出现在屏幕中的

因为这点，React 在提交阶段的生命周期中总是会同步的执行渲染，那样，如果你尝试进行这样一次转换的更新行为："partial -> final（部分更新 -> 最终更新）"，最终显示在屏幕中的只会是"final"

据我所知，`useEffect`回调函数中进行的数据更新也是队列更新，所有的`useEffect`回调执行一旦结束，就会在“副作用阶段”结束进行刷新

值得注意的是，`unstable_batchedupdates` API 虽然是被公开导出的，但：

- 顾名思义，它被标记为不稳定的 API，并且不是官方支持的 React API
- 但是 React 团队说过它已经是所有不稳定 API 中最为稳定的了，Facebook（Meta）内部也有大半的代码简建立在这个 API 之上
- `unstable_batchedupdates` 不像其他核心的 React API 一样被`react`包导出，它是一个特定的协调 API 并且不属于`react`包的部分。实际上它是由`react-dom`和`react-native`包导出的。这意味着其它协调包如`react-three-fiber`或者`ink`里，我们就不倾向于导出`unstable_batchedupdates`了。

React-Redux V7 开始内部也开始使用这个 API。

**在即将到来的 Concurrent 模式中，React 将会把所有更新行为都替换为批量更新，无论何时无论何地**

### Render Behavior Edge Cases 渲染行为的边界案例

开发环境中，React 会对`<StrictMode>`标签里面的的组件进行两次渲染。这意味着此时渲染逻辑运行的次数和提交渲染的次数是不一样的，因此你不能用诸如`console.log()`等形式去判断实际的渲染发生情况。可以用 React DevTools Profiler 去捕获整体的提交渲染次数，或者在`useEffect`hook 和`componentDidMount/Update`生命周期函数中进行 log，这样的话记录的数量就对应的是真实完成一次渲染传递并且提交。

前面说过，通常情况下你不能在实际渲染逻辑中触发队列更新。比如在一次 click 回调中调用一次`setSomeState()`这没问题，但是你不能把`setSomeState()`的调用作为实际渲染行为中的一部分

然而这里也有一个例外，**函数组件可能会在渲染过程中直接调用`setSomeState()`，只要它是条件执行的并且不是每次渲染都执行**。这个函数组件的表现等同于`getDerivedStateFromProps`之于 class 组件。如果一个函数组件在渲染过程中队列更新，React 会立即应用这些更新并且同步的重渲染。如果一个组件持续不断的保持队列式更新并且强迫 React 进行重渲染，React 会在 50 次尝试后跳出循环并且抛出一个错误。这个技巧可以用于基于 props 的改变立即强制更新数据，就不用在`useEffect`内部调用`setSomeState()`进行重渲染了

## Improving Rendering Performance 提升渲染性能

虽然渲染行为是一个正常的可预期的 React 运转组成部分，但是有时候渲染工作会进行无用功也是真实存在的。如果一个组件的渲染输出没有改变，那么对应部分的 dom 也不需要得到更新，那么 dom 更新之前的渲染工作貌似就是“无用功”了

上文提到，React 的组件渲染输出总是依赖于当前的 props 和 state，因此如果我们提前知道 props 和 state 没有发生改变，那么渲染输出也就不会改变，此时我们可以安全的跳过该渲染

以下有两条尝试改善软件系统性能的通用途径：

1. 相同的工作提升速度
2. 做更少的工作

React 的渲染优化更多体现在通过跳过不必要的渲染从而做更少的工作上

### Component Render Optimization Techniques 组件渲染优化技巧

React 主要提供了下面 3 个 API 用来跳过渲染：

- `React.Component.shouldComponentUpdate`： 可选的 class 组件生命周期函数，会在渲染进程中提前调用，如果该函数的返回结果是`false`，React 就会跳过渲染这个组件。
- `React.PureComponent`：当对 props 和 state 的比对在`shouldComponentUpdate`中变成最常见的实现时，`PureComponent`的出现把这个行为直接变成了默认行为，可以理解为`Component` + `shouldComponentUpdate`
- `React.memo()`：内置的一个高阶函数。接收你的组件类型作为一个参数，然后返回一个包装后的组件。这个包装后的组件的默认会自动检查你的 props 是否发生了改变，如果没有则阻止往下重渲染。函数组件和 class 组件都可以用这个高阶函数。

以上提到的这些途径都遵循“浅比较”的原则：两个不同对象中的每个单独字段都被拎出来进行检查，看看他们是否变成了不同的值。换言之，`obj1.a === obj2.a && obj1.b === obj2.b && ........`，这通常是一个很快速的过程，因为全等比较对于 js 引擎来说是很简单的操作。

还有一个较少为人所知的技巧：如果 React 组件在其渲染输出结果中返回与之前完全相同的元素引用，那么 React 将会跳过该特定子树的渲染，只要有几种方式可以实现这项技巧：

- 如果在输出中包含了`props.children`，此时组件内部发生数据变更，该 children 元素引用是不会发生改变的
- 如果将某些元素用`useMemo`进行包装，也叫保持这份引用知道依赖数组发生改变

举个例子：

```jsx
// counter 发生改变也不会引发 props.children 的重渲染
function SomeProvider({ children }) {
  const [counter, setCounter] = useState(0);

  return (
    <div>
      <button onClick={() => setCounter(counter + 1)}>Count: {counter}</button>
      <OtherChildComponent />
      {children}
    </div>
  );
}

function OptimizedParent() {
  const [counter1, setCounter1] = useState(0);
  const [counter2, setCounter2] = useState(0);

  const memoizedElement = useMemo(() => {
    // This element stays the same reference if counter 2 is updated,
    // 如果counter2发生改变，元素仍会保持相同的引用，不会触发重渲染
    // 知道counter1发生改变
    return <ExpensiveChildComponent />;
  }, [counter1]);

  return (
    <div>
      <button onClick={() => setCounter1(counter1 + 1)}>
        Counter 1: {counter1}
      </button>
      <button onClick={() => setCounter1(counter2 + 1)}>
        Counter 2: {counter2}
      </button>
      {memoizedElement}
    </div>
  );
}
```

在这些技巧下，跳过组件渲染意味着 React 也将跳过渲染整颗不变的“子树”。它有效的停止了 React 的递归渲染子元素的行为。

### How New Props References Affect Render Optimizations 新 Props 的引用如何影响渲染优化

前面说过，默认情况下，React 并不关心你传递的 props 是否一样，就只是拿 props 进行重渲染而已。因此底下的行为完全 ok:

```jsx
function ParentComponent() {
  const onClick = () => {
    console.log('Button clicked');
  };

  const data = { a: 1, b: 2 };

  return <NormalChildComponent onClick={onClick} data={data} />;
}
```

每次父组件渲染时都会创建一个全新的`onClick`函数和`data`对象引用，然后通过 props 传给底下的子组件

这也意味着此时尝试优化宿主组件是没有意义的，比如把一个`<div></div>`或一个`<button></button>`包在`React.memo()`里，这些基础组件甚至没有子组件，因此渲染进程无论如何都会停止

但是，如果子组件尝试通过检查 props 变更进行渲染优化，那么传递全新引用的 props 就能触发子组件的渲染。如果新的 prop 的引用确实指向新数据，这很棒。但是，如果父组件仅仅传递一个回调函数呢？

```jsx
const MemoizedChildComponent = React.memo(ChildComponent);

function ParentComponent() {
  const onClick = () => {
    console.log('Button clicked');
  };

  const data = { a: 1, b: 2 };

  return <MemoizedChildComponent onClick={onClick} data={data} />;
}
```

现在，每次父组件渲染时，这些全新的引用将导致`MemoizedChildComponent`每次都看到的都是全新引用的 props，然后接着继续进行重渲染，即使`onClick`函数和`data`对象在我们看来每次都是同一件东西

这意味着：

- `MemoizedChildComponent`并不会如我们所愿跳过重渲染
- 此时的新旧 props 比对是在浪费时间

同样的，如果`MemoizedChildComponent`内部也有它的子组件，那么也逃不过强制重渲染的命运，因为这时的`props.children`始终也是新的引用

### Optimizing Props References 优化 Props 的引用

class 组件不用担心上面这种情况，因为它们有自己的始终保持相同的引用的实例方法。但是，它们可能需要为不同的子列表项生成唯一的回调函数，或者在一个匿名函数中捕获值传递给这些子项，这种情况也会导致全新的引用。React 中并没有内置的东西可以帮助优化这个案例。

函数组件中，React 则提供了`useMemo`和`useCallback`两个勾子函数：

- `useMemo`：用于缓存一个新的对象或者复杂的计算的结果
- `useCallback`：专门用来创建回调函数

### Memoize Everything? 万物皆可缓存？

看前面的案例好像感受到 memo 香气四溢，那么问题来了：React 何不默认用 `React.memo()` 包裹所有组件呢？

Dan 神对此类问题发表过评（fan）论（wen）：

> Q: 为什么 React 不默认用 `memo()` 包裹所有组件？这样不会更快吗？不服跑个分？
>
> A: 为什么你不用 lodash 的 `memorize()` 包裹你所有的函数？这样不会让函数更快吗？不服跑个分？

对此作者的想法是，由于比起不可变的数据更新，人们更愿意用数据突变的方式，因此默认 memo 所有组件是可能会引发问题的。但作者同样跟 Dan 神在 Twitter 上有过公开的讨论，他个人认为广泛使用 memo 整体上对应用带来的还是正向收益，[原文引用](https://twitter.com/acemarke/status/1141755698948165632)太长，总结以下几点：

- 人们对于渲染和其带来的性能影响有群体误解，没错，React 是完全基于渲染的，但渲染一切就是原罪？不，绝大多数渲染其实并不昂贵
- 不必要的渲染不是世界末日，也不是完全从根节点重渲染整个应用。如果这些“不必要的”重渲染没有带来实际 dom 的更新，那么就不用担心 CPU 被烧毁。这对大多数应用来说是问题吗？我觉得不是。那么有一些手段可以改善这种情况吗？也许吧
- 默认重渲染一切的行为是不是有它的不足呢？当然，这就是为什么有`sCU`、`PureComponent`和`memo()`
- **那么还是那个问题，该不该用`memo()`包住一切呢？**可能不用，但如果仅从性能指标需要的层面出发，难道它会对你的应用带来什么伤害吗？不，并且现实的来讲，我认为它能带来净收益（忽略 Dan 神关于比较浪费的观点）
- 希望越来越多来自 React 团队或者大型开源社区的基准测试能揭示真正的答案，这样就可以避免对于这个问题无休止的争论，脐带~

很遗憾，对于此现在暂时还没有出现有说服力的基准测试

对于这个现状，Dan 神的标准答案是不同应用的结构和更新模式之间有着巨大的差异，所有很难给出具有代表性的基准测试。我始终认为一些实际的数字是有助于讨论的（打起来打起来）

### Immutability and Rerendering 不可变性和渲染

在 React 中数据的变更需要始终保持是不可变（Immutably）的，有以下两条主要理由：

- 如果需要取决于突变本身和突变的位置，可能会导致跟你渲染预期不一致的组件渲染行为
- 关心数据什么时候以及为何发生变化都会带来困惑

数据不可变更新是 React 单向数据流思想的灵魂，也是`React.memo`及类似的 API 依赖的浅比较操作的基石，一旦数据可变了（Mutable）了，那么这种比较没有任何意义（同一份引用），重渲染压根不会执行。

比如我这样突变一个数组：

```jsx
const [todos, setTodos] = useState(someTodosArray);

const onClick = () => {
  todos[3].completed = true;
  setTodos(todos);
};
```

那么组件的重渲染是失效的，技术上来说，只有最外面的引用必须做到不可变的更新，改下上面的案例：

```jsx
const onClick = () => {
  const newTodos = todos.slice();
  newTodos[3].completed = true;
  setTodos(newTodos);
};
```

这时通过 slice 创建了一个新的数组引用，重渲染被触发了

**基本底线：React 及其生态系统都奉行不可变更新的原则，任何时候你进行了可变的更新（突变），极有可能同时带来 bug，不要这么做**

### Measuring React Component Rendering Performance 衡量 React 组件渲染性能

切记在**生产环境**去测量你的渲染性能

## Context and Rendering Behavior 上下文和渲染行为

React 的 Context API 是一种为提供的单个值注入到组件所有层级子组件的机制，任何在`<MyContext.Provider>`标签下运行的子组件都被从上下文实例中读取到这个值，而不用通过 props 进行层层传递

Context 并不是一个状态管理工具，你得自行管理这些传递的值。

### Updating Context Values 更新上下文的值

React 会检查 Context 中 Provider 提供的值是否是新的引用，一旦发生变化，那么就认为上下文需要进行更新了

```jsx
function GrandchildComponent() {
  const value = useContext(MyContext);
  return <div>{value.a}</div>;
}

function ChildComponent() {
  return <GrandchildComponent />;
}

function ParentComponent() {
  const [a, setA] = useState(0);
  const [b, setB] = useState('text');

  const contextValue = { a, b };

  return (
    <MyContext.Provider value={contextValue}>
      <ChildComponent />
    </MyContext.Provider>
  );
}
```

这个例子中，每次`ParentComponent`进行渲染，React 会注意到`MyContext.Provider`已被提供一个新值，然后在向下循环的过程中找出所有`MyContext`的消费组件，当上下文 provider 得到一个新值时，所有消费组件都将进行重渲染

注意在 React 的角度来看，每个上下文的 provider 只有一个值，不管是个对象、数组或者基础类型，都仅仅是一个上下文的值。目前来说，消费 Context 的组件是没有办法跳过这种数据更新的，尽管它可能只关心这个值的一部分数据

### Context Updates and Render Optimizations 上下文的更新和渲染优化

进行下面的优化：

```jsx
function GreatGrandchildComponent() {
  return <div>Hi</div>
}

function GrandchildComponent() {
    const value = useContext(MyContext);
    return (
      <div>
        {value.a}
        <GreatGrandchildComponent />
      </div>
}

function ChildComponent() {
    return <GrandchildComponent />
}

const MemoizedChildComponent = React.memo(ChildComponent);

function ParentComponent() {
    const [a, setA] = useState(0);
    const [b, setB] = useState("text");

    const contextValue = {a, b};

    return (
      <MyContext.Provider value={contextValue}>
        <MemoizedChildComponent />
      </MyContext.Provider>
    )
}

```

此时如果我们调用`setA(42)`：

- `ParentComponent`将会重渲染
- 新的`contextValue`引用被创建
- React 注意到`MyContext.Provider`有一个新的 context value，因此所有消费组件将会得到更新
- React 尝试渲染`MemoizedChildComponent`，发现它被包进了`React.memo()`里，然而根本没有传递任何的 props，所以认为 props 并没有发生改变，整个跳过`ChildComponent`的渲染
- 但是，由于`MyContext.Provider`有一个更新，因此更深层及可能有需要知道变化的组件
- 于是 React 接着往下触达`GrandchildComponent`，这里发现`MyContext`被`GrandchildComponent`读取了，context 的值变了，因此这里需要对`GrandchildComponent`进行重渲染
- 因为`GrandchildComponent`渲染了，因此 React 会继续往下渲染其内部的所有组件，`GreatGrandchildComponent`也被重渲染了

## Summary 总结

- 