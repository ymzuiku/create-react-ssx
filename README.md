# react-vite-base

## Feature

这应该是截止到 2021 年 9 月 1 日，React 较为完成的起步工程

- 支持 SSG / SSR
- 类似 Next 的约定路由: src/pages 下所有 \*.tsx 文件均为页面组件, 文件夹或文件名为 `_` 开头的除外
- 自动懒加载 (开发环境不生效)
- 支持 tailwind-jit
- eslint + prettier
- jest + esbuild
- pre-commit 配置：格式化 prettier，校验 eslint，单元测试，均通过后才可提交
- 支持服务端开发（服务端基于 cluster.fork 的热更新）

## Scripts

- num run dev : 启动开发模式
- num run build : 编译 SSG
- num run server : 启动服务

## FQA

- Q: 为什么 npm run dev 样式会延迟加载？
  - A: tailwind-jit 还未动态编译完
