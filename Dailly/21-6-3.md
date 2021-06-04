# 问题记录

## 一个场景引发的思考

之前做建博会页面时有一个场景，大概的意思是垂直方向滚动到了一定距离时会出现一个返回顶部的按钮，再简单不过的需求。

今天刚好看到一篇博文分析 react 的正交组件，几乎完美击中上述的场景。所谓正交就是模块之间不会相互影响，也可以简单理解为喜闻乐见的“解耦”。

### 简单的实现

大部分人第一时间想到的方案：

```jsx
import React, { useState, useEffect } from 'react';

const DISTANCE = 500;

function ScrollToTop() {
  const [crossed, setCrossed] = useState(false);

  useEffect(function () {
    const handler = () => setCrossed(window.scrollY > DISTANCE);
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  function onClick() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  if (!crossed) {
    return null;
  }
  return <button onClick={onClick}>Jump to top</button>;
}
```

可以实现效果，但是很明显按钮组件和滚动状态等判断揉在了一团。

思考以下几点改进：

1. 把滚动距离判断的逻辑单独抽出来（判断逻辑+视图）
2. 按钮组件也可以独立
3. 按需组合，通过 props 控制

### 承载滚动距离判断的容器

```jsx
import { useState, useEffect } from 'react';

function useScrollDistance(distance) {
  const [crossed, setCrossed] = useState(false);

  useEffect(
    function () {
      const handler = () => setCrossed(window.scrollY > distance);
      handler();
      window.addEventListener('scroll', handler);
      return () => window.removeEventListener('scroll', handler);
    },
    [distance]
  );

  return crossed;
}

function IfScrollCrossed({ children, distance }) {
  const isBottom = useScrollDistance(distance);
  return isBottom ? children : null; // 返回null则不渲染
}
```

### 按钮组件

这里理论上来说可以有无数种按钮实现，比如可以取 antd 的 Button。

```jsx
function onClick() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function JumpToTop() {
  return <button onClick={onClick}>Jump to top</button>;
}
```

### 缝合使用

```jsx
import React from 'react';
import JumpToTop from './';

// ...

// 滚动距离
const DISTANCE = 500;

function MyComponent() {
  // ...
  return (
    <IfScrollCrossed distance={DISTANCE}>
      <JumpToTop />
    </IfScrollCrossed>
  );
}
```

MyComponent 此时是一个 Main 组件。

Main 组件封装一些脏逻辑，即它要负责不同模块的组装，而这些模块之间不需要知道彼此的存在。

一个应用会存在多个 Main 组件，它们负责拼装各种作用域下的脏逻辑

### 正交设计的好处

- **容易维护：** 正交组件逻辑相互隔离，不用担心连带影响，因此可以放心大胆的维护单个组件。
- **易读：** 由于逻辑分离导致了抽象，因此每个模块做的事情都相对单一，很容易猜测一个组件做的事情。
- **可测试：** 由于逻辑分离，可以采取逐个击破的思路进行单测。
