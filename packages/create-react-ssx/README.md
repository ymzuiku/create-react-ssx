# create-react-ssx

这是一个 React + Vite + Fastify 的全栈项目，支持 SSR，同时并且可以很好的分离编译前后端代码（SSG）。后端仅仅是一个 fastify 的起步，足够轻量，你可以用此工程作为起点，开启你雄心勃勃的项目。

## Feature

这应该是截止到 2021 年 9 月 1 日，以 React 作为前端的 NodeJS 全栈方案，较为完整的起步工程

- 支持 SSG / SSR
- 类似 Next 的约定路由: src/pages 下所有 \*.tsx 文件均为页面组件, 文件或文件夹名以 `_` 开头的除外
- 自动懒加载 (开发环境不生效)
- 支持 tailwind-jit
- eslint + prettier
- jest + esbuild
- pre-commit 配置：格式化 prettier，校验 eslint，单元测试，均通过后才可提交
- 支持服务端开发（服务端基于 cluster.fork 的热更新）
- 可以单独仅开发后端服务, 只需要删除工程根目录下 src 和 index.html 即是一个单纯的后端项目
- 可以在开发模式中使用 SSR，编译时分别编译，既享有全栈的开发体验，又享有前后端分离的编译和部署

## FQA

- Q: 它和 NextJS 的区别
  1. 此工程的初衷是全栈项目，它给你一个干净的 NodeJS 后端起点。
  1. 相对于已经封装好的 NextJS，这仅仅是一个起步工程，好处是你可以在此基础上自定义任何苛刻的需求
  1. 若你更喜欢用 SSG，那么此工程编译的后端不会带有任何 SSR/SSG 的代码块，和一个传统 NodeJS 后端一致
  1. 更小的后端体积，这在 ServerLess 的场景下会显得更有优势
  1. 使用 React-Route 作为路由
  1. 相对于库，工程可以做更多工程化的其他工作, 已经为您设置的所有无聊内容：typescript、eslint、prettier、pre-commit、jest(es-build)
- Q: 为什么 npm run dev 样式会延迟加载？
  - 开发环境下 tailwind-jit 还未动态编译完
- Q: 为什么会遇到错误: `ReferenceError: window is not defined` 或者 `fetch is not defined`
  - 雷同于 NextJS，在组件 SSR\SSG 时，请不要在 onMound 生命周期之前访问 window 下的对象

## Getting Started

### CLI

创建工程:

```bash
npx create-react-ssx my-project
cd my-project
npm install
```

### Script

- npm run dev : 启动开发模式
- npm run build:ssr : 编译生产 SSR
- npm run build:ssg : 前端预编译(SSG) 并且拷贝静态资源到服务端
- npm run build:server : 编译生产的纯后端
- npm run build:static : 前端预编译(SSG)
- npm run server : 预览遍以后的服务

## SSR 获取数据

1. 雷同 NextJS 的 `getServerSideProps` API, 在页面组建中，`export getServerSideProps` 方法，SSR 在渲染组件之前会先抓取数据，注入到页面的 Props 中
2. 注意 getServerSideProps 不仅在 SSR 模式中生效，在 SSG (静态预渲染) 中会阻塞组件渲染，直到拿到数据。
3. getServerSideProps 的数据仅在 SSR 时或组件第一次渲染时执行一次，它并不适合做客户端动态更新的请求
4. 在开发模式中 getServerSideProps 永远都从前端获取数据；(原因：为了更高效的开发环境，前端热更新和后端热重启是分离的，getServerSideProps 的代码在前端代码中，而实际执行在后端代码中).
5. getServerSideProps 的入参仅有 URL 相关数据，其目的是为了 getServerSideProps 兼容未使用 SSR 时，可以在前端获取 BFF 端的数据

```tsx
export const getServerSideProps = async (req: GetServerSideRequire) => {
  await new Promise((res) => setTimeout(res, 100));
  return { str: "user", dog: req.query.dog, query2: req.query };
};
```

## Deploy

### 前端

- 拷贝 dist/static 到静态服务器中

### 后端

- 本工程会根据 dependencies 的内容和本地的依赖 lock 文件，编译一份 package.json 到 dist/server 中
- 确保 package.json 中 dependencies 均为纯后端依赖(若你使用 SSR，那么前端依赖也应该放到 dependencies 中)；同理，后端生产用不上的依赖应该放到 devDependencies 中
- 拷贝 dist/server 到生产服务器中，然后执行进入到目录中安装依赖即可

## 在历史 create-react-ssx 项目中更新版本

create-react-ssx 所有的逻辑都编写在 scripts 中，你可以从新的 create-react-ssx 拷贝 scripts 文件覆盖你当前工程的对应文件。有一个相关的命令帮忙做以上的事情：

```bash
# 在一个 create-react-ssx 工程中使用：
create-react-ssx --update
# 安装新依赖（若 package.json 有依赖变动）
npm run install
```

`--update` 命令一共做了两件事情：

1. 备份历史的 scripts 文件夹，并且下载新的 scripts 文件夹
2. 更新 package.json 中和新 create-react-ssx 相关的依赖

## 已知问题

- 前端测试文件请勿放到 src/pages 中，这会导致 vite 的 import.meta.globEage 加载测试文件从而编译失败
