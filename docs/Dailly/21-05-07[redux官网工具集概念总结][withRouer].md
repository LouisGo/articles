---
slug: 21-05-07
---

# 21-05-07[redux官网工具集概念总结][withRouer]

## @reduxjs/toolkit

中文文档 [https://redux-toolkit-cn.netlify.app/introduction/quick-start](https://redux-toolkit-cn.netlify.app/introduction/quick-start)

英文文档 [https://redux.js.org/redux-toolkit/overview](https://redux.js.org/redux-toolkit/overview)

### 出现背景

RTK 致力于成为编写 Redux 逻辑的标准方式。它最初是为了帮助解决有关 Redux 的三个常见问题而创建的：

- "配置一个 Redux store 过于复杂"
- "做任何 Redux 的事情我都需要添加很多包"
- "Redux 需要太多的样板代码"

### 主要 API

- `[configureStore()](https://redux-toolkit-cn.netlify.app/api/configureStore)`: 包装  `createStore`  以提供简化的配置选项和良好的默认预设。它可以自动组合你的切片 reducers，添加您提供的任何 Redux 中间件，默认情况下包含  `redux-thunk` ，并允许使用 Redux DevTools 扩展。

  ```jsx
  // before:
  const store = createStore(counter);

  // after:
  const store = configureStore({
    reducer: counterReducer,
  });
  ```

- `[createAction()](https://redux-toolkit-cn.netlify.app/api/createAction)`: 为给定的 action type string 生成一个 action creator 函数。函数本身定义了  `toString()`，因此它可以用来代替 type 常量。

  本质是为了减少之前手工写 action type 和 action creator 的样板代码，正确的名称应该叫做 createActionCreator，这里注意：配合 ts 使用时，ts 可能不会接受隐式的 toString()转换

  ```jsx
  // 原本的实现: 纯手工编写 action type 和 action creator
  const INCREMENT = 'INCREMENT';
  const DECREMENT = 'DECREMENT';

  function incrementOriginal() {
    return { type: INCREMENT };
  }
  function decrementOriginal() {
    return { type: DECREAMENT };
  }
  console.log(incrementOriginal()); // {type: "INCREMENT"}

  // 使用 createAction 来生成 action creator:
  const incrementNew = createAction('INCREMENT');
  const decrementNew = createAction('DECREMENT');
  console.log(incrementNew()); // {type: "INCREMENT"}

  // 使用incrementNew.type或者incrementNew.toString(经过重写)来在reducer里引用action type
  // fake
  function countReducer(state, action) {
    switch (action.type) {
      case incrementNew.type:
        return state + 1;
      case decrementNew.type:
        return state - 1;
      default:
        return state;
    }
  }
  ```

- `[createReducer()](https://redux-toolkit-cn.netlify.app/api/createReducer)`: 为 case reducer 函数提供 action 类型的查找表，而不是编写 switch 语句。此外，它会自动使用`[immer`  库](https://github.com/mweststrate/immer)来让您使用普通的可变代码编写更简单的 immutable 更新，例如  `state.todos [3] .completed = true`和`state.push({completed: true})`，可以在 immutable 的数据里用 mutable 的写法，immer 会帮你做处理

  本质是为了美化 if-else 和 switch 语句样板代码带来的不适阅读体验，用查找表的思想去组织代码

  ```jsx
  // 原本的reducer
  function countReducerOrigin(state, action) {
    switch (action.type) {
      case incrementNew.type:
        return state + 1;
      case decrementNew.type:
        return state - 1;
      default:
        return state;
    }
  }
  // createReducer重写
  const countReducer = createReducer(0, {
    [increment.type]: (state) => state + 1,
    [decrement.type]: (state) => state - 1,
  });
  // 由于计算属性语法将在其中任何变量上调用 toString() ，我们可以直接使用 action creator 函数而不用 .type 字段
  const countReducer = createReducer(0, {
    [increment]: (state) => state + 1,
    [decrement]: (state) => state - 1,
  });
  ```

- `[createSlice()](https://redux-toolkit-cn.netlify.app/api/createSlice)`: 接受一个 reducer 函数的对象、分片名称和初始状态值，并且自动生成具有相应 action creators 和 action 类型的分片 reducer。

  createSlice 更近一步，他甚至帮你把 action creator 的活都干了，我们只需要关心 reducer 生成的逻辑：

  ```jsx
  // before
  const increment = createAction('INCREMENT');
  const decrement = createAction('DECREMENT');

  const counter = createReducer(0, {
    [increment]: (state) => state + 1,
    [decrement]: (state) => state - 1,
  });

  const store = configureStore({
    reducer: counter,
  });

  document.getElementById('increment').addEventListener('click', () => {
    store.dispatch(increment());
  });

  // after
  const counterSlice = createSlice({
    name: 'counter', // slice名称
    initialState: 0, // 初始数据
    reducers: {
      increment: (state) => state + 1,
      decrement: (state) => state - 1,
    },
  });

  const {
    actions: { increment, decrement },
    reducer,
  } = counterSlice;

  const store = configureStore({
    reducer,
  });

  document.getElementById('increment').addEventListener('click', () => {
    store.dispatch(increment());
  });
  ```

- `[createAsyncThunk](https://redux-toolkit-cn.netlify.app/api/createAsyncThunk)`: 接受一个 action type string 和一个返回 promise 的函数，并生成一个发起基于该 promise 的`pending/fulfilled/rejected` action 类型的 thunk。
- `[createEntityAdapter](https://redux-toolkit-cn.netlify.app/api/createEntityAdapter)`: 生成一组可重用的 reducers 和 selectors，以管理存储中的规范化数据
- `[createSelector`  组件](https://redux-toolkit-cn.netlify.app/api/createSelector)  来自  [Reselect](https://github.com/reduxjs/reselect)  库，为了易用再导出。

### 快速构建模版

```bash
$ npx create-react-app redux-app --template redux-typescript
```

# 问题记录

1. withRouter 作为一个 HOC，可以自动往 props 里注入 history、location、match 等信息。vue2 里面要获取路由信息一般是直接使用`this.$router.xxx`，这样做其实是污染了原型，当然后面 vue3 改成了 useRouter。react 这边的思路是运用高阶函数去实现控制反转。
2. antd Form 组件的设计还需要结合文档深入理解下，这块跟 element-ui 和 antd-vue 都有不小区别
3. activity-operation-frontend 项目调试时需要带上 token query
