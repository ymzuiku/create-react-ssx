import { useHistory } from "react-router-dom";
import { useState } from "react";
import { preload } from "../scripts/preload";

export function Index() {
  preload("/sub");
  const [num, setNum] = useState(0);
  const handleAddNum = () => {
    setNum(num + 1);
  };

  return (
    <div>
      <Cell />
      <div>
        num: {num}
        <button className="bg-gray-200 p-2 m-3" onClick={handleAddNum}>
          add num
        </button>
      </div>
    </div>
  );
}

function Cell() {
  const h = useHistory();

  return (
    <>
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Template</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Base React SSG/SSR in Vite
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              这或许是你伟大的项目的起点，这只是一个Vite的预设项目，你可以在此基础上继续自定义。
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div
                    onClick={() => h.push("/sub?dog=20")}
                    className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">支持 SSR/SSG</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">一个非常基础的SSR配置，新项目从这里开始非常合适</dd>
              </div>

              <div className="relative">
                <dt>
                  <div
                    onClick={() => h.push("/sub")}
                    className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">雷同 Next 的约定路由</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  pages 下所有 index.tsx 文件均为页面组件, 可以保留鸭子模型的目录结构
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">自动懒加载</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  所有路由在SSR/SSG的同时，还配置了懒加载。并且完全使用 React-Route-DOM, 你不需要学习新的API
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">其他细节 Tailwind-jit</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  默认已为你配置好 Tailwind-jit, ESLint, Prettier, 图片压缩
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
