export default function User() {
  const handleClick = () => {
    console.log("hello", new Map(), new Set(), new Promise((s) => s(void 0)));
  };
  return <div onClick={handleClick}>use react testing</div>;
}
