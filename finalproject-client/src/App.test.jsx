import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProviderWrapper } from "./context/auth.context";
import App from "./App";

test("renders community recipes heading", () => {
  render(
    <BrowserRouter>
      <AuthProviderWrapper>
        <App />
      </AuthProviderWrapper>
    </BrowserRouter>
  );
  const heading = screen.getByRole("heading", { name: /welcome to mealplan/i });
  expect(heading).toBeInTheDocument();
});
