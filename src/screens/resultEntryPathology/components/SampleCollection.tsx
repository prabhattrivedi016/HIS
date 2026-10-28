import CentralPopup from "@/components/centralPopup";
import { Eye, File, Plus, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GroupedDataResultEntryPathology,
  ResultEntryPathologyItem,
  SampleTypeItem,
} from "../types";

const SampleCollection = ({
  isOpen,
  onClose,
  data,
  updatedResultEntryPathologyList,
  viewMode,
  sampleType,
  handlePatientViewDetails,
  handleRejectSample,
  handlePrintClick,
  handleAddRemarkClick,
  handleUploadDocument,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: GroupedDataResultEntryPathology | null;
  updatedResultEntryPathologyList: ResultEntryPathologyItem[];
  refetchSampleManagement?: () => Promise<void>;
  viewMode: "patient" | "sample" | "test";
  sampleType: SampleTypeItem[];
  handlePatientViewDetails?: (row: ResultEntryPathologyItem) => void;
  handleRejectSample?: (row: ResultEntryPathologyItem) => void;
  handlePrintClick?: (sampleId: number) => void;
  handleAddRemarkClick?: (row: ResultEntryPathologyItem) => void;
  handleUploadDocument?: (row: ResultEntryPathologyItem) => void;
}) => {
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState<ResultEntryPathologyItem[]>([]);

  useEffect(() => {
    const selectedUHID = String(data?.UHID ?? "")
      .trim()
      .toLowerCase();

    if (!selectedUHID) {
      setFilteredData([]);
      return;
    }

    const filtered = updatedResultEntryPathologyList?.filter(row => {
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
  }, [data, updatedResultEntryPathologyList]);

  if (!data) return;

  // result entry select handler
  const resultEntryPathologySelectHandler = (row: ResultEntryPathologyItem) => {
    navigate(`/sample-result-entry/${row?.PatientInvestigationId}`);
  };

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
              {filteredData.map((row: ResultEntryPathologyItem, idx: number) => (
                <tr
                  key={`${row?.LabNo}_${idx}`}
                  className="hover:bg-slate-50 transition-transform cursor-pointer"
                  onDoubleClick={() => resultEntryPathologySelectHandler(row)}
                >
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
                      }
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
                        onClick={() => handlePatientViewDetails?.(row)}
                        className="cursor-pointer p-1 text-gray-500 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintClick?.(row.sampleId)}
                        className="cursor-pointer p-1 text-gray-500 hover:text-emerald-600"
                        title="Print Sample"
                      >
                        <Printer size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddRemarkClick?.(row)}
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
      </>
    </CentralPopup>
  );
};

export default SampleCollection;
