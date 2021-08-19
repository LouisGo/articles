---
slug: 21-08-19
---

# 21-08-19[用 ts 的 namespace 帮助实现领域驱动]

## 背景

以男女话题为例（不是你想的那种），前端写接口请求时常见的做法是把涉及的所有请求方法堆在 `api/request` 文件里，做的好一点可能会以文件模块的形式分散在 `api/request/male` 和 `api/request/female` 目录下，然后在需要请求的业务文件里 `import { treeNewBee } from 'api/request/male'` 引入方法进行请求。

在简单的业务场景下这种做法没有问题，很优秀，但是一旦请求方法多了或者给方法附加的定语多了之后就会变得很难维护：

```typescript title="api/request/male"
/** 单身瘦高老男人吹牛皮 */
export function singleTallOldMaleTreeNewBee(
  params: SingleTallOldMaleTreeNewBeeParams
) {
  return request.post<SingleTallOldMaleTreeNewBeeResponse>(params);
}
/** 单身瘦高老男人打滚 */
export function singleTallOldMaleRolling() {
  // ...
}
/** 单身瘦高小男生打滚 */
export function singleTallYoungMaleRolling() {
  // ...
}
/** 单身胖男人吹牛皮 */
export function singleFatMaleTreeNewBee() {
  // ...
}
/** 单身胖男人打滚 */
export function singleFatMaleRolling() {
  // ...
}
```

```typescript title="api/request/female"
/** 单身瘦高老女人吹牛皮 */
export function singleTallOldFemaleTreeNewBee() {
  // ...
}
/** 单身瘦高老女人打滚 */
export function singleTallOldFemaleRolling() {
  // ...
}
/** 单身瘦高小女生打滚 */
export function singleTallYoungFemaleRolling() {
  // ...
}
/** 单身胖女人吹牛皮 */
export function singleFatFemaleTreeNewBee() {
  // ...
}
/** 单身胖女人打滚 */
export function singleFatFemaleRolling() {
  // ...
}
```

在引入方法进行使用的时候：

```typescript title="page/demo"
import {
  singleTallOldMaleTreeNewBee,
  singleTallYoungMaleRolling,
  singleFatMaleRolling,
} from 'api/request/male';
import {
  singleTallOldFemaleTreeNewBee,
  singleTallYoungFemaleRolling,
  singleFatFemaleRolling,
} from 'api/request/female';

// ...
singleTallOldMaleTreeNewBee().then(() => {}); //...
singleTallYoungMaleRolling().then(() => {}); //...
singleFatMaleRolling().then(() => {}); //...
singleTallYoungFemaleRolling().then(() => {}); //...
singleFatFemaleRolling().then(() => {}); //...
// ...
```

需要 import 什么方法，完全通过肉眼识别和依赖自觉的注释，如果一个新人此刻过来接手代码，想必内心是崩溃的

另外每需要新加一个请求方法，我们就得在 import 那里添加该方法的引用，在调用的时候再写一遍同名的引用名称（改名同理）

哪怕代码经过了简化，哪怕全部加上注释，哪怕你取的方法名无懈可击，面对满屏的 Old、Young、Fat 混杂着其它定语，编辑器上下滚动翻飞，我就问你晕不晕吧...

（这还是已经进行了文件模块划分的情况哦，如果全部方法堆在一个文件里，如果再加上 ts 类型和枚举，画美不看~）

## 让 ts 帮你体面

我们观察上面的简化逻辑可知：

- 业务对象主要为 male 和 female
- 很多方法的行为前缀（加的定语）是重用的
- 需要更好的组织形式帮助约束该业务领域

此时 [namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html) 请求出战。

为了方便描述，这次索性把它们都聚在一起：

```typescript title="api/request/human"
/** 男人 */
export namespace Male {
  /** 吹牛皮 */
  export namespace TreeNewBee {
    /** 单身且高且老 */
    export function singleTallOld() {}
    /** 单身且胖 */
    export function singleFat() {}
  }
  /** 打滚 */
  export namespace Rolling {
    export function singleTallOld() {}
    export function singleTallYoung() {}
    export function singleFat() {}
  }
}

/** 女人 */
export namespace Female {
  /** 吹牛皮 */
  export namespace TreeNewBee {
    /** 单身瘦高老的 */
    export function singleTallOld() {}
    export function singleFat() {}
  }
  /** 打滚 */
  export namespace Rolling {
    export function singleTallOld() {}
    export function singleTallYoung() {}
    export function singleFat() {}
  }
}
```

用的时候通过 `* as XXX` 的方式给下面的 request 再添加一个 `Human` 的 namespace，天知道以后的需求要不要加 `Dog` 相关的请求对吧~

然后一路 `.` 过去就 ok 了

```typescript title="page/demo2"
import * as Human from 'api/request/human';

// ...
Human.Male.TreeNewBee.singleTallOld().then(() => {}); // ...
Human.Male.Rolling.singleTallYoung().then(() => {}); // ...
Human.Male.Rolling.singleFat().then(() => {}); // ...
Human.Female.Rolling.singleTallYoung().then(() => {}); // ...
Human.Female.Rolling.singleFat().then(() => {}); // ...
// ...
```

更爽的是开发体验感，这不比博人转燃？

![image.png](https://i.loli.net/2021/08/19/gyhc4fMrotuJOxv.png)

![image.png](https://i.loli.net/2021/08/19/pmHaWfdiNZFMQ7e.png)

ts 不仅帮你做好了领域约束和提示，并且在敲击 `[namespace].XXX` 的过程中也顺便明确了当前的限界上下文，理顺了业务逻辑

妈妈再也不用担心我晕码了！
