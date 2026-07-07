import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { getDisabledStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SelectItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { DepartmentItem, DoctorItem } from "../../consultationHeaderMaster/types";
import { EmrSectionMappingTableItem } from "../types";

interface EmrSectionMappingPayload {
  typeId: number;
  typeName: string;
  relatedToId: number;
  headerMappingData: Array<{
    sectionId: number;
    sequenceNo: number;
  }>;
}

const DoctorDepartmentEmrSectionMapping = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [selectedType, setSelectedType] = useState<number>(1);

  const [selectedDoctor, setSelectedDoctor] = useState<SelectItem | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<SelectItem | null>(null);

  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());

  const [editableTableItem, setEditableTableItem] = useState<EmrSectionMappingTableItem[]>([]);

  const [draggedItem, setDraggedItem] = useState<EmrSectionMappingTableItem | null>(null);

  const getAllEmrSections = async (): Promise<EmrSectionMappingTableItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_EMR_SECTIONS,
      {},
      { params: { isActive: Status?.ACTIVE } },
      { component: "DoctorDepartmentEmrSectionMapping" }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(s => ({
      sectionId: s.SectionId,
      sectionName: s.SectionName,
      displayName: s.DisplayName,
      isActive: s.IsActive,
      mappingId: 0,
      sequenceNo: 0,
    }));
  };

  const { data: allEmrSections = [] } = useQuery<EmrSectionMappingTableItem[]>({
    queryKey: ["getAllEmrSectionsForMapping"],
    queryFn: getAllEmrSections,
  });

  useEffect(() => {
    setEditableTableItem(allEmrSections);
    setCheckedRows(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEmrSections]);

  const getDoctorsList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      { params: { isDoctorUnit: Status?.INACTIVE } },
      { component: "DoctorDepartmentEmrSectionMapping" }
    );
    return resp?.data;
  };

  const getDoctorDepartmentList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST,
      {},
      {},
      { component: "DoctorDepartmentEmrSectionMapping" }
    );
    return resp?.data;
  };

  const { data: doctorList = [] } = useQuery({
    queryKey: ["getDoctorList"],
    queryFn: getDoctorsList,
  });

  const { data: departmentList = [] } = useQuery({
    queryKey: ["doctorDepartmentList"],
    queryFn: getDoctorDepartmentList,
  });

  const doctorSelectOption = useMemo(
    () =>
      doctorList?.map((d: DoctorItem) => ({
        value: d?.doctorId,
        label: d?.completeName,
      })) ?? [],
    [doctorList]
  );

  const departmentSelectOption = useMemo(
    () =>
      departmentList?.map((d: DepartmentItem) => ({
        value: d?.departmentId,
        label: d?.department,
      })) ?? [],
    [departmentList]
  );

  const doctorSelectHandler = (option: SelectItem) => {
    if (!option) return;
    setSelectedDoctor(option);
  };

  const departmentSelectHandler = (option: SelectItem) => {
    if (!option) return;
    setSelectedDepartment(option);
  };

  const typeChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    setSelectedType(value);

    setSelectedDoctor(null);
    setSelectedDepartment(null);
  };

  const searchHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_EMR_SECTION_DEPARTMENT_MAPPING,
      {},
      {
        params: {
          typeId: selectedType,
          relatedToId: selectedType === 1 ? selectedDepartment?.value : selectedDoctor?.value,
        },
      },
      { component: "DoctorDepartmentEmrSectionMapping" }
    );

    const raw: any[] = resp?.data ?? [];

    const data: EmrSectionMappingTableItem[] = raw
      .map(m => ({
        sectionId: m.SectionId,
        sectionName: m.SectionName,
        displayName: m.DisplayName,
        isActive: 1,
        mappingId: m.MappingId,
        sequenceNo: m.SequenceNo,
      }))
      .sort((a, b) => a.sequenceNo - b.sequenceNo);

    setEditableTableItem(data);

    const preChecked = new Set<number>();

    data.forEach((item, idx) => {
      if (Number(item.mappingId) > 0) {
        preChecked.add(idx);
      }
    });

    setCheckedRows(preChecked);
  };

  const handleRowCheckbox = (index: number) => {
    setCheckedRows(prev => {
      const updated = new Set(prev);

      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }

      return updated;
    });
  };

  const handleHeaderCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCheckedRows(new Set(editableTableItem.map((_, idx) => idx)));
    } else {
      setCheckedRows(new Set());
    }
  };

  const isAllChecked =
    editableTableItem.length > 0 && checkedRows.size === editableTableItem.length;

  const handleDragStart = (item: EmrSectionMappingTableItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (!draggedItem) return;

    const draggedIndex = editableTableItem.findIndex(item => item === draggedItem);
    if (draggedIndex === index) return;

    const newItems = [...editableTableItem];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setEditableTableItem(newItems);
    setDraggedItem(null);
  };

  const createPayload = (): EmrSectionMappingPayload => {
    const checkedItems = editableTableItem.filter((_, idx) => checkedRows.has(idx));

    return {
      typeId: selectedType,

      typeName: selectedType === 1 ? "Department Wise" : "Doctor Wise",

      relatedToId:
        selectedType === 1 ? Number(selectedDepartment?.value) : Number(selectedDoctor?.value),

      headerMappingData: checkedItems.map((item, idx) => ({
        sectionId: item.sectionId,
        sequenceNo: idx + 1,
      })),
    };
  };

  const updateMappingMutation = useMutation({
    mutationFn: async (payload: EmrSectionMappingPayload) => {
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_EMR_SECTION_DEPARTMENT_MAPPING,
        payload,
        {},
        { component: "DoctorDepartmentEmrSectionMapping" }
      );
      return resp;
    },
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "failed to update mapping");
        return;
      }
      showSuccess(resp?.message ?? "Mapping updated successfully");
    },
    onError: error => {
      showError((error as any)?.message ?? "Error updating mapping");
    },
  });

  const handleUpdateMapping = () => {
    const payload = createPayload();

    updateMappingMutation.mutate(payload);
  };

  return (
    <>
      <div className="card mt-1">
        <form onSubmit={searchHandler}>
          <div className="form-grid-4">
            <InputField label="Type" required>
              <select className="input-field" value={selectedType} onChange={typeChangeHandler}>
                <option value={1}>Department Wise</option>
                <option value={2}>Doctor Wise</option>
              </select>
            </InputField>

            <InputField label="Department" required>
              <Select
                value={selectedDepartment}
                options={departmentSelectOption}
                placeholder="Select department"
                isSearchable
                isClearable
                isDisabled={selectedType === 2}
                onChange={option => departmentSelectHandler(option as unknown as SelectItem)}
                styles={getDisabledStyles(selectedType === 2)}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Doctor" required>
              <Select
                value={selectedDoctor}
                options={doctorSelectOption}
                placeholder="Select doctor"
                isSearchable
                isClearable
                isDisabled={selectedType === 1}
                onChange={option => doctorSelectHandler(option as unknown as SelectItem)}
                styles={getDisabledStyles(selectedType === 1)}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              search
            </button>
          </div>
        </form>
      </div>

      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title">Doctor Department EMR Section Mapping List</h2>
        </div>

        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-72 lg:max-h-72">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    <th className="table-th align-top">#</th>
                    <th className="table-th align-top">Section Name</th>
                    <th className="table-th align-top">Display Name</th>
                    <th className="table-th align-top">Status</th>
                    <th className="table-th align-top text-center">
                      <span className="flex flex-col items-center gap-1">
                        <input
                          type="checkbox"
                          className="input-checkbox"
                          checked={isAllChecked}
                          onChange={handleHeaderCheckbox}
                        />
                        Select
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {editableTableItem.length === 0 && (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {editableTableItem.map((item: EmrSectionMappingTableItem, idx: number) => (
                    <tr
                      key={idx}
                      className="table-row"
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      style={{
                        opacity: draggedItem === item ? 0.5 : 1,
                        cursor: "move",
                      }}
                    >
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td font-medium text-gray-800">{item?.sectionName}</td>
                      <td className="table-td">{item?.displayName || "-"}</td>
                      <td className="table-td">
                        <span
                          className={`card-status ${Number(item?.isActive) === 1 ? "active" : "inactive"}`}
                        >
                          {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="table-action text-center">
                        <input
                          type="checkbox"
                          className="input-checkbox"
                          checked={checkedRows.has(idx)}
                          onChange={() => handleRowCheckbox(idx)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="form-actions-responsive mt-5">
          <button
            type="button"
            className="save-btn"
            onClick={handleUpdateMapping}
            disabled={updateMappingMutation.isPending}
          >
            {updateMappingMutation.isPending ? "Updating..." : "Update mapping"}
          </button>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default DoctorDepartmentEmrSectionMapping;
