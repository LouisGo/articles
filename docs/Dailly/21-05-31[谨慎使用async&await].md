---
slug: 21-05-31
---

# 21-05-31[谨慎使用async&await]

普通的异步代码：

```javascript
(async () => {
  const pizzaData = await getPizzaData(); // async call
  const drinkData = await getDrinkData(); // async call
  const chosenPizza = choosePizza(); // sync call
  const chosenDrink = chooseDrink(); // sync call
  await addPizzaToCart(chosenPizza); // async call
  await addDrinkToCart(chosenDrink); // async call
  orderItems(); // async call
})();
```

从语法上说没有问题，表达的是同时请求披萨和饮料的数据，然而当披萨和饮料并没有依赖关系时，其实期待的应该是 `getPizzaData` 和 `getDrinkData` 并行执行，然而这里顺序的 await 让 `getPizzaData` 阻塞了 `getDrinkData` 的执行。正确的做法是先同时执行函数，await 函数返回值或者使用 `Promise.all`：

```javascript
(async () => {
  const pizzaPromise = selectPizza();
  const drinkPromise = selectDrink();
  await pizzaPromise;
  await drinkPromise;
  orderItems(); // async call
  // or...
  Promise.all([selectPizza(), selectDrink()].then(orderItems));
})();
```

`async/await` 作为一个语法糖，天然的受到某些局限，它会把底下运行的代码统统”拍平“变成依赖异步结果的 suspense 状态。对于层层嵌套的场景是很适用，但对于一些需要并行处理的复杂情况，我们应该考虑结合 Promise 的相关 api 进行优化。

```javascript
// 正常的回调
a(() => {
  b();
});

c(() => {
  d();
});
// 直接翻译成async/await变成线性傻傻的顺序执行
await a();
await b();
await c();
await d();
// async/await曲线救国的办法（隔离）
(async () => {
  await a();
  b();
})();

(async () => {
  await c();
  d();
})();
// 较为适合的方法
async function ab() {
  await a();
  b();
}

async function cd() {
  await c();
  d();
}

Promise.all([ab(), cd()]);
```

**总结：`async/await` 虽好，不要贪杯~**
