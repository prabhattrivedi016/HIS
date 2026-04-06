import { useAppSelector } from "@/store/hooks";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useAuthorizedPages } from "../../store/useAuthorizedPages";
import { normalizeRouteKey } from "../../utils/route";
import Login from "../login";
import { authorizedRouteMap } from "../routes";
import NoPage from "../unauthorized";
import Sidebar from "./components/Sidebar";
import { hasAccess } from "./components/accessControl";

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { authorizedPages } = useAuthorizedPages();
  const { accessRights: response } = useAppSelector(state => state.accessRights);

  const isAuthInitialized = Boolean(authContext?.isInitialized);
  const isAuthenticated = Boolean(authContext?.token || authContext?.user);

  if (!isAuthInitialized) {
    return null;
  }

  return (
    <Router basename="/GWSNHIS">
      <Routes>
        {/* Public Route */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* Protected Layout */}
        <Route element={isAuthenticated ? <Sidebar /> : <Navigate to="/" replace />}>
          <Route path="/dashboard" element={authorizedRouteMap["dashboard"]} />

          {/* Dynamic Routes with Access Control */}
          {(Array.isArray(authorizedPages) ? authorizedPages : []).flatMap(tab =>
            tab.pages
              .filter(page => {
                const pageKey = normalizeRouteKey(page.url);
                return hasAccess(pageKey, response);
              })
              .map(page => {
                const pageKey = normalizeRouteKey(page.url);
                const Component = authorizedRouteMap[pageKey];

                if (!Component) {
                  console.warn(`No component mapped for: ${page.url}`);
                  return null;
                }

                return (
                  <Route
                    key={page.subMenuId}
                    path={`/${pageKey}`}
                    element={
                      hasAccess(pageKey, response) ? Component : <Navigate to="/no-page" replace />
                    }
                  />
                );
              })
          )}

          {/* Unauthorized Page */}
          <Route path="/no-page" element={<NoPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/no-page" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default Navbar;
