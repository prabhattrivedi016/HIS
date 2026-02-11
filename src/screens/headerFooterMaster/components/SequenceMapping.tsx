import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { SelectStyles } from "../../../components/customSelect";
import { ENDPOINTS } from "../../../config/defaults";
import { sequenceBranchMasterHeader, Status } from "../../../constants/constants";
import useGetBranchList from "../../../hooks/useGetBranchList";
import useGlobalApi from "../../../hooks/useGlobalApi";
import {
  RoleItem,
  SelectItem,
  SequenceDropDownItem,
  SequenceEditItem,
  SequenceMappingItem,
  SequenceTypeItem,
} from "../types";
import SequenceDrawer from "./SequenceDrawer";

const SequenceMapping = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [typeId, setTypeId] = useState<number | null>(null);
  const [typeName, setTypeName] = useState<string>("");
  const [sequenceId, setSequenceId] = useState<number | null | string>(null);

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<SelectItem | null>(null);
  const [selectedSequenceType, setSelectedSequenceType] = useState<SelectItem | null>(null);
  const [sequenceTypeList, setSequenceTypeList] = useState<SequenceTypeItem[]>([]);
  const [sequenceDropDown, setSequenceDropDown] = useState<SequenceDropDownItem[]>([]);
  const [sequenceMapping, setSequenceMapping] = useState<SequenceMappingItem[]>([]);
  const [filteredData, setFilteredData] = useState<SequenceMappingItem[]>([]);

  const [sequenceToEdit, setSequenceToEdit] = useState<SequenceEditItem | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const showDetailPopUpHandler = () => {
    setShowDetails(prev => !prev);
  };

  const [formData, setFormData] = useState({
    mappingId: 0,
    branchId: 0,
    roleId: 0,
    typeId: 0,
    sequenceId: 0,
  });

  const isEditMode = formData?.mappingId !== 0 ? "edit" : "create";

  const buttonTitle = isEditMode === "edit" ? "Update" : "Create";
  /*----------------------branch lists------------------------ */
  const branchList = useGetBranchList();

  const branches = useMemo(() => branchList?.branchList?.data, [branchList]);

  const inputChangeHandler = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  /*-------------------roles------------------------ */
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

  const roleSelectHandler = (option: SelectItem) => {
    setSelectedRole(option);

    setFormData(prev => ({
      ...prev,
      roleId: option?.value ?? 0,
    }));
  };

  /*----------------------------sequence type------------------------------ */
  const getSequenceType = useCallback(async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_SEQUENCE_TYPE_LIST, {}, {});

    setSequenceTypeList(resp?.data ?? []);
  }, []);

  const selectSequenceOption = useMemo(
    () =>
      sequenceTypeList?.map(s => ({
        value: s?.typeId,
        label: s?.typeName,
      })),
    [sequenceTypeList]
  );

  const sequenceTypeChangeHandler = (option: SelectItem | null) => {
    setSelectedSequenceType(option);
    setTypeId(option?.value ?? null);
    setTypeName(option?.label ?? "");

    setFormData(prev => ({
      ...prev,
      typeId: option?.value ?? 0,
    }));
  };

  /*-------------------------sequence master--------------- */
  const fetchSequenceMaster = useCallback(async (id: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SEQUENCE_MASTER,
      {},
      {
        params: { sequenceTypeId: id },
      }
    );

    setSequenceDropDown(resp?.data ?? []);
  }, []);

  useEffect(() => {
    getSequenceType();
    if (typeId) {
      fetchSequenceMaster(typeId);
    }
  }, [typeId]);

  /*-------------------- */
  const sequenceChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSequenceId(id);
    setFormData(prev => ({
      ...prev,
      sequenceId: id,
    }));
    const editableSequence = sequenceDropDown.find(v => v.sequenceId === id);

    if (editableSequence) {
      setSequenceToEdit(editableSequence);
    }
  };

  /*-----------------------------submit handler------------------------- */
  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeId || !sequenceId) return;

    const payload = {
      ...formData,
    };
    const resp = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_BRANCH_SEQUENCE_MAPPING, payload);
    if (!resp) return;
    setSuccessMessage(resp?.message);
    setFormData({
      mappingId: 0,
      branchId: 0,
      roleId: 0,
      typeId: 0,
      sequenceId: 0,
    });
    getBranchSequence();
    setSelectedRole(null);
    setSelectedSequenceType(null);
    setSequenceId("");
  };

  /*---------------------get all branch sequence------------------------ */

  const getBranchSequence = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_BRANCH_SEQUENCE_MAPPING, {}, {});
    setSequenceMapping(resp?.data ?? []);
    setFilteredData(resp?.data ?? []);
  };

  useEffect(() => {
    getBranchSequence();
  }, []);

  const handleAddSequence = () => {
    if (!typeId) return;

    if (!sequenceToEdit || !sequenceToEdit?.sequenceId) {
      setSequenceToEdit({
        typeId,
        typeName,
      });
    }

    setOpenDrawer(true);
  };

  const closeHandler = () => [setOpenDrawer(false)];

  /*--------------------------edit handler--------------------------- */
  const sequenceEditHandler = (item: SequenceMappingItem) => {
    if (!item) return;

    setFormData({
      mappingId: item.mappingId,
      branchId: item.branchId,
      roleId: item.roleId,
      typeId: item.typeId,
      sequenceId: item.sequenceId,
    });

    const roleOption = roleSelectOption.find(opt => opt.value === item.roleId);
    setSelectedRole(roleOption ?? null);

    const typeOption = selectSequenceOption.find(opt => opt.value === item.typeId);

    setSelectedSequenceType(typeOption ?? null);
    setTypeId(item.typeId);
    setTypeName(typeOption?.label ?? "");

    setSequenceId(item.sequenceId);
  };

  return (
    <>
      <div className="shadow-lg m-2 p-6 rounded-lg">
        <h2 className="mb-4 text-xl font-semibold">Sequence Mapping </h2>
        <form onSubmit={submitHandler}>
          <div className="form-grid-4">
            <InputField label="Branch" required>
              <select
                name="branchId"
                className="input-field"
                onChange={inputChangeHandler}
                value={formData?.branchId}
              >
                <option value={0}>Default</option>
                {branches?.map(b => (
                  <option key={b?.branchId} value={b?.branchId}>
                    {b?.branchName}
                  </option>
                ))}
              </select>
            </InputField>

            {/* Role */}
            <InputField label="Role" required={false}>
              <Select
                value={selectedRole}
                options={roleSelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={roleSelectHandler}
                styles={SelectStyles}
                menuPortalTarget={document?.body}
                menuPosition="fixed"
              />
            </InputField>

            {/*  type id */}
            <InputField label="Sequence Type" required={false}>
              <Select
                value={selectedSequenceType}
                options={selectSequenceOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={sequenceTypeChangeHandler}
                styles={SelectStyles}
                menuPortalTarget={document?.body}
                menuPosition="fixed"
              />
            </InputField>

            {/* sequence id*/}
            <div className="flex flex-row gap-2 items-end w-full">
              <InputField label="Sequence" className="w-full" required={false}>
                <div className="flex items-center gap-2">
                  <select
                    name="sequence"
                    className="input-field"
                    onChange={sequenceChangeHandler}
                    value={sequenceId}
                  >
                    <option value="">Select</option>
                    {sequenceDropDown?.map((v: SequenceDropDownItem) => (
                      <option key={v?.typeId} value={v?.sequenceId}>
                        {v?.preview}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddSequence}
                    title="Add Sequence"
                    className="scale-95"
                  >
                    <i className="fa-solid fa-circle-plus fa-xl  "></i>
                  </button>
                </div>
              </InputField>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="submit"
              className="bg-[#0b5394] rounded-lg text-white text-lg min-w-20 h-10  px-0 py-0"
            >
              {buttonTitle}
            </button>
          </div>
        </form>
        {/* -----------------drawer for add & update sequence----------------- */}
        {openDrawer && sequenceToEdit && (
          <SequenceDrawer data={sequenceToEdit} onClose={closeHandler} />
        )}
      </div>
      {/* sequence branch mapping table data */}
      <div className="shadow-lg m-2 p-6 rounded-lg bg-white overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Sequence Master List</h2>

          <button
            className="border border-gray-500 bg-[#1e6da1] rounded-lg text-white px-4 py-2 active:scale-95"
            onClick={showDetailPopUpHandler}
          >
            {showDetails ? "Hide" : "Show"}
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="max-w-290 w-full   rounded-xl shadow-lg border border-gray-200 mt-4 overflow-hidden bg-white">
                {/* table scroll container */}
                <div className="max-h-80 overflow-auto">
                  {/* <table className="min-w-[1400px] w-full border-collapse text-sm"> */}
                  <table className="w-full border-collapse text-sm">
                    {/* TABLE HEADER */}
                    <thead className="bg-[#f5f9ff] sticky top-0 z-10">
                      <tr>
                        {sequenceBranchMasterHeader.map((h, index) => (
                          <th
                            key={index}
                            className="px-2 py-3 text-left font-semibold text-gray-900 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody>
                      {sequenceMapping.map((item, idx) => (
                        <tr
                          key={item?.mappingId}
                          className="hover:bg-gray-150 transition last:border-none"
                        >
                          <td className="px-2 py-3 text-gray-500">{idx + 1}</td>

                          <td className="px-1 py-3 text-gray-500">{item?.branchName}</td>

                          <td className="px-1 py-3 text-gray-500">{item?.roleName}</td>

                          <td className="px-2 py-3 text-gray-500 ">{item?.typeName}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.sequencePreview}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.createdBy}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.createdOn}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.lastModifiedBy}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.lastModifiedOn}</td>

                          <td
                            className="px-2 py-3 text-blue-500"
                            onClick={() => sequenceEditHandler(item)}
                          >
                            <i className="fa-edit fa-solid"></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? <CustomLoader isLoading={loading} /> : <></>}
      </div>
    </>
  );
};

export default SequenceMapping;
