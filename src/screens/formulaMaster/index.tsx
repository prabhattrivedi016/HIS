import { NavLink } from "react-router-dom";
import ScientificCalculator from "./components/Calculator";

const FormulaMaster = () => {
  return (
    <div className="page-container">
      <h1 className="page-heading">Formula Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Formula Master</span>
      </nav>

      <div className="card">
        <h2 className="card-title ">Formula Details</h2>
        <ScientificCalculator />
      </div>
    </div>
  );
};

export default FormulaMaster;
