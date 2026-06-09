import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ServiceMaster from "../index";

// render component
describe("ServiceMaster", () => {
  test("renders component", () => {
    const queryClient = new QueryClient();

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ServiceMaster />
        </QueryClientProvider>
      </MemoryRouter>
    );

    // expect(screen.getByText("Service Master")).toBeInTheDocument();
    expect(screen.getAllByText("Service Master")).toHaveLength(2);
  });
});

// render form field render
test("render all filters", () => {
  const queryClient = new QueryClient();
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ServiceMaster />
      </QueryClientProvider>
    </MemoryRouter>
  );

  const category = screen.getByText("Category");
  expect(category).toBeInTheDocument();
});

// for all test cases: there are two test cases
describe("ServiceMaster", () => {
  test("renders component", () => {
    const queryClient = new QueryClient();

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ServiceMaster />
        </QueryClientProvider>
      </MemoryRouter>
    );

    // expect(screen.getByText("Service Master")).toBeInTheDocument();
    expect(screen.getAllByText("Service Master")).toHaveLength(2);
  });
  test("renders all filters", () => {
    const queryClient = new QueryClient();

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ServiceMaster />
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Sub Category")).toBeInTheDocument();
    expect(screen.getByText("Sub Sub Category")).toBeInTheDocument();
    expect(screen.getByText("Service Name")).toBeInTheDocument();
  });

  //   check add new service button
  test("renders add new service button", () => {
    const queryClient = new QueryClient();

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ServiceMaster />
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", {
        name: /add new service/i,
      })
    ).toBeInTheDocument();
  });
});
