import { useState, useEffect } from "react";
import type { GetServerSideRequire } from "../../scripts/serverSideProps";

export default function User() {
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
    </>
  );
}
export const getServerSideProps = async (req: GetServerSideRequire) => {
  const str = await fetch("/ping", { method: "GET" }).then((v) => v.text());
  return { str: "user" + str, date: new Date().toString(), dog: req.query.dog, query2: req.query };
};
