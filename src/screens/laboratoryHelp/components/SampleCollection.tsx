import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { Eye, File, MoreVertical, Plus, Printer } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { GroupedDataSampleManagement, SampleManagementItem, SampleTypeItem } from "../types";

const SampleCollection = ({
  isOpen,
  onClose,
  data,
  updatedSampleManagementList,
  viewMode,
  sampleType,
  refetchSampleManagement,
  handlePatientViewDetails,
  handleRejectSample,
  handlePrintClick,
  handleAddRemarkClick,
  handleUploadDocument,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: GroupedDataSampleManagement | null;
  updatedSampleManagementList: SampleManagementItem[];
  refetchSampleManagement?: () => Promise<void>;
  viewMode: "patient" | "sample" | "test";
  sampleType: SampleTypeItem[];
  handlePatientViewDetails?: (row: SampleManagementItem) => void;
  handleRejectSample?: (row: SampleManagementItem) => void;
  handlePrintClick?: (sampleId: number) => void;
  handleAddRemarkClick?: (row: SampleManagementItem) => void;
  handleUploadDocument?: (row: SampleManagementItem) => void;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [filteredData, setFilteredData] = useState<SampleManagementItem[]>([]);
  const [checkedSample, setCheckedSample] = useState<SampleManagementItem[]>([]);

  useEffect(() => {
    const selectedUHID = String(data?.UHID ?? "")
      .trim()
      .toLowerCase();

    if (!selectedUHID) {
      setFilteredData([]);
      return;
    }

    const filtered = updatedSampleManagementList.filter(row => {
      const rowUHID = String(row?.UHID ?? "")
        .trim()
        .toLowerCase();
      return viewMode === "sample"
        ? rowUHID === selectedUHID &&
            row?.LabNo === data?.LabNo &&
            row?.DefaultSampleTypeId === data?.DefaultSampleTypeId
        : viewMode === "patient"
          ? rowUHID === selectedUHID && row?.LabNo === data?.LabNo
          : false;
    });

    setFilteredData(filtered);
  }, [data, updatedSampleManagementList]);

  // handle select all
  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const updatedList = filteredData.map(item =>
      Number(item.IsSampleCollected) === 1 ? item : { ...item, isSampleSelected: isChecked }
    );
    setFilteredData(updatedList);
    setCheckedSample(
      isChecked ? updatedList.filter(item => Number(item.IsSampleCollected) !== 1) : []
    );
  };

  // handle row select
  const rowWiseCheckHandler = (e: ChangeEvent<HTMLInputElement>, row: SampleManagementItem) => {
    const isChecked = e.target.checked;

    const updatedList = filteredData.map(item =>
      Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
        ? {
            ...item,
            isSampleSelected: isChecked,
          }
        : item
    );
    setFilteredData(updatedList);

    if (isChecked) {
      const selectedItem = updatedList.find(
        item => Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
      ) || { ...row, isSampleSelected: true };
      setCheckedSample(prev => [
        ...prev.filter(
          x => Number(x.PatientInvestigationId) !== Number(row.PatientInvestigationId)
        ),
        selectedItem,
      ]);
    } else {
      setCheckedSample(prev =>
        prev.filter(x => Number(x.PatientInvestigationId) !== Number(row.PatientInvestigationId))
      );
    }
  };

  console.log("checkedSample", checkedSample);

  // Payload
  const generatePayload = () => {
    return {
      samples: checkedSample.map((c: SampleManagementItem) => ({
        patientInvestigationId: c.PatientInvestigationId,
        barCode: c.Barcode,
        sampleDateTime: new Date().toISOString(),
        statusId: 1,
        defaultSampleTypeId: c.DefaultSampleTypeId,
        labNo: c.LabNo,
      })),
    };
  };

  // handle sample collected
  const handleSampleCollectetion = async () => {
    if (checkedSample.length === 0) {
      showWarning("Please select at least one sample");
      return;
    }
    if (checkedSample.some(s => s?.DefaultSampleTypeId === null)) {
      showWarning("Please select sample type for all samples");
      return;
    }
    const paylaod = generatePayload();

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_SAMPLE_STATUS,
      paylaod,
      {},
      { component: "LabSampleManagement" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while collecting sample ");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    refetchSampleManagement?.();
  };

  if (!data) return;

  return (
    <CentralPopup
      title="Collect Sample"
      isOpen={isOpen}
      onClose={onClose}
      className="lg:min-w-[calc(100vw-2rem)]"
    >
      <>
        <div className="overflow-x-auto lg:max-h-186">
          <table className="w-full  table-fixed border-collapse text-left text-[10px] sm:text-[11px] ">
            <thead>
              <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
                <th className="w-[3%] border border-gray-300 px-1 py-2 text-center">
                  <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={
                      filteredData.some(item => Number(item.IsSampleCollected) !== 1) &&
                      filteredData
                        .filter(item => Number(item.IsSampleCollected) !== 1)
                        .every(item => Boolean(item.isSampleSelected))
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="w-[4%] border border-gray-300 py-2 px-1 text-center">#</th>

                <th className="w-[4%] border border-gray-300 py-2 text-center px-2">Bill Date</th>

                <th className="w-[2%] border border-gray-300 py-2 text-center px-2">Lab No</th>
                <th className="w-[4%] border border-gray-300 py-2 text-center px-2">Corporate</th>

                <th className="w-[8%] border border-gray-300 py-2 text-center px-2">Test(s)</th>
                <th className="w-[4%] border border-gray-300 py-2 text-center px-2">Sample Type</th>

                <th className="w-[4%] border border-gray-300 py-2 text-center px-2">Barcode</th>

                <th className="w-[4%] border border-gray-300 py-2 text-center px-2">
                  Collection Date
                </th>
                <th className="w-[4%] border border-gray-300 py-2 text-center px-2">
                  Received Date
                </th>
                <th className="w-[5%] border border-gray-300 py-2  text-center px-2">Priority</th>
                <th className="w-[5%] border border-gray-300 py-2  text-center px-2">Status</th>
                <th className="w-[5%] border border-gray-300 py-2  text-center px-2">
                  IPD No / Beds
                </th>
                <th className="w-[5%] border border-gray-300 py-2  text-center px-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {filteredData?.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="border border-gray-300 py-2 px-1 text-center text-gray-700"
                  >
                    No records found
                  </td>
                </tr>
              )}
              {filteredData.map((row: SampleManagementItem, idx: number) => (
                <tr
                  key={`${row?.LabNo}_${idx}`}
                  className="hover:bg-slate-50 transition-transform cursor-pointer"
                >
                  <td className="border border-gray-300 py-2 px-1 text-center">
                    <input
                      type="checkbox"
                      className="input-checkbox"
                      checked={Boolean(row?.isSampleSelected)}
                      onChange={e => rowWiseCheckHandler(e, row)}
                      disabled={Number(row?.IsSampleCollected) === 1}
                    />
                  </td>
                  <td className="border border-gray-300 py-2 px-1 font-bold text-gray-900 text-center">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-300 py-2 px-2 text-center">{row?.BillDate}</td>
                  <td className="border border-gray-300 py-2 px-2 text-center text-blue-600 font-bold">
                    {row?.LabNo}
                  </td>
                  <td className="border border-gray-300 py-2 px-2 text-center text-gray-800">
                    {row?.CorporateName || "-"}
                  </td>
                  <td className="border border-gray-300 py-2 px-2 text-center text-gray-800">
                    {row?.Name || "-"}
                  </td>
                  <td className="border border-gray-300 px-1 py-1 text-center">
                    <select
                      value={Number(row?.DefaultSampleTypeId || 0)}
                      className="input-field lg:h-8.5"
                      // onChange={e => sampleChangeHandlerRowWise(e, row)}
                      disabled={!!row?.isSampleRejected || !!row?.IsSampleCollected}
                    >
                      <option value={0}>Select</option>
                      {sampleType.map((item: SampleTypeItem) => (
                        <option key={item.sampleTypeId} value={item.sampleTypeId}>
                          {item.sampleType}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 px-1 py-1 text-center">
                    <input
                      className="input-field lg:h-8"
                      value={row?.Barcode}
                      disabled={
                        Number(row?.isSampleRejected) === 1 || Number(row?.IsSampleCollected) === 1
                        // Number(row?.IsDepartmentReceivingRequired) === 1 ||
                        // Number(row?.IsResultDone) === 1 ||
                        // Number(row?.IsReportApproved) === 1 ||
                        // Number(row?.IsDispatched) === 1
                      }
                      //   onChange={e => rowWiseBarcodeChangeHandler(e, row)}
                      maxLength={7}
                    />
                  </td>
                  <td className="border border-gray-300 text-center py-2 px-2 text-gray-900 font-bold">
                    {row?.SampleCollectedOn || "-"}
                  </td>
                  <td className="border border-gray-300 text-center py-2 px-2 text-gray-900 font-bold">
                    {row?.SampleReceivedByDepartmentOn || "-"}
                  </td>

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        Number(row?.isUrgent) === 1
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {Number(row?.isUrgent) === 1 ? "Urgent" : "Normal"}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {(() => {
                      const status =
                        Number(row?.isSampleRejected) === 1
                          ? { label: "Rejected", color: "bg-red-100 text-red-600" }
                          : Number(row?.IsReportHold) === 1
                            ? { label: "On Hold", color: "bg-orange-100 text-orange-700" }
                            : Number(row?.IsReportApproved) === 1
                              ? {
                                  label: "Approved",
                                  color: "bg-emerald-100 text-emerald-700",
                                }
                              : Number(row?.IsDispatched) === 1
                                ? {
                                    label: "Dispatched",
                                    color: "bg-purple-100 text-purple-700",
                                  }
                                : Number(row?.IsResultDone) === 1
                                  ? {
                                      label: "Report Generated",
                                      color: "bg-pink-100 text-pink-700",
                                    }
                                  : Number(row?.IsSampleReceivedByDepartment) === 1
                                    ? {
                                        label: "Received",
                                        color: "bg-cyan-100 text-blue-500",
                                      }
                                    : Number(row?.IsSampleCollected) === 1
                                      ? {
                                          label: "Collected",
                                          color: "bg-amber-100 text-amber-700",
                                        }
                                      : {
                                          label: "Pending",
                                          color: "bg-yellow-100 text-yellow-800",
                                        };

                      return (
                        <span
                          className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="border border-gray-300 text-center py-2 px-2 text-gray-900 font-bold">
                    {row?.IPDNo || "-"} / {row?.BedNo || "-"}
                  </td>
                  <td className="border border-gray-300 px-1 py-2 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handlePatientViewDetails(row)}
                        className="cursor-pointer p-1 text-gray-500 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectSample(row)}
                        className="cursor-pointer p-1 text-gray-500 hover:text-gray-800"
                        title="Reject Sample"
                      >
                        <MoreVertical size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintClick(row.sampleId)}
                        className="cursor-pointer p-1 text-gray-500 hover:text-emerald-600"
                        title="Print Sample"
                      >
                        <Printer size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddRemarkClick(row)}
                        className="cursor-pointer p-1 text-green-700 hover:text-emerald-600"
                        title="Add Remarks"
                      >
                        <Plus size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUploadDocument(row)}
                        className="cursor-pointer p-1 text-gray-500 hover:text-emerald-600"
                        title="Upload Document"
                      >
                        <File size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-end pt-4 mt-2 border-t border-gray-200 text-xs text-gray-500 gap-3">
          <div className="flex items-center  gap-3">
            {/* Barcode Radio Button */}
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
              <input
                type="radio"
                name="barcodeOption"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <span>Barcode</span>
            </label>

            {/* Print Button */}
            <button
              onClick={() => alert("Print clicked")}
              className="border border-blue-600 text-blue-600  text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Print
            </button>

            {/* Save Button */}
            <button
              onClick={handleSampleCollectetion}
              className="save-btn text-white !text-xs font-semibold !px-3 !py-1.5 ounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Collect Sample
            </button>
          </div>
          {loading && <CustomLoader isLoading={loading} />}
        </div>
      </>
    </CentralPopup>
  );
};

export default SampleCollection;
