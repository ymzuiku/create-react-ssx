import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import User from "../pages/user";

test("renders learn react link", () => {
  render(<User />);
  const linkElement = screen.getByText(/ssr props/i);
  expect(linkElement).toBeInTheDocument();
});
