# react-vite-base

这是一个 React 全栈项目，支持 SSR，同时并且可以很好的分离编译前后端代码（SSG）。后端仅仅是一个 fastify 的起步，足够轻量，你可以用此工程作为起点，开发一个用于商业生产的全栈项目。

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

安装依赖请使用 [pnpm](https://pnpm.js.org/)

- pnpm i : 安装依赖
- npm run dev : 启动开发模式
- npm run build : 编译 SSG
- npm run server : 启动服务

## FQA

- Q: 为什么 npm run dev 样式会延迟加载？
  - A: tailwind-jit 还未动态编译完
- Q: 它和 NextJS 的区别
  1. 此工程的初衷就是全栈项目，它给你一个干净的 NodeJS 后端起点。
  1. 相对于已经封装好的 NextJS，这仅仅是一个起步工程，好处是你可以在此基础上自定义任何苛刻的需求
  1. 若你更喜欢用 SSG，那么此工程编译的后端不会带有任何 SSR/SSG 的代码块，和一个传统 NodeJS 后端一致
  1. 更小的后端体积，这在 ServerLess 的场景下会显得更有优势
  1. 使用 React-Route 作为路由
  1. 相对于库，工程可以做更多工程化的其他工作, 已经为您设置的所有无聊内容：typescript、eslint、prettier、pre-commit、jest(es-build)
