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
  return (
    <div>
      <div>Hello Sub Page</div>
      <div>{title}</div>
      <Other />
    </div>
  );
}

export function Cat() {
  console.log("hello");
}
