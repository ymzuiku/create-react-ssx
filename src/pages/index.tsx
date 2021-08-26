import { Link } from "react-router-dom";

export default function Index({ routes }: { routes: string[] }) {
  return (
    <div>
      <h1>hello home index</h1>
      <ul>
        {routes.map((url) => {
          return (
            <ol key={url}>
              <Link to={url}>{url}</Link>
            </ol>
          );
        })}
      </ul>
    </div>
  );
}
