---
title: 3 句话让 React 子组件为我少了 18% 的运行时开销
date: 2021-08-20
author: LouisGo
author_title: 一介前端
author_image_url: https://i.loli.net/2021/07/10/sfmijBHXGraYDTA.jpg
keywords:
  [
    hooks,
    forwardRef,
    useImperativeHandle,
    最佳实践,
    react,
    react新手,
    vue转react,
    typescript,
  ]
tags: [前端, 最佳实践, 性能优化]
---

# 3 句话让 React 子组件为我少了 18% 的运行时开销

大家好，我是一个精通人性的菜 🐔 男讲师。

原标题：**React hooks 子组件渲染的优化写法**。想了想这么平平无奇的标题怎么可能吸引臭直男进来呢，这不就换了个骚点的饵料打窝嘛~

<center><img alt="钓鱼" src="https://i.loli.net/2021/08/20/BO1xthQPLGWJsZ6.gif" width="250"/></center>

当然 18% 并不是一个量化的指标，也没有功夫跑相关的 benchmark，只是为了呼应《3 句话让男人为我花了 18w》这么一个梗，大家孝孝就好。

<center><img alt="孙狗" src="https://i.loli.net/2021/08/20/YfmADvNy5LTktVl.png" width="250"/></center>

## 背景

首先明确背景：**采用 hooks 写法**。class 写法可以直接采用`getDerivedStateFromProps` 方法进行 props 派生处理，故不在本次讨论范围内，当然都 1202 年了，能用 hooks 还是都用 hooks 吧。

一个简单却常见的场景：**父组件包裹子组件，子组件用于展示的是一个内部的值，但是依赖父组件的 count 通过 props 传递接收再经过 useMemo 计算得出**：

```typescript
import React, { useEffect, useMemo, useState } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>我是父组件</p>
      <p>父组件的count是{count}</p>
      <button onClick={() => setCount(count + 1)}>click</button>
      <Child count={count} />
    </div>
  );
}

const Child = React.memo(({ count }: { count: number }) => {
  const [number, setNumber] = useState(0);

  // 或者是useEffect
  useMemo(() => {
    setNumber(count);
  }, [count]);

  console.log('子组件 render');
  return (
    <div>
      <p>我是子组件</p>
      <p>子组件的number是{number}</p>
      <button onClick={() => setNumber(number + 1)}>click</button>
    </div>
  );
});

export default Parent;
```

这个时候点击父组件的 click 按钮，此时控制台鲜明的打印出了两次“子组件 render”，也就是说一次简单点击子组件就发生了两次渲染，很显然这不对劲。

两次 render 的原因各不相同：

1. Parent 组件渲染 Child 组件（父 -> 子）
2. Child 组件的副作用函数（useMemo）进行了 setNumber 同步 props.count 和 number（子 -> 子）

## 优化思路

问题本质在于**一次状态的更新在该例父子组件的语境下分成了两次渲染**，所以简单的来说我们只需要把它们“合”起来就行了。

大概整理如下思路：

1. 父 -> 子的一次更新过程中直接 cover 子 -> 子更新的情况，也就是跳过子组件本身的副作用更新
2. 模仿 getDerivedStateFromProps 实现 props 的派生
3. 状态提升，在数据容器里完成两次状态合并最终派发一次渲染请求，如借助响应式数据更新方法

## 优化实践

### 在 Parent 里给 Child 设置组件 key 值，强制 mount

尘归尘，土归土：父组件的 click 事件由父组件通过改变 key 值的方式强制重新 mount；子组件的 click 由子组件自己负责。

该方法非常简单粗暴，对性能影响最大，却有种蛋蛋的暴力美学。

```typescript
import React, { useEffect, useMemo, useState } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>我是父组件</p>
      <p>父组件的count是{count}</p>
      <button onClick={() => setCount(count + 1)}>click</button>
      // highlight-next-line
      <Child key={count} count={count} />
    </div>
  );
}

const Child = React.memo(({ count }: { count: number }) => {
  const [number, setNumber] = useState(0);

  console.log('子组件 render');
  return (
    <div>
      <p>我是子组件</p>
      <p>子组件的number是{number}</p>
      <button onClick={() => setNumber(number + 1)}>click</button>
    </div>
  );
});

export default Parent;
```

### 在子组件用 useRef 保持状态，省去数据的 set 同步环节

再次尘归尘，土归土：父组件的 click 事件由父组件通过 props 更新同步子组件的 ref 值完成一次渲染，省略了后续自身的 setState 环节；子组件自身的 click 之后更新 ref 值再手动调用一次 update 完成一次更新。

```typescript
import React, { useEffect, useMemo, useState, useRef } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>我是父组件</p>
      <p>父组件的count是{count}</p>
      <button onClick={() => setCount(count + 1)}>click</button>
      <Child count={count} />
    </div>
  );
}

const Child = React.memo(({ count }: { count: number }) => {
  // highlight-start
  const numberRef = useRef(0);
  const [, update] = useState({});

  const updateNumber = () => {
    numberRef.current++;
    update({});
  };

  // 或者是useEffect
  useMemo(() => {
    numberRef.current = count;
  }, [count]);
  // highlight-end
  console.log('子组件render');
  return (
    <div>
      <p>我是子组件</p>
      // highlight-next-line
      <p>子组件的number是{numberRef.current}</p>
      <button onClick={updateNumber}>click</button>
    </div>
  );
});

export default Parent;
```

### 通过 forwardRef 和 useImperativeHandle 完成“隔山打牛”

隔山打牛：父组件 click 之后透过 ref.current.update 方法替子组件调用了内部的 set 方法完成了一次性更新；子组件自身的 click 事件走正常的 render 逻辑。

```typescript
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useImperativeHandle,
} from 'react';

function Parent() {
  const [count, setCount] = useState(0);
  // highlight-next-line
  const ref = useRef(null);
  return (
    <div>
      <p>我是父组件</p>
      <p>父组件的count是{count}</p>
      <button
        onClick={() => {
          setCount(count + 1);
          // highlight-next-line
          (ref.current as any).update(count + 1);
        }}
      >
        click
      </button>
      // highlight-next-line
      <Child count={count} ref={ref} />
    </div>
  );
}

const Child = React.forwardRef(({ count }: { count: number }, ref: any) => {
  const [number, setNumber] = useState(0);
  // highlight-start
  useImperativeHandle(
    ref,
    () => ({
      update(n: number) {
        // 实际更新
        setNumber(n);
      },
    }),
    []
  );
  // highlight-end
  console.log('子组件render');
  return (
    <div>
      <p>我是子组件</p>
      // highlight-next-line
      <p>子组件的number是{number}</p>
      <button onClick={() => setNumber(number + 1)}>click</button>
    </div>
  );
});

export default Parent;
```

### 响应式更新和其它骚操作？

左转 [vue3](https://v3.cn.vuejs.org/) 和 [RxJS](https://cn.rx.js.org/)（手动滑稽）。

当然这里也可以手写一个 `useReactive` 完成功能，但是没必要 →_→，周五回家饮茶先啦柒头~。

**最后，欢迎点击左下角的【编辑此页】进入 gayhub 一起探讨其它的骚操作或者进行想法碰撞**，有什么想法 issues 区见。

## 参考链接

- [How do I implement getDerivedStateFromProps?](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops)
- [使用 React hooks 如何只让下面这段代码的子组件只 render 一次？](https://www.zhihu.com/question/444068787)
