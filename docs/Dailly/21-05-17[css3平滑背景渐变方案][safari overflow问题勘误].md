---
slug: 21-05-17
---

# 21-05-17[css3平滑背景渐变方案][safari overflow问题勘误]

1. css3 background linear-gradient 渐变背景的平滑动画效果

   ```html
   // html
   <button></button>
   // css
   <style>
     button {
       width: 200px;
       height: 40px;
       line-height: 40px;
       text-align: center;
       background: linear-gradient(85deg, red 0%, green 100%);
       transition: background 0.3s;
     }
     button:hover {
       background: linear-gradient(85deg, blue 0%, yellow 100%);
     }
   </style>
   ```

   从直觉上应该是一个红绿渐变的按钮平滑过渡成蓝黄渐变，但实际上却是生硬的切换，仅靠上面的`transition`想实现平滑过渡动画是不行的（改成 all 一样不行），因为 css3 的 transition 当前并不支持 background-image 的平滑过渡。

   解决方案：

   1. 使用 background-position 模拟简单的渐变背景动画
   2. 在当前 button 样式新增一个伪类，设置为低层级，加以想要去到的渐变色，通过 hover 改变 button 伪类的 opacity 模拟平滑渐变
   3. 通过 background-color 去模拟平滑渐变
   4. 借助 CSS3 houdini 的 Properties & Values API 实现（有兼容性问题，只有 chrome 有效）

      ```html
      // html
      <button></button>
      // css
      <style>
        button {
          --start-stop: red;
          --end-stop: green;
          width: 200px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          background: linear-gradient(
            85deg,
            var(--start-stop) 0%,
            var(--end-stop) 100%
          );
          transition: --start-stop 0.5s, --end-stop 0.5s;
        }
        button:hover {
          --start-stop: blue;
          --end-stop: yellow;
        }
      </style>
      // js
      <script>
        // 需要通过registerProperty把两个变量注册为合法的CSS属性
        if (window.CSS) {
          CSS.registerProperty({
            name: '--start-stop',
            syntax: '<color>',
            inherits: false,
            initialValue: 'transparent',
          });
          CSS.registerProperty({
            name: '--end-stop',
            syntax: '<color>',
            inherits: false,
            initialValue: 'transparent',
          });
        }
      </script>
      ```

2. 勘误：safari 浏览器中 div 容器 overflow: hidden + border-radius，然后内嵌图片进行 transform 变化时圆角失效，解决办法：给容器加上跟内嵌图片相同的 transform（如内部 scale 则外部 scale(0)，内部 transform 则 transform（0），不匹配则不起作用）
3. get 新 vs code 插件：vscode-styled-components，可以直接在字符串模版里获得 css 代码提示

   [styled-components/vscode-styled-components](https://github.com/styled-components/vscode-styled-components.git)
