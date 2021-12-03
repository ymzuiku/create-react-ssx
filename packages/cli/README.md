<img src="ssx-logo.svg" alt="create-react-ssx">

# create-react-ssx

这是一个 React + Vite + Fastify 的全栈项目，支持 SSR，同时并且可以很好的分离编译前后端代码（SSG）。后端仅仅是一个 fastify 的起步，足够轻量，你可以用此工程作为起点，开启你雄心勃勃的项目。

## Feature

这应该是截止到 2021 年 9 月 1 日，以 React 作为前端的 NodeJS 全栈方案，较为完整的起步工程。该脚手架不捆绑任何第三方库（react 及 react-router 除外）,
不会擅作主张的为你配置好状态管理等其他任何有妨碍你技术选型的库。

- 开箱 typescript
- 支持 SSG / SSR
- 自动配置路由，自动懒加载路由，并且可以按需预加载路由
- 支持 tailwind-jit
- eslint + prettier
- jest + esbuild
- pre-commit 配置：格式化 prettier，校验 eslint，单元测试，均通过后才可提交
- 支持服务端开发（服务端基于 cluster.fork 的热更新）
- 可以单独仅开发后端服务, 只需要删除工程根目录下 pages 和 index.html 即是一个单纯的后端项目
- 可以在开发模式中使用 SSR，编译时分别编译，既享有全栈的开发体验，又享有前后端分离的编译和部署

## FQA

- Q: 它和 NextJS 的区别
    1. 此工程的初衷是全栈项目，它给你一个干净的 NodeJS 后端起点。
    1. 相对于已经封装好的 NextJS，这仅仅是一个起步工程，好处是你可以在此基础上自定义任何苛刻的需求
    1. 若你更喜欢用 SSG，那么此工程编译的后端不会带有任何 SSR/SSG 的代码块，和一个传统 NodeJS 后端一致
    1. 更小的后端体积，这在 ServerLess 的场景下会显得更有优势
    1. 使用 React-Route 作为路由
    1. 相对于库，工程可以做更多工程化的其他工作, 已经为您设置的所有无聊内容：typescript、tailwind-jit、eslint、prettier、pre-commit、jest(esbuild)
    1. getServerSideProps 兼容 SSR 和 SSG
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

## 路由约定

1. **pages 及其子文件夹下所有 `index.tsx` 文件均为页面组件**
2. **路由解析会忽略路径中带有 `_` 开头的文件夹**

例子：

- pages/index.tsx : 匹配路径 `/`
- pages/sub/index.tsx : 匹配路径 `/sub`
- pages/dog/index.tsx : 匹配路径 `/dog`
- pages/sub/dog/index.tsx : 匹配路径 `/sub/dog`

#### 为什么不和 Next.js 一样匹配所有名称的路径，仅忽略 `_` 开头的文件？

因为仅使用 index.tsx 作为路由文件的好处是可以使用更直观的鸭子目录结构

例子:

```txt
- pages/
   - index.tsx // 这是根路径
   - sub/
      index.tsx // 这是页面
      Header.tsx // 这是页面的某子组建
      useData.ts // 这是页面的hooks
      states.ts // 这是页面的状态管理
   - _components/ // 这个文件夹由 _ 开头，会被忽略
      index.tsx
```

#### 合法的页面组件导出

规则：

1. 优先读取 `export default`
2. 其次读取首字母大写的 `export` 函数，确保只有一个此类函数

A.有 `export default` 导出 default， 优先使用 `export default`:

```tsx
export default function Home() {
    return <div>Home</div>;
}
```

B.其次使用首字母大写的 `export` 函数:

```tsx
export function Home() {
    return <div>Home</div>;
}
```

```tsx
// 正确，Props仅是类型对象，不会和页面组件冲突
export interface Props {
    title: string;
}

export function Home({title}: Props) {
    return <div>{title}</div>;
}
```

## 预先加载路由

SSG/SSR 预渲染配合路由懒加载虽然减少了首屏时间，但是也增加了切换页面的时间，有时候我们知道用户接下来会去到哪些页面，我们可以提前加载页面代码资源。

组件 `scripts/preload` 提供了页面预加载的方法，我们只需要执行相关页面的 preload 方法即可提前加载页面资源，如：`preload("/sub")` 即加载 /sub 页面的代码

直接预加载例子：

```tsx
import {preload} from "../scripts/preload";

export default function Home() {
    // preload会安全的仅在浏览器中生效，不会在 SSR 中执行, 并且每个路由仅会执行一次
    // 若你需要在一进入页面就自动预加载某个页面，也可直接写在组件中
    preload("/sub");

    return <div>hello</div>;
}
```

交互加载例子：

