# 读书笔记

- 所有 typeof 返回值为 "object" 的对象（如数组）都包含一个内部属性 [[Class]]（我们可以把它看作一个内部的分类，而非传统的面向对象意义上的类）。这个属性无法直接访问，一般通过 Object.prototype.toString(..) 来查看
- 由 于 基 本 类 型 值 没 有 .length 和 .toString() 这样的属性和方法，需要通过封装对象才能访问，此时 JavaScript 会自动为基本类型值包装（box 或者 wrap）一个封装对象：

  ```jsx
  var a = 'abc';
  a.length; // 3
  a.toUpperCase(); // "ABC"
  ```

- 如果想要得到封装对象中的基本类型值，可以使用 valueOf() 函数：

  ```jsx
  var a = new String('abc');
  var b = new Number(42);
  var c = new Boolean(true);
  a.valueOf(); // "abc"
  b.valueOf(); // 42
  c.valueOf(); // true
  ```

- `new Array(5)`出来的只是一个空数组（稀疏数组），只不过 length 被设置成了 5，这样奇特的数据结构会导致一些怪异的行为，不同浏览器的开发控制台显示的结果也不尽相同。而这一切都归咎于已被废止的旧特性（类似 arguments 这样的类数组），`Array.apply( null, { length: 5 } )`比上面的靠谱多了
- 使用常量形式（如 `/^a*b+/g`）来定义正则表达式，这样不仅语法简单，执行效率也更高，因为 JavaScript 引擎在代码执行前会对它们进行预编译和缓存。
- 创建错误对象（error object）主要是为了获得当前运行栈的上下文（大部分 JavaScript 引擎通过只读属性 .stack 来访问）。栈上下文信息包括函数调用栈信息和产生错误的代码行号，以便于调试（debug）。
- Symbol 并非对象，而是一种简单标量基本类型

# 技术预研

git commit message 推进的两个维度

## 管理维度

好处：

1. 规范化提交有利于快速排查问题，显著提升效率
2. 随着每一次的规范化提交，能不自觉帮助研发理顺开发思路
3. 方便后续自动生成 Change Log

## 技术维度

好处：

1. 规范化提交先行有利于凝聚技术向心力，为后续的代码规范准入做铺垫
2. 可以提升接手人员的维护和升级效率
3. 没有任何 Breaking Change，只需要改变其中一个 git commit 的习惯

## 基本步骤

1. 宣讲 git commit message 规范，以业界目前普遍使用的 Angular 规范作为切入点，结合实际案例更佳（为什么 → 怎么用），技术实现细节有兴趣再研究
2. 工具选择
   - commitizen（取代 git commit 生成标准规范的 commit 信息，利用 adapter 现个性化内容）
   - cz-conventional-changelog （获取 Angular 规范的支持）
   - commitlint（校验提交的信息），利用@commitlint/config-conventional adapter 校验 Angular 规范
   - husky（提供 git hooks 的封装，在这里配置调用 commitlint 完成能力闭环）
   - conventional-changelog-cli（自动生成 Change Log）
3. 使用

   ```bash
   git cz
   // or 使用自定义指令代替git commit -m "xxx"
   yarn commit
   ```

具体实现和技术细节待落地。
