import { useState, useEffect } from "react";

export default function User() {
  const [state, setstate] = useState("");
  useEffect(() => {
    fetch("/ping", { method: "GET" })
      .then((v) => v.text())
      .then((res) => {
        setstate(res);
      });
  }, []);
  return <div>use react testing: {state}</div>;
}
