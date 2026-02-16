import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { handleMultiSelectWithAll } from "@/utils/multiSelectAllHandler";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import { SampleTypeItem, SelectItem, TestMethodItem } from "./types";

const LabInvestigationMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [testMethod, setTestMethod] = useState<TestMethodItem[]>([]);
  const [selectedTest, setSelectedTest] = useState<SelectItem | null>(null);
  const [sampleType, setSampleType] = useState<SampleTypeItem[]>([]);
  const [selectedSample, setSelectedSample] = useState<SelectItem[]>([]);

  const {
    setValue,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  });

  /*----------------sample volume --------------------*/

  const getSample = usePickMaster("testSampleVolume");
  const getSampleVolume = getSample?.pickMasterValue ?? [];

  /*-----------------lab report type------------- */
  const labReport = usePickMaster("labReportType");
  const labReportType = labReport?.pickMasterValue;

  /*---------------------test method--------------------- */
  const getLabMethod = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LAB_METHOD_MASTER,
      {},
      { params: { isActive: Status?.ACTIVE } },
      { component: "TestMethod" }
    );
    setTestMethod(resp?.data ?? []);
    console.log("resp", resp);
  };

  useEffect(() => {
    getLabMethod();
  }, []);

  const testMethodOption = useMemo(
    () =>
      testMethod.map(t => ({
        value: t?.methodId,
        label: t?.method,
      })),
    [testMethod]
  );

  const testMethodChangeHandler = (option: SelectItem) => {
    setSelectedTest(option);

    setValue("DepartmentId", option?.value ?? 0, {
      shouldValidate: true,
    });
    setValue("Department", option?.label ?? "", {
      shouldValidate: true,
    });
  };

  /*-------------------sample type----------------------- */
  const getAllSampleType = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_SAMPLE_TYPE_MASTER,
      {},
      {},
      { component: "SampleType", silent: true }
    );

    setSampleType(resp?.data ?? []);
  };

  useEffect(() => {
    getAllSampleType();
  }, []);

  const sampleTypeOption = useMemo<readonly SelectItem[]>(() => {
    return [
      { label: "All", value: 0 },
      ...sampleType.map(b => ({
        label: b?.sampleType,
        value: b?.sampleTypeId,
      })),
    ];
  }, [sampleType]);

  const sampleTypeChangeHandler = (options: SelectItem[]) => {
    const result = handleMultiSelectWithAll(options, selectedSample, sampleTypeOption);

    setSelectedSample(result?.selectedOptions || []);

    // optional if you want to store in form
    setValue(
      "sampleTypeIds",
      options?.map(o => o.value),
      { shouldValidate: true }
    );
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Lab Investigation Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Lab Investigation Master</span>
      </nav>

      <div className="card">
        <h2 className="card-title ">Investigation Details</h2>

        <form>
          <div className="form-grid-4">
            <InputField label="Category" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter category "
                {...register("hospitalName")}
              />
              {/* {errors.hospitalName && (
                <p className="input-field-error">{errors.hospitalName.message}</p>
              )} */}
            </InputField>

            <InputField label="Sub Category" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter sub category "
                {...register("hospitalCode")}
              />
              {/* {errors.hospitalCode && (
                <p className="input-field-error">{errors.hospitalCode.message}</p>
              )} */}
            </InputField>

            <InputField label="Sub Sub Category" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter sub sub category "
                {...register("website")}
              />
              {/* {errors.website && <p className="input-field-error">{errors.website.message}</p>} */}
            </InputField>

            <InputField label="Investigation Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter investigation name "
                {...register("email")}
              />
              {/* {errors.email && <p className="input-field-error">{errors.email.message}</p>} */}
            </InputField>

            <InputField label="Investigation Code" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter investigation code "
                {...register("contact1")}
              />
              {/* {errors.contact1 && <p className="input-field-error">{errors.contact1.message}</p>} */}
            </InputField>

            <InputField label="Short Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter short name "
                {...register("contact2")}
              />
              {/* {errors.contact2 && <p className="input-field-error">{errors.contact2.message}</p>} */}
            </InputField>

            <InputField label="Report Type" required>
              <select className="input-field">
                {labReportType.map(l => (
                  <option key={l?.key} value={l?.key}>
                    {l?.value}
                  </option>
                ))}
              </select>
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Test Method" required>
              <Select
                value={selectedTest}
                options={testMethodOption}
                placeholder="Select test method"
                isSearchable
                isClearable
                onChange={(option: any) => testMethodChangeHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Sample Type" required>
              <Select
                isMulti
                value={selectedSample}
                options={sampleTypeOption}
                placeholder="Select sample type"
                isSearchable
                isClearable
                onChange={(option: any) => sampleTypeChangeHandler(option)}
                components={{ Option: MultiCheckboxOption }}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />

              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Default Sample Type" required>
              <select className="input-field">
                {selectedSample
                  ?.filter(s => s.value !== 0)
                  .map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
              </select>
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Gender" required>
              {/* <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("address")}
              /> */}
              <select className="input-field" {...register("gender")}>
                <option>Both</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Department Receiving" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter department receiving "
                {...register("address")}
              />
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Sample Volume" required>
              {/* <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("address")}
              /> */}
              <select className="input-field">
                <option value="">Select</option>
                {getSampleVolume?.map(s => (
                  <option key={s?.key} value={s?.key}>
                    {s?.value}
                  </option>
                ))}
              </select>
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="TAT (in minute)" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                {...register("address")}
              />
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Out Sourced" required>
              <select className="input-field">
                <option>No</option>
                <option>Yes</option>
              </select>
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Print Separate" required>
              <select className="input-field">
                <option>Yes</option>
                <option>No</option>
              </select>
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Investigation Comment" required>
              <textarea
                className="input-field"
                placeholder="Enter investigation comment"
                rows={2}
                {...register("address")}
              />
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field">
                <option>Active</option>
                <option>Inactive</option>
              </select>
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
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

export default LabInvestigationMaster;
