export const sub = async () => {
  console.log("try sub import()");
  // eslint-disable-next-line no-async-promise-executor
  await new Promise(async (res) => {
    const { sub } = await import("./sub2");
    sub();
    res(void 0);
  });
  await Promise.resolve(async (res) => {
    const { sub } = await import("./sub2");
    sub();
    res(void 0);
  });
};
