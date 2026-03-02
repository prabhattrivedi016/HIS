import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useAuthorizedPages } from "../../store/useAuthorizedPages";
import Login from "../login";
import { authorizedRouteMap } from "../routes";
import NoPage from "../unauthorized";
import Sidebar from "./components/Sidebar";

const Navbar = () => {
  const { authorizedPages } = useAuthorizedPages();

  return (
    <Router basename="/GWSNHIS">
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected */}
        <Route element={<Sidebar />}>
          <Route path="/dashboard" element={authorizedRouteMap["dashboard"]} />

          {(Array.isArray(authorizedPages) ? authorizedPages : []).flatMap(tab =>
            tab.pages.map(page => {
              const Component = authorizedRouteMap[page.url];

              if (!Component) {
                console.warn(`No component mapped for: ${page.url}`);
                return null;
              }

              return <Route key={page.subMenuId} path={`/${page.url}`} element={Component} />;
            })
          )}

          <Route path="/no-page" element={<NoPage />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/no-page" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default Navbar;
