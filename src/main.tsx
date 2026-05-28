import "@fortawesome/fontawesome-free/css/all.min.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { BillingAmountProvider } from "./context/BillingAmountContext";
import { PatientProvider } from "./context/PatientContext";
import { RoleProvider } from "./context/RoleContext";
import "./index.css";
import { store } from "./store/store";

const rootElement = document.getElementById("root");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient;


if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AuthProvider>
            <BillingAmountProvider>
              <RoleProvider>
                <PatientProvider>
                  <App />
                </PatientProvider>
              </RoleProvider>
            </BillingAmountProvider>
          </AuthProvider>
        </Provider>
                {/* React Query Devtools */}
        <ReactQueryDevtools initialIsOpen={false} />

      </QueryClientProvider>
    </React.StrictMode>
  );
}
