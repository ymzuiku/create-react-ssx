// If you need pass this test, please create .env file like this:
// VITE_SOME_KEY=500
test("VITE_SOME_KEY", () => {
  expect(process.env.VITE_SOME_KEY).toEqual("500");
});
