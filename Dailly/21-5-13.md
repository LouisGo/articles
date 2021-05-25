# 问题记录

1. 自己瞎琢磨的，有时间搜下更好方案...

   react 的组件不能像 vue 组件那样直接通过 style 传递样式，因为 react 认为 style 是一个普通的 props

   ```html
   <SomeComponent style="margin: 0; padding: 0" />
   ```

   因此可以转换一下思路，就把 style 当成一个普通的 props，通过类型约束，然后甚至然后更灵活的在组件的任何位置去使 style 生效，而 vue 只能默认在组件最外层挂载样式

   ```tsx
   const SomeComponent: React.FC<{
     style?: React.CSSProperties;
   }> = ({ style }) => {
     return (
       <div className="outer">
         <div className="inner" style={style}></div>
       </div>
     );
   };
   ```

2. 对于同一个 div，先通过 transform: translate 改变其定位，再使用 animation 中运用到了 scale，则当 div 开始动作后 transform 失效

   解决办法：往上加一层进行分层动画
