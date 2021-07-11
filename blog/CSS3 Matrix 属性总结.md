---
title: CSS3 Matrix属性总结
date: 2018-06-27
author: LouisGo
author_title: 一介前端
author_image_url: https://i.loli.net/2021/07/10/sfmijBHXGraYDTA.jpg
tags: [前端, CSS]
keywords: [速查, 参考, 指南, CSS3, Matrix, CSS]
---

# 背景

在 web 端刷微博点开图片时，发现有图片向左旋转和向右旋转等功能，出于职业本能，我自然的猜测：当然是用`transfrom: rotate(ndeg)`做的啦！

但是打开 console 却发现跟我想的有点不太一样：

<!--truncate-->

![](http://ww1.sinaimg.cn/large/be7ff520gy1fspi8g5dvbj208p04xwec.jpg)

渣浪用的居然是`matrix`属性（其实这里用`matrix`有种炫技的赶脚，后文会提）！

说起`matrix`，FEer 可能既熟悉又陌生，毕竟我们平时使用`transform`时，其实更多的是使用`rotate`, `translate`, `scale`等属性，这些是基于`matrix`的魔改，属于造福人类的属性，但是`matrix`我们却用(gen)的(ben)并(mei)不(yong)多(guo)。此时我也认识到了自己知识的短浅，赶紧查漏补缺，写下此文加深对`matrix`大佬的印象。

# 属性总结

## 基本用法

```css
transform: matrix(a, b, c, d, e, f);
```

## 转换公式

![](http://ww1.sinaimg.cn/large/be7ff520gy1fspj00eg7nj207t02s0td.jpg)

## translate

```css
transform: matrix(0, 0, 0, 0, tx, ty);
```

等于：

```css
transform: translate(tx, ty);
```

## scale

```css
transform: matrix(sx, 0, 0, sy, 0, 0);
```

等于：

```css
transform: scale(sx, sy);
```

## rotate

这个稍微复杂一点，需要用到三角函数，这边总结几个常用角度，建议使用直接使用`rotate`：

`rotate(0deg)`等于：

```css
transform: matrix(1, 0, 0, 1, 0, 0);
```

`rotate(90deg)`等于：

```css
transform: matrix(0, 1, -1, 0, 0, 0);
```

`rotate(180deg)`等于：

```css
transform: matrix(-1, 0, 0, -1, 0, 0);
```

`rotate(270deg)`等于：

```css
transform: matrix(0, -1, 1, 0, 0, 0);
```

## skew

`skew`同`rotate`，还是不要用复杂的`matrix`了

## 镜像对称效果

对于这种需求，使用`matrix`再好不过

### 左右镜像对称

```css
transform: matrix(-1, 0, 0, 1, 0, 0);
```

### 上下镜像对称

```css
transform: matrix(1, 0, 0, -1, 0, 0);
```

或者：

```css
transform: scale(-1);
```
