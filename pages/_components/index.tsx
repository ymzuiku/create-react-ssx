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

export function Component({ title }: Props) {
  return (
    <div>
      <div>Hello Detail Page</div>
      <div>{title}</div>
    </div>
  );
}
