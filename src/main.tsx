import "@fortawesome/fontawesome-free/css/all.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { BillingAmountProvider } from "./context/BillingAmountContext";
import { PatientProvider } from "./context/PatientContext";
import { RoleProvider } from "./context/RoleContext";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./store/store";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
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
    </React.StrictMode>
  );
}
