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
import CustomLoader from "../../components/customLoader";
import { SelectStyles } from "../../components/customSelect";
import {
  BranchId,
  DefaultRoleHeaderFooterMaster,
  HeaderFooterTabName,
  Status,
} from "../../constants/constants";
import useGetBranchList from "../../hooks/useGetBranchList";
import { usePickMaster } from "../../hooks/usePickMaster";
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

  const roleSelectRef = useRef(null);

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
  const headerReportType = usePickMaster({ fieldName: "headerReportType" });
  const reportType = useMemo<ReportItem[]>(
    () => headerReportType?.pickMasterValue?.data ?? [],
    [headerReportType]
  );

  /* -------------------- header variables -------------------- */
  const headerVariables = usePickMaster({ fieldName: "headerVariable" });
  const variableNames = useMemo<VariableNameItem[]>(
    () => headerVariables?.pickMasterValue?.data ?? [],
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

  const roleChangeHandler = (option: SelectItem) => {
    setFormData({
      ...formData,
      roleId: option?.value,
    });
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
    if (!formData?.roleId || !formData?.branchId || !formData?.typeId) return;

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_HEADER_MASTER,
      {},
      {
        params: {
          branchId: formData?.branchId,
          roleId: formData?.roleId,
          typeId: formData?.typeId,
          isHeader: formData?.isHeader,
        },
      }
    );

    if (!response) {
      setContent("");
      roleSelectRef?.current?.clearValue();
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
      return;
    }

    const data = response?.data?.[0] ?? [];
    setContent(data?.headerBody);

    setFormData({
      headerId: data?.headerId,
      roleId: formData?.roleId,
      branchId: formData?.branchId,
      typeId: formData?.typeId,
      type: formData?.type,
      isHeader: formData?.isHeader,
      headerBody: content,
      isActive: data?.isActive,
    });
  }, [formData?.branchId, formData?.roleId, formData?.typeId]);

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

  return (
    <div className="bg-gray-50 min-h-screen px-3 py-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Header Footer Master</h1>
        <nav className="text-sm text-gray-500 flex gap-2 mt-1">
          <NavLink to="/dashboard">Home</NavLink>
          <span>››</span>
          <span>Header Footer Master</span>
        </nav>
      </div>
      <div className="flex gap-2 border-b border-gray-200 mb-4 shadow-lg m-2 ">
        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.HEADER)}
          className={`px-4 py-2 text-md font-semibold transition
      ${
        activeTab === HeaderFooterTabName?.HEADER
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-500 hover:text-blue-600"
      }
    `}
        >
          {HeaderFooterTabName?.HEADER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.FOOTER)}
          className={`px-4 py-2 text-md font-semibold transition 
      ${
        activeTab === HeaderFooterTabName?.FOOTER
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-500 hover:text-blue-600"
      }
    `}
        >
          {HeaderFooterTabName?.FOOTER}
        </button>
      </div>

      {activeTab === HeaderFooterTabName.HEADER ? (
        <div className="shadow-lg m-2 p-6 rounded-lg">
          <form onSubmit={submitHandler}>
            <h2 className="mb-4 text-xl font-semibold">Header Details</h2>

            <div className="grid grid-cols-4 gap-4 mb-4">
              {/* Branch */}
              <InputField label="Branch" required>
                <select
                  name="branchId"
                  className="input-field"
                  onChange={inputHandler}
                  value={formData?.branchId ?? 0}
                >
                  <option value={0}>Select</option>
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
                  ref={roleSelectRef}
                  options={roleSelectOption}
                  placeholder="Select..."
                  isSearchable
                  isClearable
                  onChange={roleChangeHandler}
                  classNames={SelectStyles}
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

            <div className="grid grid-cols-4 gap-4 mb-4">
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
            </div>
            <Suspense fallback={<p>Loading Editor</p>}>
              <TextEditor value={content} onChange={setContent} />
            </Suspense>

            <div className="flex w-full gap-3 mt-5">
              <button type="submit" className="grid-active-btn">
                Submit
              </button>
              <button type="button" className="grid-edit-btn" onClick={cancelHandler}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <h1> this is the footer section</h1>
      )}

      {submitLoading && <CustomLoader isLoading={submitLoading} />}
    </div>
  );
};

export default HeaderFooterMaster;