```tsx
import {preload} from "../scripts/preload";

export default function Home() {
    const handleLoadSubPage = () => preload("/sub");

    return (
        <div>
            <button className="bg-gray-200 p-2 m-3" onMouseEnter={handleLoadSubPage} onTouchStart={handleLoadSubPage}>
                鼠标移入时加载 /sub 页面的拆分代码，从而减少点击后的页面懒加载开销
            </button>
        </div>
    );
}
```

有规律的加载多个：

```tsx
import {preload} from "../scripts/preload";

function usePreloads() {
    // 假定我们需要加载 /a, /b, /c，在这些页面加载完了我们再加载 /big
    Promise.all([preload("/a"), preload("/b"), preload("/c")]).then(() => {
        preload("/big");
    });
}

export default function Home() {
    // 预加载多个页面
    usePreloads();

    return <div>hello</div>;
}
```

## Root 组件

为了保证 scripts 中不含有业务代码，便于更新，我们增加了一个 `pages/root.tsx` 的约定，默认情况下它是一个空组件，会加载在路由之外，它一般用在以下两个用途

1. 若业务需要在路由之外扩展组件，可以在此组件下继续开发
2. 全局需要引用的对象，如 polyfill，可以在 root.tsx 中引入

## route 钩子

若需要在 route 切换时，进行一些事件和重定向，请在 root.tsx 中使用 routerHooks.before:

```tsx
import {routerHooks} from "../scripts/routerHelper";

// 若返回字符串不为空，则重定向到指定字符串
routerHooks.before = (path) => {
    if (path === "/os" && localStorage.getItem("token")) {
        return "/os/pay";
    }
    return "";
};
```

## SSR 获取数据

1. 雷同 NextJS 的 `getServerSideProps` API, 在页面组建中，`export getServerSideProps` 方法，SSR 在渲染组件之前会先抓取数据，注入到页面的 Props 中
2. 注意 getServerSideProps 不仅在 SSR 模式中生效，在 SSG (静态预渲染)中也会降级生效，它会阻塞组件渲染，直到拿到数据。
3. getServerSideProps 的数据仅在 SSR 时或组件第一次渲染时执行一次，它并不适合做客户端动态更新的请求
4. 在开发模式中 getServerSideProps 永远都从前端获取数据；(原因：为了更高效的开发环境，前端热更新和后端热重启是分离的，getServerSideProps 的代码在前端代码中，而实际执行在后端代码中).
5. getServerSideProps 的入参仅有 URL 相关数据，其目的是为了 getServerSideProps 兼容未使用 SSR 时，可以在前端获取 BFF 端的数据

```tsx
export const getServerSideProps = async (req: GetServerSideRequire) => {
    await new Promise((res) => setTimeout(res, 100));
    return {str: "user", dog: req.query.dog, query2: req.query};
};
```

## 如何移除 tailwind

tailwind-jit 基本是你无感知的，但是若你更喜欢其他 css 方案，只需修改 `scripts/App.tsx`：

```tsx
// 注释第一行 tailwind.css 的引入, 如：
// import "./tailwind.css";
```

## 进行后端开发

后端的默认入口文件夹为 scripts，若您需要进行完整的后端开发，我们建议您做以下调整：

1. 创建 server 文件夹，并把 `scripts/index.ts` 文件移动到 `server/index.ts` 中
2. 修改 添加 env 为 SERVER_DIR，从 `scripts` 修改为 `server`
3. 若有需要拷贝后端文件，可添加环境变量 `COPY_DIR=xxx` 到启动命令中，ssx 会帮你把xxx文件夹下的内容拷贝到运行环境中
4. 若有微服务需求，我们往往需要编译不同的输出路径，可以添加 `COPY_DIR=dist/server-a` 到启动命令中


## Deploy

### 前端

- 拷贝 dist/static 到静态服务器中

### 后端

- 为了更短的 ServerLess 冷启动时间，我们会将所有依赖打包到 index.js 文件中，在生产环境不需要再利用 npm 安装依赖
- 拷贝 dist/server 到生产服务器中，然后执行进入到目录中安装依赖即可

## 在历史 create-react-ssx 项目中更新版本

create-react-ssx 所有的逻辑都编写在 scripts 中，你可以从新的 create-react-ssx 拷贝 scripts 文件覆盖你当前工程的对应文件。有一个相关的命令帮忙做以上的事情：

```bash
# 在一个 create-react-ssx 工程中使用：
npx create-react-ssx --update
# or 强制覆盖更新
npx create-react-ssx --update --focus
# 安装新依赖（若 package.json 有依赖变动）
npm run install
```

`--update` 命令一共做了两件事情：

1. 备份历史的 scripts 文件夹，并且下载新的 scripts 文件夹
2. 更新 package.json 中和新 create-react-ssx 相关的依赖

## 编译 PKG 运行环境

PKG 需要描述 package.json 文件，我们可以在环境变量中添加 `BUILD_PKG=true` 来编译 package.json 描述文件



