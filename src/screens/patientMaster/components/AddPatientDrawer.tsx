import InputField from "@/components/customInputField";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const AddPatientDrawer = ({ isOpen, onClose }) => {
  const currentDate = new Date().toISOString().split("T")[0];

  const webcamRef = useRef<Webcam | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [openCamera, setOpenCamera] = useState(false);

  // capture image
  const captureImage = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;
    setCapturedImage(screenshot);
    setOpenCamera(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setOpenCamera(false);
    }
  }, [isOpen]);
  return (
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div
          className={`drawer-layout lg:min-w-[1200px] drawer-bg ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="drawer-title-border">
            <h2 className="drawer-title">Add New Patient</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-1 p-1">
            {/* Form Section */}
            <div className="lg:col-span-4 bg-white shadow-md rounded-lg p-2 flex flex-col">
              <div className="form-grid-3 pb-4">
                <InputField label="UHID / Barcode">
                  <input
                    className="input-field"
                    placeholder="Enter UHID No and Press Enter to search"
                  />
                </InputField>

                <InputField label="Search By">
                  <select className="input-field">
                    <option>Select</option>
                    <option>Patient Id</option>
                    <option>UHID</option>
                    <option>Contact Number</option>
                    <option>Branch Id</option>
                  </select>
                </InputField>

                <InputField label="Search Value">
                  <input
                    className="input-field"
                    placeholder="Enter Search Value and Press Enter to search"
                  />
                </InputField>

                <div className="flex flex-row gap-2 w-full">
                  <InputField label="Title">
                    <select className="input-field ">
                      <option>Mr.</option>
                    </select>
                  </InputField>

                  <InputField label="First Name">
                    <input type="text" className="input-field " />
                  </InputField>
                </div>
                <InputField label="Middle Name">
                  <input type="text" className="input-field w-full" />
                </InputField>

                <InputField label="Last Name">
                  <input type="text" className="input-field w-full" />
                </InputField>

                <div className="flex flex-row gap-2 w-full">
                  <InputField label="Age (years)">
                    <input className="input-field" placeholder="year(s)" />
                  </InputField>

                  <InputField label="Months">
                    <input type="text" className="input-field " placeholder="month(s)" />
                  </InputField>

                  <InputField label="Days">
                    <input type="text" className="input-field " placeholder="day(s)" />
                  </InputField>
                </div>

                <InputField label="DOB">
                  <input
                    type="date"
                    className="input-field "
                    placeholder="day(s)"
                    max={currentDate}
                  />
                </InputField>

                <InputField label="Gender">
                  <input type="text" className="input-field " />
                </InputField>

                <InputField label="Marital Status">
                  <input type="text" className="input-field " />
                </InputField>

                <InputField label="Relation">
                  <input type="text" className="input-field " />
                </InputField>
                <InputField label="Relative Name">
                  <input type="text" className="input-field " placeholder="Enter relative name" />
                </InputField>

                <InputField label="Aadhar Number">
                  <input type="text" className="input-field " placeholder="Enter aadhar number" />
                </InputField>

                <InputField label="ID Proof Type">
                  <input type="text" className="input-field " />
                </InputField>

                <InputField label="ID proof number">
                  <input type="text" className="input-field " placeholder="Enter id proof number" />
                </InputField>

                <InputField label="Contact No (self)">
                  <input type="text" className="input-field " placeholder="Enter contact no" />
                </InputField>

                <InputField label="Emergency contact no">
                  <input
                    type="text"
                    className="input-field "
                    placeholder="Enter emergency contact"
                  />
                </InputField>

                <InputField label="Email">
                  <input type="email" className="input-field " placeholder="Enter email" />
                </InputField>

                <InputField label="ABHA No">
                  <input type="text" className="input-field " placeholder="Enter abha number" />
                </InputField>

                <InputField label="ABHA address">
                  <input type="text" className="input-field " placeholder="Enter abha address" />
                </InputField>

                <InputField label="Pincode">
                  <input type="text" className="input-field " placeholder="Enter pincode" />
                </InputField>

                <InputField label="Address">
                  <textarea className="input-field " placeholder="Enter address" rows={2} />
                </InputField>

                <InputField label="Country">
                  <input type="text" className="input-field " />
                </InputField>

                <InputField label="State">
                  <input type="text" className="input-field " />
                </InputField>

                <InputField label="District">
                  <input type="text" className="input-field " />
                </InputField>

                <InputField label="City">
                  <input type="text" className="input-field " />
                </InputField>

                <InputField label="Insurance Company">
                  <input type="text" className="input-field " />
                </InputField>

                <InputField label="Corporate">
                  <input type="text" className="input-field " />
                </InputField>

                <InputField label="Card/ Policy no">
                  <input
                    type="text"
                    className="input-field "
                    placeholder="Enter card or policy no"
                  />
                </InputField>

                <InputField label="Policy no">
                  <input type="text" className="input-field " placeholder="Enter policy number" />
                </InputField>
              </div>
            </div>

            {/* Image Section */}
            <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
              <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                {openCamera ? (
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full rounded-lg object-cover"
                    audio={false}
                  />
                ) : image ? (
                  <img
                    src={image}
                    alt="patient"
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="patient"
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}

                {!openCamera && (
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow hover:bg-blue-600"
                    onClick={() => setOpenCamera(true)}
                  >
                    <Camera size={18} />
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {openCamera && (
                  <button type="button" onClick={captureImage} className="save-btn">
                    Capture
                  </button>
                )}
                {!openCamera && capturedImage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImage(capturedImage)}
                      className="save-btn"
                    >
                      Save Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="cancel-button"
                    >
                      Discard
                    </button>
                  </>
                )}
                {!openCamera && image && (
                  <button type="button" onClick={() => setOpenCamera(true)} className="save-btn">
                    Retake
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-3 mb-4">Upload Patient Image</p>

              <div className="flex flex-col gap-2">
                <button className="save-btn">Patient Document</button>
                <button className="save-btn">CRM Patient</button>
                <button className="save-btn">Verify ABHA</button>
                <button className="save-btn">Create ABHA</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatientDrawer;
