import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import User from "./user";

test("renders learn react link", () => {
  render(<User />);
  const linkElement = screen.getByText(/use react testing/i);
  expect(linkElement).toBeInTheDocument();
});
