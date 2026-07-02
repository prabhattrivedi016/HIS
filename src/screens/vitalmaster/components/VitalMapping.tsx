import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { getDisabledStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SelectItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Select from "react-select";

interface DoctorItem {
  doctorId: number;
  completeName: string;
}

interface DepartmentItem {
  departmentId: number;
  department: string;
}

interface VitalMappingItem {
  MappingId: number;
  VitalId: number;
  VitalName: string;
  MinValue: string;
  MaxValue: string;
  unitName: string;
  SequenceNo: number;
}

interface VitalMappingPayload {
  typeId: number;
  typeName: string;
  relatedToId: number;
  headerMappingData: Array<{
    vitalId: number;
    sequenceNo: number;
  }>;
}

const tableHeaders = ["#", "Vital Name", "Unit", "Min Range", "Max Range"];

const VitalMapping = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [selectedType, setSelectedType] = useState<number>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<SelectItem | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<SelectItem | null>(null);

  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [tableItems, setTableItems] = useState<VitalMappingItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<VitalMappingItem | null>(null);
  const [showTable, setShowTable] = useState<boolean>(false);

  /* ── Fetch lists ── */
  const getDoctorsList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      { params: { isDoctorUnit: Status?.INACTIVE } },
      { component: "VitalMapping" }
    );
    return resp?.data;
  };

  const getDepartmentList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST,
      {},
      {},
      { component: "VitalMapping" }
    );
    return resp?.data;
  };

  const { data: doctorList = [] } = useQuery({
    queryKey: ["vitalMappingDoctorList"],
    queryFn: getDoctorsList,
  });

  const { data: departmentList = [] } = useQuery({
    queryKey: ["vitalMappingDepartmentList"],
    queryFn: getDepartmentList,
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

  /* ── Handlers ── */
  const typeChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(Number(e.target.value));
    setSelectedDoctor(null);
    setSelectedDepartment(null);
    setShowTable(false);
    setTableItems([]);
    setCheckedRows(new Set());
  };

  const searchHandler = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setShowTable(true);

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_VITAL_MAPPING_LIST,
      {},
      {
        params: {
          typeId: selectedType,
          relatedToId:
            selectedType === 1 ? selectedDepartment?.value : selectedDoctor?.value,
        },
      },
      { component: "VitalMapping" }
    );

    const data: VitalMappingItem[] = resp?.data ?? [];
    setTableItems(data);

    const preChecked = new Set<number>();
    data.forEach((item, idx) => {
      if (Number(item.MappingId) > 0) preChecked.add(idx);
    });
    setCheckedRows(preChecked);
  };

  const handleRowCheckbox = (index: number) => {
    setCheckedRows((prev) => {
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
      setCheckedRows(new Set(tableItems.map((_, idx) => idx)));
    } else {
      setCheckedRows(new Set());
    }
  };

  const isAllChecked =
    tableItems.length > 0 && checkedRows.size === tableItems.length;

  /* ── Drag & drop ── */
  const handleDragStart = (item: VitalMappingItem) => setDraggedItem(item);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (!draggedItem) return;
    const draggedIndex = tableItems.findIndex((item) => item === draggedItem);
    if (draggedIndex === index) return;
    const newItems = [...tableItems];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setTableItems(newItems);
    setDraggedItem(null);
  };

  /* ── Payload ── */
  const createPayload = (): VitalMappingPayload => {
    const checkedItems = tableItems.filter((_, idx) => checkedRows.has(idx));
    const relatedToId =
      selectedType === 1
        ? Number(selectedDepartment?.value)
        : Number(selectedDoctor?.value);

    const typeName = selectedType === 1 ? "Department Wise" : "Doctor Wise";
    return {
      typeId: selectedType,
      typeName,
      relatedToId,
      headerMappingData: checkedItems.map((item, idx) => ({
        vitalId: item.VitalId,
        sequenceNo: idx + 1,
      })),
    };
  };

  /* ── Save mutation ── */
  const saveMappingMutation = useMutation({
    mutationFn: async (payload: VitalMappingPayload) => {
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_VITAL_MAPPING,
        payload,
        {},
        { component: "VitalMapping" }
      );
      return resp;
    },
    onSuccess: (resp) => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Failed to update mapping");
        return;
      }
      showSuccess(resp?.message ?? "Mapping updated successfully");
      setShowTable(false);
      setTableItems([]);
      setCheckedRows(new Set());
    },
    onError: (error: any) => {
      showError(error?.message ?? "Error updating mapping");
    },
  });

  const handleSaveMapping = () => saveMappingMutation.mutate(createPayload());

  return (
    <>
      {/* ── SEARCH FORM ── */}
      <div className="card mt-1">
        <form onSubmit={searchHandler}>
          <div className="form-grid-4">
            {/* Type */}
            <InputField label="Type" required>
              <select
                className="input-field"
                value={selectedType}
                onChange={typeChangeHandler}
              >
                <option value={1}>Department Wise</option>
                <option value={2}>Doctor Wise</option>
              </select>
            </InputField>

            {/* Department */}
            <InputField label="Department" required>
              <Select
                value={selectedDepartment}
                options={departmentSelectOption}
                placeholder="Select department"
                isSearchable
                isClearable
                isDisabled={selectedType === 2}
                onChange={(option) =>
                  setSelectedDepartment(option as unknown as SelectItem)
                }
                styles={getDisabledStyles(selectedType === 2)}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            {/* Doctor */}
            <InputField label="Doctor" required>
              <Select
                value={selectedDoctor}
                options={doctorSelectOption}
                placeholder="Select doctor"
                isSearchable
                isClearable
                isDisabled={selectedType === 1}
                onChange={(option) =>
                  setSelectedDoctor(option as unknown as SelectItem)
                }
                styles={getDisabledStyles(selectedType === 1)}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ── MAPPING TABLE ── */}
      {!!showTable && (
        <div className="card mt-1">
          <div className="card-header">
            <h2 className="card-title">Vital Mapping List</h2>
          </div>

          <div className="table-container">
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-72 lg:max-h-72">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {tableHeaders.map((h, index) => (
                        <th key={index} className="table-th align-top">
                          {h === "Vital Name" ? (
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
                    {tableItems.length === 0 ? (
                      <tr>
                        <td colSpan={tableHeaders.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      tableItems.map((item, idx) => (
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
                              {item.VitalName}
                            </span>
                          </td>
                          <td className="table-td">{item.unitName || "-"}</td>
                          <td className="table-td">{item.MinValue ?? "-"}</td>
                          <td className="table-td">{item.MaxValue ?? "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="form-actions-responsive mt-5">
            <button
              type="button"
              className="save-btn"
              onClick={handleSaveMapping}
              disabled={saveMappingMutation.isPending}
            >
              {saveMappingMutation.isPending ? "Saving…" : "Save Mapping"}
            </button>
          </div>
        </div>
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default VitalMapping;
