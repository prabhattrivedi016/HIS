import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { AllergySubTypeListTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { AllergySubMasterSchema } from "@/validation/allergyMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";

export const AllergyType = [
  { Id: 7, AllergyTypeName: "Chinese Food" },
  { Id: 1009, AllergyTypeName: "Contact" },
  { Id: 3, AllergyTypeName: "Drugs" },
  { Id: 5, AllergyTypeName: "Dry Foods" },
  { Id: 6, AllergyTypeName: "Dry Fruit" },
  { Id: 1007, AllergyTypeName: "DUST" },
  { Id: 1, AllergyTypeName: "Food" },
  { Id: 1008, AllergyTypeName: "Food - Veg" },
  { Id: 2, AllergyTypeName: "Inhalants" },
  { Id: 4, AllergyTypeName: "Milk Product" },
];

export const AllergySubTypeMasterList = [
  {
    Id: 4,
    AllergyTypeId: 7,
    AllergyTypeName: "Chinese Food",
    AllergySubTypeName: "Chowmeen",
    NormalRange: "<100g",
    BorderRange: "3-40",
    HighRange: ">100g",
    DefaultReading: "50",
    Unit: "kg",
    Description: "testing",
    IsActive: 1,
    AllergyImagePath: "D:/DMS-AllergyImages/0ID0TLHJ15202505161151282676.jpeg",
  },
  {
    Id: 1007,
    AllergyTypeId: 1009,
    AllergyTypeName: "Contact",
    AllergySubTypeName: "Ash",
    NormalRange: "<0.24",
    BorderRange: "0.24-0.30",
    HighRange: ">0.30",
    DefaultReading: "0.26",
    Unit: "IU/ml",
    Description: "Borderline allergic response to Ash",
    IsActive: 1,
    AllergyImagePath: "D:/DMS-AllergyImages/OIA8XA1XP6202506141259556107.png",
  },
  {
    Id: 1008,
    AllergyTypeId: 1009,
    AllergyTypeName: "Contact",
    AllergySubTypeName: "Cement",
    NormalRange: "<0.24",
    BorderRange: "0.24-0.30",
    HighRange: ">0.30",
    DefaultReading: "0.27",
    Unit: "IU/ml",
    Description: "Possible allergy to cement exposure",
    IsActive: 1,
    AllergyImagePath: "D:/DMS-AllergyImages/VGZQNQFN79202506141336036470.png",
  },
  {
    Id: 1,
    AllergyTypeId: 3,
    AllergyTypeName: "Drugs",
    AllergySubTypeName: "Sercy",
    NormalRange: "12",
    BorderRange: "12-34",
    HighRange: "34",
    DefaultReading: "14",
    Unit: "m/k",
    Description: "",
    IsActive: 1,
    AllergyImagePath: "F:/DMS-AllergyImages/60AVCAU4JU202412131152297894.jpeg",
  },
  {
    Id: 2,
    AllergyTypeId: 3,
    AllergyTypeName: "Drugs",
    AllergySubTypeName: "Deriye",
    NormalRange: ">0.33",
    BorderRange: "0.33-0.80",
    HighRange: "<0.80",
    DefaultReading: "0.5",
    Unit: "m/t",
    Description: "",
    IsActive: 1,
    AllergyImagePath: "F:/DMS-AllergyImages/AWBLJR4DOA202412131152426957.jpeg",
  },
];

const AllergyMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const {
    register,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AllergySubMasterSchema),
    mode: "onChange", // validate on each change
    reValidateMode: "onChange",
    defaultValues: {
      id: 0,
      allergyType: 0,
      allergySubTypeName: "",
      normalRange: "",
      borderRange: "",
      highRange: "",
      defaultReading: "",
      unit: "",
      document: null,
      description: "",
      isActive: 1,
    },
  });

  const isValue = Boolean(watch("allergyType"));
  const buttonTitle = isValue ? "Update" : "Create";

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  const editHandler = item => {
    reset({
      id: item?.Id || 0,
      allergyType: item?.AllergyTypeId || 0,
      allergySubTypeName: item?.AllergySubTypeName || "",
      normalRange: item?.NormalRange || "",
      borderRange: item?.BorderRange || "",
      highRange: item?.HighRange || "",
      defaultReading: item?.DefaultReading || "",
      unit: item?.Unit || "",
      document: item?.AllergyImagePath || null,
      description: item?.Description || "",
      isActive: item?.IsActive || 1,
    });
  };

  const onSubmit = (formData: any) => {
    console.log("Allergy Master submit", formData);
  };

  const documentRegister = register("document");

  return (
    <div className="page-container">
      <h1 className="page-heading">Allergy Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Allergy Master</span>
      </nav>

      {/* allergy sub type form data */}

      <div className="card mb-1">
        <h2 className="card-title ">Allergy Sub Type Details</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Allergy Type" required>
              <select className="input-field" {...register("allergyType", { valueAsNumber: true })}>
                <option value={0}>--Select--</option>
                {AllergyType.map(a => (
                  <option key={a?.Id} value={a?.Id}>
                    {a?.AllergyTypeName}
                  </option>
                ))}
              </select>
              {errors.allergyType && (
                <p className="input-field-error">{errors.allergyType.message}</p>
              )}
            </InputField>

            <InputField label="Allergy Sub Type Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter allergy sub type name "
                {...register("allergySubTypeName")}
              />
              {errors.allergySubTypeName && (
                <p className="input-field-error">{errors.allergySubTypeName.message}</p>
              )}
            </InputField>

            <InputField label="Normal Range" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter normal range "
                {...register("normalRange")}
              />
              {errors.normalRange && (
                <p className="input-field-error">{errors.normalRange.message}</p>
              )}
            </InputField>

            <InputField label="Border Range" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter border range "
                {...register("borderRange")}
              />
              {errors.borderRange && (
                <p className="input-field-error">{errors.borderRange.message}</p>
              )}
            </InputField>

            <InputField label="High Range" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter high range "
                {...register("highRange")}
              />
              {errors.highRange && <p className="input-field-error">{errors.highRange.message}</p>}
            </InputField>

            <InputField label="Default Reading">
              <input
                type="text"
                className="input-field"
                placeholder="Enter default reading "
                {...register("defaultReading")}
              />
              {errors.defaultReading && (
                <p className="input-field-error">{errors.defaultReading.message}</p>
              )}
            </InputField>

            <InputField label="Unit" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter unit "
                {...register("unit")}
              />
              {errors.unit && <p className="input-field-error">{errors.unit.message}</p>}
            </InputField>

            <InputField label="Upload Document" required>
              <input
                //   ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                //   onChange={inputHandler}
                className="file-upload"
                ref={documentRegister.ref}
                onBlur={documentRegister.onBlur}
                name={documentRegister.name}
                onChange={e => {
                  const file = e.target.files?.[0] ?? null;
                  setValue("document", file, { shouldValidate: true });
                }}
              />
              {errors.document && <p className="input-field-error">{errors.document.message}</p>}
            </InputField>

            <InputField label="Description">
              <textarea
                className="input-field"
                placeholder="write description here"
                rows={2}
                {...register("description")}
              />
              {errors.description && (
                <p className="input-field-error">{errors.description.message}</p>
              )}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Allergy Sub Type List</h2>

          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-60 lg:max-h-60">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {AllergySubTypeListTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {AllergySubTypeMasterList.length === 0 ? (
                      <tr>
                        <td colSpan={17} className="text-center py-6 text-gray-500">
                          No data found
                        </td>
                      </tr>
                    ) : (
                      AllergySubTypeMasterList.map((item, idx) => (
                        <tr key={idx} className="table-row">
                          <td className="table-td">{idx + 1}</td>
                          <td className="table-td">{item?.AllergyTypeName || "-"}</td>
                          <td className="table-td">{item?.AllergySubTypeName || "-"}</td>
                          <td className="table-td">{item?.NormalRange || "-"}</td>
                          <td className="table-td">{item?.BorderRange || "-"}</td>

                          <td className="table-td">{item?.HighRange || "-"}</td>
                          <td className="table-td">{item?.DefaultReading || "-"}</td>
                          <td className="table-td">{item?.Unit || "-"}</td>
                          <td className="table-td">
                            {<img src={item?.AllergyImagePath} alt="logo" />}
                          </td>
                          <td className="table-td">
                            {item?.IsActive === 1 ? "Active" : "Inactive"}
                          </td>

                          <td className="table-td cursor-pointer" onClick={() => editHandler(item)}>
                            <i className="fa-solid fa-edit icon-color-button"></i>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Animation>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default AllergyMaster;
