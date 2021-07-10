---
slug: 21-05-14
---

# 21-05-14[electron依赖问题][forwadRef]

1. 安装 electron 依赖报错，一定记得手动设置 electron 为 taobao 源：

   ```bash
   npm config set electron_mirror "[https://npm.taobao.org/mirrors/electron/](https://npm.taobao.org/mirrors/electron/)"
   ```

# forwardRef

官网对`forwardRef`的概念和用法很笼统，也没有给定一个具体的案例。很多同学不知道 `forwardRef`具体怎么用，下面我结合具体例子给大家讲解`forwardRef`应用场景。

**1 转发引入 Ref**

这个场景实际很简单，比如父组件想获取孙组件，某一个`dom`元素。这种隔代`ref`获取引用，就需要`forwardRef`来助力。

```jsx
function Son(props) {
  const { grandRef } = props;
  return (
    <div>
      <div> i am alien </div>
      <span ref={grandRef}>这个是想要获取元素</span>
    </div>
  );
}

class Father extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <Son grandRef={this.props.grandRef} />
      </div>
    );
  }
}

const NewFather = React.forwardRef((props, ref) => (
  <Father grandRef={ref} {...props} />
));

class GrandFather extends React.Component {
  constructor(props) {
    super(props);
  }
  node = null;
  componentDidMount() {
    console.log(this.node);
  }
  render() {
    return (
      <div>
        <NewFather ref={(node) => (this.node = node)} />
      </div>
    );
  }
}
```

**效果**

![https://pic3.zhimg.com/v2-3fcb1dd67a3ae96af50f13af67d93cce_b.jpg](https://pic3.zhimg.com/v2-3fcb1dd67a3ae96af50f13af67d93cce_b.jpg)

forwaedRef.jpg

`react`不允许`ref`通过`props`传递，因为组件上已经有 `ref` 这个属性,在组件调和过程中，已经被特殊处理，`forwardRef`出现就是解决这个问题，把`ref`转发到自定义的`forwardRef`定义的属性上，让`ref`，可以通过`props`传递。

**2 高阶组件转发 Ref**

一文吃透`hoc`文章中讲到，由于属性代理的`hoc`，被包裹一层，所以如果是类组件，是通过`ref`拿不到原始组件的实例的，不过我们可以通过`forWardRef`转发`ref`。

```jsx
function HOC(Component) {
  class Wrap extends React.Component {
    render() {
      const { forwardedRef, ...otherprops } = this.props;
      return <Component ref={forwardedRef} {...otherprops} />;
    }
  }
  return React.forwardRef((props, ref) => (
    <Wrap forwardedRef={ref} {...props} />
  ));
}
class Index extends React.Component {
  componentDidMount() {
    console.log(666);
  }
  render() {
    return <div>hello,world</div>;
  }
}
const HocIndex = HOC(Index, true);
export default () => {
  const node = useRef(null);
  useEffect(() => {
    /* 就可以跨层级，捕获到 Index 组件的实例了 */
    console.log(node.current.componentDidMount);
  }, []);
  return (
    <div>
      <HocIndex ref={node} />
    </div>
  );
};
```

如上，解决了高阶组件引入`Ref`的问题。
