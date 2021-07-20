---
slug: 21-05-12
---

# 21-05-12[safari overflow问题记录][forwad ref]

1. safari 浏览器中 div 容器 `overflow: hidden + border-radius`，然后内嵌图片进行 transform 变化时圆角失效，解决办法：给容器加上 `transform: rotate(0deg)`
2. forwardRef

- **因为函数组件没有实例，所以函数组件无法像类组件一样可以接收 ref 属性**

```jsx
function Parent() {
  return (
    <>
      // <Child ref={xxx} /> 这样是不行的
      <Child />
      <button>+</button>
    </>
  );
}
复制代码;
```

- **forwardRef 可以在父组件中操作子组件的 ref 对象**
- **forwardRef 可以将父组件中的 ref 对象转发到子组件中的 dom 元素上**
- **子组件接受 props 和 ref 作为参数**

```jsx
function Child(props, ref) {
  return <input type="text" ref={ref} />;
}
Child = React.forwardRef(Child);
function Parent() {
  let [number, setNumber] = useState(0);
  // 在使用类组件的时候，创建 ref 返回一个对象，该对象的 current 属性值为空
  // 只有当它被赋给某个元素的 ref 属性时，才会有值
  // 所以父组件（类组件）创建一个 ref 对象，然后传递给子组件（类组件），子组件内部有元素使用了
  // 那么父组件就可以操作子组件中的某个元素
  // 但是函数组件无法接收 ref 属性 <Child ref={xxx} /> 这样是不行的
  // 所以就需要用到 forwardRef 进行转发
  const inputRef = useRef(); //{current:''}
  function getFocus() {
    inputRef.current.value = 'focus';
    inputRef.current.focus();
  }
  return (
    <>
      <Child ref={inputRef} />
      <button onClick={() => setNumber({ number: number + 1 })}>+</button>
      <button onClick={getFocus}>获得焦点</button>
    </>
  );
}
```
