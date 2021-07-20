---
slug: 21-05-19
---

# 21-05-19[git commit message落地记录]

因为 activity-website-frontend 项目影响范围较大，故选取`template/react-pc`模板脚手架项目新开`git-commit`分支进行落地实验。

且考虑到现阶段接受程度，先只开启 git commit 提交格式规范限制，不强制要求结合 eslint 限制实际代码规范。一些 config 型的配置文件可以考虑上传到 npm 私仓统一维护

## 技术选型

查阅了相关资料，选取了前端开源社区较为成熟的几个技术方案


### 替代 git commit 的工具

选用 `commitizen`，可以用生成的`git-cz`指令替代`git commit`；选用`cz-conventional-changelog`，用 Angular 规范的 preset 约束 commit message

```bash
yarn add -D commitizen cz-conventional-changelog
// 新增commit指令，用yarn commit或者npm run commit代替git commit
// 最好不要直接用git cz而使用commit指令，否则无法获得个性化内容！
npm set-script commit "git cz"
```

### 自定义规范设置和个性化文案

选用`cz-customizable`：

```bash
yarn add -D cz-customizable
```

项目根目录新增`.cz-config.js`配置文件，加上趣味的 emoji 提示文案：

```jsx
module.exports = {
  // types提示文案配置
  types: [
    {
      value: 'WIP',
      name: '🚧 WIP:      工作还在进行中，还未完成但不影响项目运行',
    },
    {
      value: 'feat',
      name: '✨ feat:     完成了新功能',
    },
    {
      value: 'fix',
      name: '🐛 fix:      修复了bug',
    },
    {
      value: 'refactor',
      name: '♻️  refactor: 进行了代码的重构',
    },
    {
      value: 'docs',
      name: '📝 docs:     变更了项目的文档内容',
    },
    {
      value: 'test',
      name: '✅ test:     添加了代码测试用例',
    },
    {
      value: 'chore',
      name: '🗯  chore:    更改了构建过程/工具函数/包管理器',
    },
    {
      value: 'style',
      name: '💄 style:    进行了不影响代码实际运行的行为，如添加空格/格式化/分号等',
    },
    {
      value: 'revert',
      name: '⏪ revert:   撤回了之前的某个提交',
    },
    {
      value: 'ci',
      name: '👷 ci:       对CI配置文件和脚本的修改，如Travis, Circle, BrowserStack, SauceLabs',
    },
    {
      value: 'perf',
      name: '⚡ perf:     提升了项目的性能',
    },
  ],
  // 信息提示文案
  messages: {
    type: '请选择你要提交更改的类型(必要)',
    scope: '\n请选择更改的影响范围(可选，按Enter下一步)：',
    // used if allowCustomScopes is true
    customScope: '请输入更改的影响范围(可选，按Enter下一步)：',
    // ticketNumber: '输入关联的需求或缺陷的编号:',
    // ticketNumberPattern: '请输入关联的需求或缺陷的编号：\n',
    subject: '请输入更改的简短描述(必要，100字以内)：\n',
    body: '请输入更改的详细描述，可使用"|"换行(可选，按Enter下一步)：\n',
    breaking: '请输入任何破坏性的更改(可选，按Enter下一步)：\n',
    footer: '请输入更改关闭的所有ISSUES(可选，按Enter下一步)：\n',
    confirmCommit: '确定将上面框内的信息进行提交吗？',
  },

  scopes: [],
  // 简短描述字数限制
  subjectLimit: 100,
  allowCustomScopes: true,
  // 允许发生重大变更的类型
  allowBreakingChanges: ['feat', 'fix', 'refactor', 'perf'],
  // skipQuestions: ['body', 'breaking', 'footer', 'scope', 'customScope']
};
```

以上步骤确保了`yarn commit`指令时的提交规范，却没有约束直接采用`git commit -m`的提交行为，需要用到下面的工具：

### 校验工具

采用 commitlint：

```bash
yarn add -D @commitlint/config-conventional @commitlint/cli
```

同时根目录新增`.commitlintrc.js`配置文件：

```jsx
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 书写规则
    'type-case': [
      2,
      'always',
      [
        'lower-case', // default
        'upper-case', // UPPERCASE
      ],
    ],
    // 只能选取以下类型枚举
    'type-enum': [
      2,
      'always',
      [
        'WIP',
        'feat',
        'fix',
        'refactor',
        'docs',
        'test',
        'chore',
        'style',
        'revert',
        'ci',
        'perf',
      ],
    ],
  },
};
```

### 结合 git hooks 工具

选取`husky`。这里有个深坑：

1. husky 近期版本混乱，从 v4-v5-v6 非常仓促
2. v4 到 v5 husky 变更了 license 协议，v4 采用 MIT 开源协议，但是到了 v5 就隐藏了巨大的商业风险，被吐槽的厉害于是匆忙上线 v6 分拆 normal 和 pro 版本
3. v4-v5-v6 的 api 基本都是 BREAKING CHANGE
4. 最终采用的是稳定的没有商业风险的 4.3.0 版本

利用 husky 在 commit-msg 的 git hooks 里调用 commitlint，最终的`package.json`里需要变动的部分如下：

```jsx
{
	// ...
	"scripts": {
		// ...other scripts
    "commit": "git cz"
  },
	"husky": {
    "hooks": {
      "commit-msg": "commitlint -e $GIT_PARAMS"
    }
  },
	"config": {
    "commitizen": {
      "path": "node_modules/cz-customizable"
    }
  },
	"devDependencies": {
		// ...other dependencies
    "@commitlint/cli": "^12.1.4",
    "@commitlint/config-conventional": "^12.1.4",
    "commitizen": "^4.2.4",
    "cz-conventional-changelog": "^3.3.0",
    "cz-customizable": "^6.3.0",
    "husky": "4.3.0"
  }
// ...
}
```

## 实际效果

![image.png](https://i.loli.net/2021/05/25/q9QZ8prmoXSshcM.png)

![image.png](https://i.loli.net/2021/05/25/iNtThrsOAS5kyD4.png)

![image.png](https://i.loli.net/2021/05/25/oQ5b2s34eaPCqDx.png)

# React 生态收集

## react-dnd

以 hooks 为基础的 react 拖拽手势库，类似 vue 的 VueDraggable

## react-final-form

以 hooks 为基础的 react 表单框架，支持表单校验、数据绑定、数据绑定

# react-frame-component

支持以 react 组件为基础创建 iframe，通过 context 控制 iframe 的 window 和 document

## react-feather

开源的 react 图标库
