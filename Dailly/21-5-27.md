# 问题记录

- Nuxt.js 生命周期函数：
  1. **nuxt 服务端初始化**：设置初始值，创建 nuxt context
  2. **路由中间件处理**：在渲染 page components 之前调用，可以用来路由跳转判断，三种类型的路由中间件依次调用：
     1. Global：影响所有路由，在`nuxt.config.js`中定义
     2. Layout: 影响一组路由，在`layout`目录下定义
     3. Page：影响单个路由，在`page`目录下定义
  3. **校验**：可用用来校验动态路由参数，返回一个 boolean 值，只在 page component 中可用
  4. **asyncData()**：合并 component data，每次加载 page 的时候都会调用，只在 page component 中可用
  5. **fetch(context)**：在渲染 page 前获取数据，有点像 asyncData，但并没有设置 component data，最常用的方式是设置 vuex 的值
  > ↑ 以上为服务端侧函数
  6. **created**
  7. **fetch**
  8. **mounted**
