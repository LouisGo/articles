---
slug: 21-05-11
---

# 21-05-11[setSatate][ts Event类型]

1.  setState 在 react 里的合成事件和钩子函数中是“异步”的，在原生事件和 setTimeout 中是同步的。
2.  setState 前面也是可以带 await 的，会变成同步设置状态，但这是一种巧合，不确定未来哪个版本就不支持了，为了遵循 react 框架的设计原则，我们使用回调函数的形式
3.  TypeScript 常用 Event 类型：

    ClipboardEvent<T = Element> 剪贴板事件对象

    DragEvent<T = Element> 拖拽事件对象

    ChangeEvent<T = Element> Change 事件对象

    KeyboardEvent<T = Element> 键盘事件对象

    MouseEvent<T = Element> 鼠标事件对象

    TouchEvent<T = Element> 触摸事件对象

    WheelEvent<T = Element> 滚轮事件对象

    AnimationEvent<T = Element> 动画事件对象

    TransitionEvent<T = Element> 过渡事件对象
