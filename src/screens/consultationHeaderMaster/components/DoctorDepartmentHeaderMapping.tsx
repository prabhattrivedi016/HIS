import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { getDisabledStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { DoctorDepartmentMappingTableHeader, Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SelectItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Select from "react-select";
import { DepartmentItem, DoctorDepartmentTableItem, DoctorItem } from "../types";

interface HeaderMappingPayload {
  typeId: number;
  relatedToId: number;
  headerMappingData: Array<{
    typeId: number;
    typeName: string;
    headerId: number;
    relatedToId: number;
    sequenceNo: number;
  }>;
}

const DoctorDepartmentHeaderMapping = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [selectedType, setSelectedType] = useState<number>(1);

  const [selectedDoctor, setSelectedDoctor] = useState<SelectItem | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<SelectItem | null>(null);

  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());

  const [editableTableItem, setEditableTableItem] = useState<DoctorDepartmentTableItem[]>([]);

  const [draggedItem, setDraggedItem] = useState<DoctorDepartmentTableItem | null>(null);

  const [showTable, setShowTable] = useState<boolean>(false);

  const getDoctorsList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      { params: { isDoctorUnit: Status?.INACTIVE } },
      { component: "DoctorDepartmentHeaderMapping" }
    );
    return resp?.data;
  };

  const getDoctorDepartmentList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST,
      {},
      {},
      { component: "DoctorDepartmentHeaderMapping" }
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

  //
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

    // Clear previous selections
    setSelectedDoctor(null);
    setSelectedDepartment(null);
  };

  //   search handler
  const searchHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowTable(true);

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_HEADER_MAPPING_FOR_MASTER,
      {},
      {
        params: {
          typeId: selectedType,
          relatedToId: selectedType === 1 ? selectedDepartment?.value : selectedDoctor?.value,
        },
      },
      { component: "DoctorDepartmentHeaderMapping" }
    );

    const data = resp?.data ?? [];

    setEditableTableItem(data);

    const preChecked = new Set<number>();

    data.forEach((item: DoctorDepartmentTableItem, idx: number) => {
      if (Number(item.mappingId) > 0) {
        preChecked.add(idx);
      }
    });

    setCheckedRows(preChecked);
  };

  //   row check handler
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

  //   handler header checkbox
  const handleHeaderCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCheckedRows(new Set(editableTableItem.map((_, idx) => idx)));
    } else {
      setCheckedRows(new Set());
    }
  };

  const isAllChecked =
    editableTableItem.length > 0 && checkedRows.size === editableTableItem.length;

  // Drag and drop handlers
  const handleDragStart = (item: DoctorDepartmentTableItem) => {
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

  //   create payload
  const createPayload = (): HeaderMappingPayload => {
    const checkedItems = editableTableItem.filter((_, idx) => checkedRows.has(idx));

    return {
      typeId: selectedType,

      relatedToId:
        selectedType === 1 ? Number(selectedDepartment?.value) : Number(selectedDoctor?.value),

      headerMappingData: checkedItems.map((item, idx) => ({
        typeId: selectedType,

        typeName: selectedType === 1 ? "Department Wise" : "Doctor Wise",

        headerId: item.headerId,

        relatedToId:
          selectedType === 1 ? Number(selectedDepartment?.value) : Number(selectedDoctor?.value),

        sequenceNo: idx + 1,
      })),
    };
  };

  // Update mapping mutation
  const updateMappingMutation = useMutation({
    mutationFn: async (payload: HeaderMappingPayload) => {
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_DOCTOR_HEADER_DEPARTMENT_MAPPING,
        payload,
        {},
        { component: "DoctorDepartmentHeaderMapping" }
      );
      return resp;
    },
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "failed to update mapping");
        return;
      }
      showSuccess(resp?.message ?? "Mapping updated successfully");
      setShowTable(false);
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

      {/* table */}

      {!!showTable && (
        <div className="card mt-1">
          <div className="card-header">
            <h2 className="card-title ">Doctor Department Header Mapping List</h2>
          </div>

          <div className="table-container ">
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-72 lg:max-h-72 ">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {DoctorDepartmentMappingTableHeader.map((h, index) => (
                        <th key={index} className="table-th align-top">
                          {h === "Header Name" ? (
                            <span className="flex gap-2 items-center">
                              <input
                                type="checkbox"
                                className="input-checkbox"
                                checked={isAllChecked}
                                onChange={handleHeaderCheckbox}
                              />
                              {h}
                            </span>
                          ) : (
                            h
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {editableTableItem.length === 0 && (
                      <tr>
                        <td
                          colSpan={DoctorDepartmentMappingTableHeader.length}
                          className="table-empty"
                        >
                          No records found
                        </td>
                      </tr>
                    )}

                    {editableTableItem.map((item: DoctorDepartmentTableItem, idx: number) => (
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
                        <td className="table-td">
                          <span className="flex gap-2 items-center">
                            <input
                              type="checkbox"
                              className="input-checkbox"
                              checked={checkedRows.has(idx)}
                              onChange={() => handleRowCheckbox(idx)}
                            />
                            {item?.headerName}
                          </span>
                        </td>
                        <td className="table-td">{item?.displayName || "-"}</td>
                        <td className="table-td">{item?.controlType || "-"}</td>
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
      )}
      {!!loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default DoctorDepartmentHeaderMapping;
