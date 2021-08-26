import { Link } from "react-router-dom";
import { urls } from "../App";

export default function Index() {
  return (
    <div>
      <h1>hello home index</h1>
      <ul>
        {urls.map((url) => {
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
