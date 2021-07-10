---
slug: 21-05-18
---

# 21-05-18[git commit message预研记录]

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
