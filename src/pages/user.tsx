export default function User(props: Record<string, unknown>) {
  return (
    <>
      <div>ssr props: {JSON.stringify(props)}</div>
    </>
  );
}
export const getServerSideProps = async (query: Record<string, unknown>) => {
  const str = await fetch("/ping", { method: "GET" }).then((v) => v.text());
  return { str: "user8" + str, date: new Date().toString(), dog: query.dog, query2: query };
};
