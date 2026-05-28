import "@fortawesome/fontawesome-free/css/all.min.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

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
      </QueryClientProvider>
    </React.StrictMode>
  );
}
