import { useState, useEffect } from "react";

export default function User(props: Record<string, unknown>) {
  const [state, setState] = useState("");
  useEffect(() => {
    fetch("/ping", { method: "GET" })
      .then((v) => v.text())
      .then((res) => {
        setState(res);
      });
  }, []);
  return (
    <>
      <div>use react testing: {state}</div>
      <div>ssr props: {JSON.stringify(props)}</div>
    </>
  );
}
export const getServerSideProps = async (query: Record<string, unknown>) => {
  const str = await fetch("/ping", { method: "GET" }).then((v) => v.text());
  return { str: "user5" + str, date: new Date().toString(), dog: query.dog, query2: query };
};
