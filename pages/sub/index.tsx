import { useHistory } from "react-router-dom";
import { Other } from "./other";

export interface Props {
  title?: string;
}

export const cache = {};

export const Dog = {};

export function hello() {
  console.log("hello");
}

export const world = () => {
  console.log("hello");
};

export function Sub({ title }: Props) {
  const h = useHistory();
  const handlePushDetail = () => {
    h.push("/sub/detailPage");
  };
  return (
    <div>
      <div>Hello Sub Page</div>
      <div>{title}</div>
      <Other />
      <button onClick={handlePushDetail}>go to detail page</button>
    </div>
  );
}
