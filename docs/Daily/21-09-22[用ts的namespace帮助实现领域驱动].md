---
slug: 21-09-22
---

# 21-09-22[css 伪类 href]

## 给所有 a 标签加上地址

```css
a::after {
  content: attr(href);
}
```
