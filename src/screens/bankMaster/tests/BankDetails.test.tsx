import { render, screen } from "@testing-library/react";
import BankDetails from "../components/BankDetails";

describe("BankDetails", () => {
  test("renders component", () => {
    render(<BankDetails />);

    expect(screen.getByText("Bank Details")).toBeInTheDocument();
  });
});
