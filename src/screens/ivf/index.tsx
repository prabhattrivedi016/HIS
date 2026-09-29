import { NavLink } from "react-router-dom";

const Ivf = () => {
  return (
    <div className="page-container">
      <h1 className="page-heading">IVF</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>IVF</span>
      </nav>
    </div>
  );
};

export default Ivf;
