# react-vite-base

## Feature

- 支持 SSG / SSR
- 类似 Next 的约定路由: src/pages 下所有 *.tsx 文件均为页面组件, 文件夹或文件名为 `_` 开头的除外
- 自动懒加载 (开发环境不生效)
- 支持 tailwind-jit

## Scripts

- num run dev : 启动开发模式
- num run build : 编译 SSG
- num run server : 启动 SSR 服务


## FQA

- Q: 为什么 npm run dev 样式会延迟加载？
  - A: tailwind-jit 还未动态编译完