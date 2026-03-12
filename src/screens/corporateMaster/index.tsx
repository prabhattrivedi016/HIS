import InputField from "@/components/customInputField";
import { type MouseEvent, useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import AddNewInsurance from "./components/AddNewInsurance";

const CorporateMaster = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const [openNewInsurance, setOpenNewInsurance] = useState<boolean>(false);

  const AddInsuranceHandler = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOpenNewInsurance(true);
  };

  const closeHandler = useCallback(() => {
    setOpenNewInsurance(false);
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-heading">Corporate Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Corporate Master</span>
      </nav>

      <div className="card mb-1">
        <h2 className="card-title ">Corporate Details</h2>

        <form>
          <div className="form-grid-4">
            <InputField label="Corporate Name" required>
              <input type="text" className="input-field" placeholder="Enter corporate name " />
            </InputField>

            <InputField label="Insurance Company" required>
              <div className="flex gap-2 items-center">
                <input type="text" className="input-field" placeholder="Enter insurance company " />

                <button className="-mt-2 active:scale-90" onClick={AddInsuranceHandler}>
                  <i className="fa-solid fa-circle-plus fa-xl "></i>
                </button>
              </div>
            </InputField>

            <InputField label="Corporate Code" required>
              <input type="text" className="input-field" placeholder="Enter corporate code " />
            </InputField>

            <InputField label="Contact Number 1" required>
              <input type="text" className="input-field" placeholder="Enter contact number 1 " />
            </InputField>

            <InputField label="Contact Number 2" required>
              <input type="text" className="input-field" placeholder="Enter contact number 2 " />
            </InputField>

            <InputField label="Email">
              <input type="text" className="input-field" placeholder="Enter email address" />
            </InputField>

            <InputField label="Address Line 1" required>
              <input type="text" className="input-field" placeholder="Enter address line 1" />
            </InputField>

            <InputField label="Address Line 2" required>
              <input type="text" className="input-field" placeholder="Enter address line 2 " />
            </InputField>

            <InputField label="Status" required>
              <select className="input-field">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </InputField>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="card-title ">Contract Details</h2>

        <form>
          <div className="form-grid-4">
            <InputField label="Start From" required>
              <input type="date" className="input-field" min={currentDate} value={currentDate} />
            </InputField>

            <InputField label="Expires On" required>
              <input type="date" className="input-field" min={currentDate} value={currentDate} />
            </InputField>

            <InputField label="Co-payment (%)" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                value={(0).toFixed(1)}
              />
            </InputField>

            <InputField label="Fixed Discount(Out Patient)(%)" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                value={(0).toFixed(1)}
              />
            </InputField>

            <InputField label="Fixed Discount(In Patient)(%)">
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                value={(0).toFixed(1)}
              />
            </InputField>

            <InputField label="Apply Hike On Rates(Out Patient)(%)" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                value={(0).toFixed(1)}
              />
            </InputField>

            <InputField label="Apply Hike On Rates(In Patient)(%)" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                value={(0).toFixed(1)}
              />
            </InputField>

            <InputField label="Follow Rate List(OPD)" required>
              <select className="input-field">
                <option value="0">Select</option>
                <option value="35">AA</option>
                <option value="14">Acko General Insurance Limited</option>
                <option value="9">Aditya Birla SunLife Insurance Company Limited</option>
                <option value="15">Agriculture Insurance Company of India Limited</option>
                <option value="16">Allianz General Insurance Company Limited</option>
                <option value="3">Assist Insurance TPA Private Limited</option>
                <option value="5">Axis Max Life Insurance Limited</option>
                <option value="2">AYUSHMAN BHARAT (PM-JAY)</option>
                <option value="37">AYUSMAN</option>
                <option value="12">Bajaj Allianz Life Insurance Company Limited</option>
                <option value="1">CASH</option>
                <option value="38">CGHS</option>
                <option value="17">Cholamandalam MS General Insurance Company Limited</option>
                <option value="20">Digit General Insurance Limited</option>
                <option value="18">ECGC Limited</option>
                <option value="28">Family Health Plan Insurance TPA Limited</option>
                <option value="19">Future Generali India Insurance Company Limited</option>
                <option value="32">Genins India Insurance TPA Limited</option>
                <option value="39">GRAVITY WEB SOLUTIONS</option>
                <option value="21">HDFC ERGO General Insurance Company Limited</option>
                <option value="6">HDFC Life Insurance Company Limited</option>
                <option value="33">Health India Insurance TPA Services Private Limited</option>
                <option value="27">Heritage Health Insurance TPA Private Limited</option>
                <option value="22">ICICI LOMBARD General Insurance Company Limited</option>
                <option value="7">ICICI Prudential Life Insurance Company Limited</option>
                <option value="23">IFFCO TOKIO General Insurance Company Limited</option>
                <option value="11">Insurance Company Limited</option>
                <option value="4">Life Insurance Corporation of India</option>
                <option value="8">Mahindra Life Insurance Company Limited</option>
                <option value="25">MDIndia Health Insurance TPA Private Limited</option>
                <option value="24">Medi Assist Insurance TPA Private Limited</option>
                <option value="31">Medsave Health Insurance TPA Limited</option>
                <option value="13">MetLife India Insurance Company Limited</option>
                <option value="36">OBSERVATION CHARGE</option>
                <option value="26">
                  Paramount Health Services &amp; Insurance TPA Private Limited
                </option>
                <option value="34">Star Health</option>
                <option value="10">TATA AIA Life Insurance Company Limited</option>
                <option value="29">Vidal Health Insurance TPA Private Limited</option>
                <option value="30">
                  Volo Health Insurance TPA Pvt. Ltd ( Formerly East West Assist Insurance TPA
                  Private Limited)
                </option>
              </select>
            </InputField>

            <InputField label="Follow Rate List(IPD)*" required>
              <select className="input-field">
                <option value="0">Select</option>
                <option value="35">AA</option>
                <option value="14">Acko General Insurance Limited</option>
                <option value="9">Aditya Birla SunLife Insurance Company Limited</option>
                <option value="15">Agriculture Insurance Company of India Limited</option>
                <option value="16">Allianz General Insurance Company Limited</option>
                <option value="3">Assist Insurance TPA Private Limited</option>
                <option value="5">Axis Max Life Insurance Limited</option>
                <option value="2">AYUSHMAN BHARAT (PM-JAY)</option>
                <option value="37">AYUSMAN</option>
                <option value="12">Bajaj Allianz Life Insurance Company Limited</option>
                <option value="1">CASH</option>
                <option value="38">CGHS</option>
                <option value="17">Cholamandalam MS General Insurance Company Limited</option>
                <option value="20">Digit General Insurance Limited</option>
                <option value="18">ECGC Limited</option>
                <option value="28">Family Health Plan Insurance TPA Limited</option>
                <option value="19">Future Generali India Insurance Company Limited</option>
                <option value="32">Genins India Insurance TPA Limited</option>
                <option value="39">GRAVITY WEB SOLUTIONS</option>
                <option value="21">HDFC ERGO General Insurance Company Limited</option>
                <option value="6">HDFC Life Insurance Company Limited</option>
                <option value="33">Health India Insurance TPA Services Private Limited</option>
                <option value="27">Heritage Health Insurance TPA Private Limited</option>
                <option value="22">ICICI LOMBARD General Insurance Company Limited</option>
                <option value="7">ICICI Prudential Life Insurance Company Limited</option>
                <option value="23">IFFCO TOKIO General Insurance Company Limited</option>
                <option value="11">Insurance Company Limited</option>
                <option value="4">Life Insurance Corporation of India</option>
                <option value="8">Mahindra Life Insurance Company Limited</option>
                <option value="25">MDIndia Health Insurance TPA Private Limited</option>
                <option value="24">Medi Assist Insurance TPA Private Limited</option>
                <option value="31">Medsave Health Insurance TPA Limited</option>
                <option value="13">MetLife India Insurance Company Limited</option>
                <option value="36">OBSERVATION CHARGE</option>
                <option value="26">
                  Paramount Health Services &amp; Insurance TPA Private Limited
                </option>
                <option value="34">Star Health</option>
                <option value="10">TATA AIA Life Insurance Company Limited</option>
                <option value="29">Vidal Health Insurance TPA Private Limited</option>
                <option value="30">
                  Volo Health Insurance TPA Pvt. Ltd ( Formerly East West Assist Insurance TPA
                  Private Limited)
                </option>
              </select>
            </InputField>
            <InputField label="Allowed Payment Modes" required>
              <input type="text" className="input-field" placeholder="Enter contact number " />
            </InputField>
            <InputField label="Active in Branches" required>
              <input type="text" className="input-field" placeholder="Enter contact number " />
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

      {/* render new insurance */}
      <AddNewInsurance isOpen={openNewInsurance} onClose={closeHandler} />
    </div>
  );
};

export default CorporateMaster;
