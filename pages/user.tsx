export default function User(props: Record<string, unknown>) {
  return <div>ssr props: {JSON.stringify(props)}</div>;
}
export const getServerSideProps = async (query: Record<string, unknown>) => {
  const str = await fetch("/ping", { method: "GET" }).then((v) => v.text());
  return {
    beforeFech: "ping: " + str,
    date: new Date().toString(),
    query: query,
  };
};
