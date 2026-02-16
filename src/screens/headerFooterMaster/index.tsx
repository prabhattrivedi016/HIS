import {
  ChangeEvent,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NavLink } from "react-router-dom";

import InputField from "../../components/customInputField";
import { ENDPOINTS } from "../../config/defaults";
import useGlobalApi from "../../hooks/useGlobalApi";

import DOMPurify from "dompurify";
import Select from "react-select";
import { SelectStyles } from "../../components/customSelect";
import {
  BranchId,
  DefaultRoleHeaderFooterMaster,
  HeaderFooterTabName,
  Status,
} from "../../constants/constants";
import useGetBranchList from "../../hooks/useGetBranchList";
import { usePickMaster } from "../../hooks/usePickMaster";
import DoctorSignature from "./components/DoctorSignature";
import LetterHead from "./components/LetterHead";
import ReportFooterRemark from "./components/ReportFooterRemark";
import SequenceMapping from "./components/SequenceMapping";
import {
  BranchItem,
  HeaderFooterFormData,
  ReportItem,
  RoleItem,
  SelectItem,
  VariableNameItem,
} from "./types";

const TextEditor = lazy(() => import("../../components/ckEditor"));

const HeaderFooterMaster = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<HeaderFooterTabName>(HeaderFooterTabName?.HEADER);
  const [selectedRole, setSelectedRole] = useState<SelectItem | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const roleSelectRef = useRef(null);

  const buttonTitle = isEditMode ? "Update" : "Create";

  /* -------------------- form state-------------------- */
  const [formData, setFormData] = useState<HeaderFooterFormData>({
    headerId: 0,
    roleId: Number(DefaultRoleHeaderFooterMaster?.DEFAULT) || 0,
    branchId: null,
    typeId: null,
    type: "",
    isHeader: Status.ACTIVE,
    headerBody: "",
    isActive: Status.ACTIVE,
  });

  /* -------------------- Branches -------------------- */
  const branchValues = useGetBranchList();
  const branches = useMemo<BranchItem[]>(
    () => branchValues?.branchList?.data ?? [],
    [branchValues]
  );

  /* set default branch once data arrives */
  useEffect(() => {
    if (!branches.length) return;

    const defaultBranch = branches?.find(b => b?.branchId === BranchId?.DEFAULT);
    if (defaultBranch && formData?.branchId === null) {
      setFormData(prev => ({
        ...prev,
        branchId: defaultBranch?.branchId,
      }));
    }
  }, [branches, formData?.branchId]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      headerBody: content,
    }));
  }, [content]);

  /* -------------------- header types -------------------- */
  const headerReportType = usePickMaster("headerReportType");

  const reportType = useMemo<ReportItem[]>(
    () => headerReportType?.pickMasterValue ?? [],
    [headerReportType]
  );

  /* -------------------- header variables -------------------- */
  const headerVariables = usePickMaster("headerVariable");

  const variableNames = useMemo<VariableNameItem[]>(
    () => headerVariables?.pickMasterValue ?? [],
    [headerVariables]
  );

  /* -------------------- roles -------------------- */
  const getRoles = useCallback(async () => {
    const resp = await fetchApi("GET", ENDPOINTS.ROLE_MASTER_LIST, {}, {});
    const activeRoles = resp?.data?.filter((r: RoleItem) => r.isActive === Status.ACTIVE) ?? [];
    setRoles(activeRoles);
  }, []);

  useEffect(() => {
    getRoles();
  }, [getRoles]);

  const roleSelectOption = useMemo(
    () => [
      { label: "Default", value: 0 },
      ...(roles?.map(r => ({
        label: r?.roleName,
        value: r?.roleId,
      })) ?? []),
    ],
    [roles]
  );

  /* -------------------- input handler -------------------- */

  const roleChangeHandler = (option: SelectItem | null) => {
    setSelectedRole(option);
    setFormData(prev => ({
      ...prev,
      roleId: option?.value ?? 0,
    }));
  };
  const inputHandler = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const target = e.target as HTMLSelectElement;
    const { name, value, selectedOptions } = target;

    setFormData(prev => {
      const updated: HeaderFooterFormData = {
        ...prev,
        [name]: Number.isNaN(Number(value)) ? value : Number(value),
      } as HeaderFooterFormData;

      if (name === "typeId") {
        updated.type = selectedOptions?.[0]?.dataset?.type ?? "";
      }

      return updated;
    });
  };

  /* -------------------- header variable -------------------- */
  const headerVariableHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariable(e.target.value);
  };

  /* -------------------- submit  handler -------------------- */
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitted(true);

    try {
      e.preventDefault();
      setSubmitLoading(true);
      setIsSubmitted(false);

      const sanitizedHtml = DOMPurify.sanitize(content);

      const payload = {
        ...formData,
        headerBody: sanitizedHtml,
      };

      const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_HEADER_MASTER, payload);
      if (!response) return;

      setContent("");
      roleSelectRef?.current?.clearValue();
      setSelectedRole(null);

      setFormData({
        headerId: 0,
        roleId: Number(DefaultRoleHeaderFooterMaster?.DEFAULT) || 0,
        branchId: null,
        typeId: null,
        type: "",
        isHeader: Status.ACTIVE,
        headerBody: content,
        isActive: Status.ACTIVE,
      });
    } catch (error) {
      setSubmitLoading(false);
      console.error("Error while submitting the header-footer-master-form", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  /* -------------------- pre filled data -------------------- */

  const getHeaderMaster = useCallback(async () => {
    if (!formData?.branchId || !formData?.roleId || !formData?.typeId) return;

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_HEADER_MASTER,
      {},
      {
        params: {
          branchId: formData.branchId,
          roleId: formData.roleId,
          typeId: formData.typeId,
          isHeader: formData.isHeader,
        },
      }
    );

    const data = response?.data?.[0];

    if (!data) {
      setIsEditMode(false);
      setContent("");
      setFormData(prev => ({
        ...prev,
        headerId: 0,
        headerBody: "",
        isActive: Status.ACTIVE,
      }));
      return;
    }

    setContent(data.headerBody);

    setFormData(prev => ({
      ...prev,
      headerId: data.headerId,
      headerBody: data.headerBody,
      isActive: data.isActive,
    }));
  }, [formData.branchId, formData.roleId, formData.typeId, formData.isHeader]);

  useEffect(() => {
    getHeaderMaster();
  }, [getHeaderMaster]);

  /*-------------------------cancel button handler------------------ */
  const cancelHandler = () => {
    setIsSubmitted(false);
    setContent("");

    setFormData({
      headerId: 0,
      roleId: Number(DefaultRoleHeaderFooterMaster?.DEFAULT) || 0,
      branchId: null,
      typeId: null,
      type: "",
      isHeader: Status.ACTIVE,
      headerBody: "",
      isActive: Status.ACTIVE,
    });
  };

  /*----------------------render component------------------------ */
  const renderComponent = (tabName: string) => {
    if (tabName === HeaderFooterTabName?.HEADER) {
      return (
        <div className="shadow-lg m-2 p-6 rounded-lg">
          <form onSubmit={submitHandler}>
            <h2 className="mb-4 text-xl font-semibold">Header Details</h2>

            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-1 lg:grid-cols-4 ">
              {/* Branch */}
              <InputField label="Branch" required>
                <select
                  name="branchId"
                  className="input-field"
                  onChange={inputHandler}
                  value={formData?.branchId ?? 0}
                >
                  <option value={0}>Default</option>
                  {branches?.map(b => (
                    <option key={b?.branchId} value={b?.branchId}>
                      {b?.branchName}
                    </option>
                  ))}
                </select>
              </InputField>

              {/* Header Type */}
              <InputField label="Header Type" required>
                <select
                  name="typeId"
                  className="input-field"
                  onChange={inputHandler}
                  value={formData?.typeId ?? 0}
                >
                  <option value={0}>Select</option>
                  {reportType?.map(h => (
                    <option key={h?.id} value={h?.key} data-type={h?.value}>
                      {h?.value}
                    </option>
                  ))}
                </select>

                {!formData?.typeId && isSubmitted && (
                  <p className="input-field-error">Header type is required</p>
                )}
              </InputField>

              <InputField label="Role">
                <Select
                  value={selectedRole}
                  options={roleSelectOption}
                  placeholder="Select..."
                  isSearchable
                  isClearable
                  onChange={roleChangeHandler}
                  styles={SelectStyles}
                  menuPortalTarget={document?.body}
                  menuPosition="fixed"
                />
              </InputField>

              {/* Header / Footer */}
              <InputField label="Type" required>
                <select
                  name="isHeader"
                  className="input-field"
                  onChange={inputHandler}
                  value={formData.isHeader}
                >
                  <option value={1}>Header</option>
                  <option value={0}>Footer</option>
                </select>
              </InputField>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Status */}
              <InputField label="Status" required>
                <select
                  name="isActive"
                  className="input-field"
                  onChange={inputHandler}
                  value={formData?.isActive}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </InputField>

              {/* Header Variable */}
              <InputField label="Header Variable">
                <select className="input-field" onChange={headerVariableHandler}>
                  <option value="">Select</option>
                  {variableNames.map(v => (
                    <option key={v?.id} value={v?.key}>
                      {v?.value}
                    </option>
                  ))}
                </select>
              </InputField>

              {/* Placeholder */}
              <InputField label="Variable Place Holder">
                <input
                  type="text"
                  value={selectedVariable}
                  onChange={e => setSelectedVariable(e.target.value)}
                  className="input-field"
                />
              </InputField>
              <div className="flex w-full gap-3 mt-5">
                <button type="submit" className="grid-active-btn">
                  {buttonTitle}
                </button>
                <button type="button" className="grid-edit-btn" onClick={cancelHandler}>
                  Cancel
                </button>
              </div>
            </div>
            <Suspense fallback={<p>Loading Editor</p>}>
              <TextEditor value={content} onChange={setContent} />
            </Suspense>
          </form>
        </div>
      );
    }

    if (tabName === HeaderFooterTabName?.SEQUENCE) return <SequenceMapping />;
    if (tabName === HeaderFooterTabName?.DOCTOR) return <DoctorSignature />;
    if (tabName === HeaderFooterTabName?.LETTER) return <LetterHead />;
    if (tabName === HeaderFooterTabName?.FOOTER_REMARK) return <ReportFooterRemark />;
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Lab Master</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Lab Master</span>
      </nav>

      <div className="tab-container rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.HEADER)}
          className={` tab-btn transition
                        ${
                          activeTab === HeaderFooterTabName?.HEADER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.HEADER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.SEQUENCE)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.SEQUENCE
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.SEQUENCE}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.DOCTOR)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.DOCTOR
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.DOCTOR}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.LETTER)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.LETTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.LETTER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.FOOTER_REMARK)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.FOOTER_REMARK
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.FOOTER_REMARK}
        </button>
      </div>

      {renderComponent(activeTab)}
    </div>
  );
};

export default HeaderFooterMaster;
