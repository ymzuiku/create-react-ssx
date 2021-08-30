// create .env like this:
// VITE_SOME_KEY=500
// And test it
test("VITE_SOME_KEY", () => {
  expect(process.env.VITE_SOME_KEY).toEqual("500");
});
