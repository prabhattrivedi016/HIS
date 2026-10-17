import CustomBarcode from "@/components/customBarcode";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { encryptRouteId } from "@/utils/routeEncryption";
import { Eye, File, MoreVertical, Plus, Printer } from "lucide-react";
import { ChangeEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SampleManagementItem, SampleTypeItem } from "../types";
import AddRemarkPopup from "./AddRemarkPopup";
import RejectSamplePopup from "./RejectSamplePopup";
import UploadDocument from "./UploadDocument";

export default function TableData({
  onNavigate,
  updatedSampleManagementList,
  setUpdatedSampleManagementList,
  sampleType,
  refetchSampleManagement,
}: {
  onNavigate?: (id: any) => void;
  updatedSampleManagementList: SampleManagementItem[];
  setUpdatedSampleManagementList: (data: SampleManagementItem[]) => void;
  sampleType: SampleTypeItem[];
  refetchSampleManagement?: () => Promise<void>;
}) {
  const { loading, fetchApi } = useGlobalApi();
  const navigate = useNavigate();
  const [checkedSample, setCheckedSample] = useState<SampleManagementItem[]>([]);
  const [selectedSampleData, setSelelectedSampleData] = useState<SampleManagementItem | null>(null);

  const [renderAddRemarks, setRenderAddRemarks] = useState<boolean>(false);
  const [openAddRemarks, setOpenAddRemarks] = useState<boolean>(false);

  const [renderRejectSample, setRenderRejectSample] = useState<boolean>(false);
  const [openRejectSample, setOpenRejectSample] = useState<boolean>(false);

  const [renderUploadDocument, setRenderUploadDocument] = useState<boolean>(false);
  const [openUploadDocument, setOpenUploadDocument] = useState<boolean>(false);

  // patient view details
  const handlePatientViewDetails = (row: SampleManagementItem) => {
    if (!row) return;
    const encryptedId = encryptRouteId(row.PatientInvestigationId);
    navigate(`/sample-journey/${encryptedId}`);
  };

  // reject sample
  const handleRejectSample = (row: SampleManagementItem) => {
    if (!row) {
      setSelelectedSampleData(null);
      setOpenRejectSample(false);
      setRenderRejectSample(false);
      return;
    }
    if (Number(row?.isSampleRejected) === 1) {
      showWarning("This sample is already rejected");
      return;
    }
    setOpenRejectSample(true);
    setRenderRejectSample(true);
    setSelelectedSampleData(row);
  };

  // clsoe reject sample
  const closeRejectSample = useCallback(() => {
    setOpenRejectSample(false);
    setRenderRejectSample(false);
    setSelelectedSampleData(null);
  }, []);

  const handlePrintClick = sampleId => {
    alert(`Print clicked for sample: ${sampleId}`);
  };

  const handleAttachClick = sampleId => {
    alert(`Attach clicked for sample: ${sampleId}`);
  };

  // handle upload document
  const handleUploadDocument = (row: SampleManagementItem) => {
    if (!row) {
      setSelelectedSampleData(null);
      setOpenUploadDocument(false);
      setRenderUploadDocument(false);
      return;
    }
    setOpenUploadDocument(true);
    setRenderUploadDocument(true);
    setSelelectedSampleData(row);
  };

  // clsoe upload document
  const closeUploadDocument = useCallback(() => {
    setOpenUploadDocument(false);
    setRenderUploadDocument(false);
    setSelelectedSampleData(null);
  }, []);

  // add remark
  const handleAddRemarkClick = (row: SampleManagementItem) => {
    if (!row) {
      setSelelectedSampleData(null);
      setOpenAddRemarks(false);
      setRenderAddRemarks(false);
      return;
    }
    setOpenAddRemarks(true);
    setRenderAddRemarks(true);
    setSelelectedSampleData(row);
  };

  // clsoe add remark
  const closeAddRemarks = useCallback(() => {
    setOpenAddRemarks(false);
    setRenderAddRemarks(false);
    setSelelectedSampleData(null);
  }, []);

  const handleUploadClick = sampleId => {
    alert(`Upload clicked for sample: ${sampleId}`);
  };

  // sample type change handler
  const sampleChangeHandlerRowWise = (
    e: ChangeEvent<HTMLSelectElement>,
    row: SampleManagementItem
  ) => {
    const selectedValue = e.target.value;
    const selectedTypeObj = sampleType.find(x => Number(x.sampleTypeId) === Number(selectedValue));
    const selectedTypeName = selectedTypeObj?.sampleType ?? "";

    const updatedList = updatedSampleManagementList.map(item =>
      Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
        ? {
            ...item,
            DefaultSampleTypeId: selectedValue === "0" ? null : selectedValue,
            SampleTypeName: selectedTypeName,
          }
        : item
    );

    setUpdatedSampleManagementList(updatedList);
  };

  // check items for sample collection

  const rowWiseCheckHandler = (e: ChangeEvent<HTMLInputElement>, row: SampleManagementItem) => {
    const isChecked = e.target.checked;

    const updatedList = updatedSampleManagementList.map(item =>
      Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
        ? {
            ...item,
            isSampleSelected: isChecked,
          }
        : item
    );
    setUpdatedSampleManagementList(updatedList);

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

  // handle select all
  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const updatedList = updatedSampleManagementList.map(item =>
      Number(item.IsSampleCollected) === 1 ? item : { ...item, isSampleSelected: isChecked }
    );
    setUpdatedSampleManagementList(updatedList);
    setCheckedSample(
      isChecked ? updatedList.filter(item => Number(item.IsSampleCollected) !== 1) : []
    );
  };

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

  return (
    <div className="card mt-2">
      <div className="overflow-x-auto lg:max-h-186">
        <table className="w-full min-w-400 table-fixed border-collapse text-left text-[10px] sm:text-[11px] ">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[3%] border border-gray-300 py-2 px-1 text-center">
                <input
                  type="checkbox"
                  className="input-checkbox"
                  checked={
                    updatedSampleManagementList.some(
                      item => Number(item.IsSampleCollected) !== 1
                    ) &&
                    updatedSampleManagementList
                      .filter(item => Number(item.IsSampleCollected) !== 1)
                      .every(item => Boolean(item.isSampleSelected))
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className="w-[4%] border border-gray-300 py-2 px-1 text-center">#</th>
              <th className="w-[5%] border border-gray-300 py-2 px-1 text-center">Time Line</th>
              <th className="w-[4%] border border-gray-300 py-2 text-center px-2">Lab No</th>
              <th className="w-[5%] border border-gray-300 py-2 px-1 text-center">Barcode</th>
              <th className="w-[9%] border border-gray-300 py-2 text-center px-2">UHID</th>
              <th className="w-[10%] border border-gray-300 py-2  text-center px-2">
                Patient Name
              </th>
              <th className="w-[8%] border border-gray-300 py-2 text-center px-2">Sample Type</th>
              <th className="w-[10%] border border-gray-300 py-2 text-center px-2">Test(s)</th>
              <th className="w-[7%] border border-gray-300 py-2 text-center px-2">
                Collection Time
              </th>
              <th className="w-[7%] border border-gray-300 py-2 text-center px-2">Received Time</th>
              <th className="w-[7%] border border-gray-300 py-2 text-center px-2">Priority</th>
              <th className="w-[8%] border border-gray-300 py-2 text-center px-2">Status</th>
              <th className="w-[7%] border border-gray-300 py-2 text-center px-2">Location/Beds</th>
              <th className="w-[10%] border border-gray-300 py-2 px-1 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {updatedSampleManagementList?.length === 0 && (
              <tr>
                <td
                  colSpan={15}
                  className="border border-gray-300 py-2 px-1 text-center text-gray-700"
                >
                  No records found
                </td>
              </tr>
            )}
            {updatedSampleManagementList.map((row: SampleManagementItem, idx: number) => (
              <tr key={`${row?.LabNo}_${idx}`} className="hover:bg-slate-50 transition-colors">
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
                <td className="border border-gray-300 py-2 px-1 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${row.timeLineColor || row.tmeLineColor || "text-emerald-700 bg-emerald-50"}`}
                  >
                    {row.timeLine}
                  </span>
                </td>
                <td className="border border-gray-300 py-2 px-2 text-center text-blue-600 font-bold">
                  {row?.LabNo}
                </td>
                <td className="border border-gray-300 py-1.5 px-2 text-center">
                  <CustomBarcode value={row?.Barcode} fallbackValue={row?.LabNo} />
                </td>
                <td className="border border-gray-300 py-2 px-2 text-gray-800">
                  {row?.UHID || "-"}
                </td>
                <td className="border border-gray-300 text-center py-2 px-2 text-gray-900 font-bold">
                  {row?.PatientName || "-"}
                </td>
                <td className="border border-gray-300 text-center py-2 px-2 text-gray-700">
                  <select
                    value={Number(row?.DefaultSampleTypeId || 0)}
                    className="input-field"
                    onChange={e => sampleChangeHandlerRowWise(e, row)}
                    disabled={!!row?.isSampleRejected || !!row?.IsSampleCollected}
                  >
                    <option value={0}>Select</option>
                    {sampleType.map((item: SampleTypeItem) => (
                      <option key={item?.sampleTypeId} value={item?.sampleTypeId}>
                        {item?.sampleType}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 py-2 px-2 text-gray-800 font-medium">
                  {(() => {
                    const status =
                      Number(row?.isSampleRejected) === 1
                        ? { color: "text-red-600 bg-red-100" }
                        : Number(row?.IsReportHold) === 1
                          ? { color: "text-orange-700 bg-orange-100" }
                          : Number(row?.IsReportApproved) === 1
                            ? { color: "text-emerald-700 bg-emerald-100" }
                            : Number(row?.IsDispatched) === 1
                              ? { color: "text-purple-700 bg-purple-100" }
                              : Number(row?.IsResultDone) === 1
                                ? { color: "text-pink-700 bg-pink-100" }
                                : Number(row?.IsSampleReceivedByDepartment) === 1
                                  ? { color: "text-blue-500 bg-cyan-100" }
                                  : Number(row?.IsSampleCollected) === 1
                                    ? { color: "text-amber-600 bg-amber-100" }
                                    : { color: "text-yellow-800 bg-yellow-100" };

                    return (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${status.color}`}
                      >
                        {row?.Name || "-"}
                      </span>
                    );
                  })()}
                </td>
                <td className="border border-gray-300 text-center py-2 px-2 text-gray-600 whitespace-pre-line text-[10px]">
                  {row?.SampleCollectedOn || "-"}
                </td>
                <td className="border border-gray-300  text-center py-2 px-2 text-gray-600 whitespace-pre-line text-[10px]">
                  {row?.SampleReceivedByDepartmentOn || "-"}
                </td>
                <td className="border border-gray-300 py-2 px-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      row?.isUrgent === 1
                        ? "text-rose-700 bg-rose-100"
                        : "text-emerald-700 bg-emerald-100"
                    }`}
                  >
                    {row?.isUrgent === 1 ? "Urgent" : "Normal"}
                  </span>
                </td>

                <td className="border border-gray-300 py-2 px-2 text-center">
                  {(() => {
                    const status =
                      Number(row?.isSampleRejected) === 1
                        ? {
                            label: "Rejected",
                            color: "text-red-600 bg-red-100",
                          }
                        : Number(row?.IsReportHold) === 1
                          ? {
                              label: "On Hold",
                              color: "text-orange-700 bg-orange-100",
                            }
                          : Number(row?.IsReportApproved) === 1
                            ? {
                                label: "Approved",
                                color: "text-emerald-700 bg-emerald-100",
                              }
                            : Number(row?.IsDispatched) === 1
                              ? {
                                  label: "Dispatched",
                                  color: "text-purple-700 bg-purple-100",
                                }
                              : Number(row?.IsResultDone) === 1
                                ? {
                                    label: "Report Generated",
                                    color: "text-pink-700 bg-pink-100",
                                  }
                                : Number(row?.IsSampleReceivedByDepartment) === 1
                                  ? {
                                      label: "Received",
                                      color: "text-blue-500 bg-blue-100",
                                    }
                                  : Number(row?.IsSampleCollected) === 1
                                    ? {
                                        label: "Collected",
                                        color: "text-amber-700 bg-amber-100",
                                      }
                                    : {
                                        label: "Pending",
                                        color: "text-yellow-800 bg-yellow-100",
                                      };

                    return (
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${status.color}`}
                      >
                        {status.label}
                      </span>
                    );
                  })()}
                </td>

                <td className="border border-gray-300 rounded py-2 px-2 text-center text-gray-700">
                  {row?.WardName || (row as any)?.BedAndLocation || "-"}
                </td>
                <td className="border border-gray-300 py-2 px-1 text-center">
                  <div className="flex items-center justify-center space-x-.2">
                    <button
                      onClick={() => handlePatientViewDetails(row)}
                      className="text-gray-500 hover:text-blue-600 cursor-pointer p-1 transition-colors"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleRejectSample(row)}
                      className="text-gray-500 hover:text-gray-800 cursor-pointer p-1 transition-colors"
                      title="Reject Sample"
                    >
                      <MoreVertical size={15} />
                    </button>
                    <button
                      onClick={() => handlePrintClick(row.sampleId)}
                      className="text-gray-500 hover:text-emerald-600 cursor-pointer p-1 transition-colors"
                      title="Print Sample"
                    >
                      <Printer size={15} />
                    </button>
                    <button
                      onClick={() => handleAddRemarkClick(row)}
                      className="text-green-700 hover:text-emerald-600 cursor-pointer p-1 transition-colors"
                      title="Add Remarks"
                    >
                      <Plus size={15} />
                    </button>
                    <button
                      onClick={() => handleUploadDocument(row)}
                      className="text-gray-500 hover:text-emerald-600 cursor-pointer p-1 transition-colors"
                      title="Upload Document"
                    >
                      <File size={15} />
                    </button>
                    {/* <button
                      onClick={() => handleUploadClick(row.sampleId)}
                      className="text-red-500 hover:text-emerald-600 cursor-pointer p-1 transition-colors"
                      title="Upload"
                    >
                      <ArrowUp size={15} />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Button */}
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
      </div>

      {/* add remark */}
      {renderAddRemarks && (
        <AddRemarkPopup
          isOpen={openAddRemarks}
          onClose={closeAddRemarks}
          data={selectedSampleData}
        />
      )}

      {/* reject sample */}
      {renderRejectSample && (
        <RejectSamplePopup
          isOpen={openRejectSample}
          onClose={closeRejectSample}
          data={selectedSampleData}
          refreshSampleReject={refetchSampleManagement}
        />
      )}

      {/* upload document */}
      {renderUploadDocument && (
        <UploadDocument
          isOpen={openUploadDocument}
          onClose={closeUploadDocument}
          data={selectedSampleData}
        />
      )}
    </div>
  );
}
