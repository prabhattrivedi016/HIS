import InputField from "@/components/customInputField";
import { NavLink } from "react-router-dom";

const TemperatureRoom = () => {
  return (
    <div className="page-container">
      <h1 className="page-heading">Temperature Room</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Temperature Room</span>
      </nav>

      <div className="card">
        <form>
          <div className="form-grid-4">
            <InputField label="Temperature Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                // {...register("hospitalName")}
              />
              {/* {errors.hospitalName && (
                <p className="input-field-error">{errors.hospitalName.message}</p>
              )} */}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {"Save"}
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemperatureRoom;
