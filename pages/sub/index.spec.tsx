import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Index from "./index";

test("renders learn react link", () => {
  const view = render(<Index />);
  const linkElement = view.getByText(/Hello Sub Page/i);
  expect(linkElement).toBeInTheDocument();
});
