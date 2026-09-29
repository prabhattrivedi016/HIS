import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useEffect, useState } from "react";
import { OtProcessMasterItem } from "../types";

interface SequenceMappingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => Promise<void>;
}

const SequenceMappingPopup = ({ isOpen, onClose, refetch }: SequenceMappingPopupProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const [sequenceList, setSequenceList] = useState<OtProcessMasterItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  //

  const getOtProcessMaster = async (): Promise<OtProcessMasterItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OT_PROCESS_MASTER,
      {},
      {},
      {
        component: "SequenceMappingPopup",
      }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while getting OT process list");
      return [];
    }
    return resp?.data ?? [];
  };

  useEffect(() => {
    if (!isOpen) {
      setSequenceList([]);
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    void (async () => {
      const list = await getOtProcessMaster();
      const sorted = [...list].sort((a, b) => Number(a.SequenceNo) - Number(b.SequenceNo));
      setSequenceList(sorted);
    })();
  }, [isOpen]);

  const normalizeSequence = (list: OtProcessMasterItem[]): OtProcessMasterItem[] => {
    return list.map((item, index) => ({
      ...item,
      SequenceNo: index + 1,
    }));
  };

  const handleDragStart = (event: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedIndex(index);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>, index: number) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    setDragOverIndex(index);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLTableRowElement>, index: number) => {
    const relatedTarget = event.relatedTarget as Node | null;

    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
      return;
    }

    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    event.preventDefault();

    const sourceIndexFromData = Number(event.dataTransfer.getData("text/plain"));
    const sourceIndex =
      draggedIndex !== null && !Number.isNaN(draggedIndex) ? draggedIndex : sourceIndexFromData;

    setSequenceList(previousList => {
      if (
        Number.isNaN(sourceIndex) ||
        sourceIndex < 0 ||
        sourceIndex >= previousList.length ||
        sourceIndex === dropIndex
      ) {
        return previousList;
      }

      const updatedList = [...previousList];
      const [draggedItem] = updatedList.splice(sourceIndex, 1);
      updatedList.splice(dropIndex, 0, draggedItem);

      return normalizeSequence(updatedList);
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  //   drag end

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Create payload
  const createPayload = () => {
    return {
      sequences: sequenceList.map(item => ({
        otProcessId: Number(item?.OTProcessId),
        sequenceNo: Number(item?.SequenceNo),
      })),
    };
  };

  // Save
  const handleSave = async () => {
    if (!sequenceList.length) {
      showWarning("Please select sequence to update");
      return;
    }

    try {
      const payload = createPayload();

      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.UPDATE_OT_PROCESS_SEQUENCE,
        payload,
        {},
        { component: "SequenceMappingPopup" }
      );
      if (!resp?.result) {
        showError(resp?.message ?? "Failed to update sequence");
        return;
      }
      showSuccess(resp?.message ?? "Sequence updated successfully");
      refetch?.();
      onClose();
    } catch (error) {
      console.error("Failed to update process sequence:", error);
    }
  };
  const handleClose = () => {
    setSequenceList([]);
    setDraggedIndex(null);
    setDragOverIndex(null);

    onClose();
  };

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={handleClose}
      title="OT Process Sequence Mapping"
      className="w-full max-w-5xl"
    >
      <div className="flex flex-col">
        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    <th className="table-th w-12 text-center">#</th>

                    <th className="table-th">Process Name</th>

                    <th className="table-th">Process Key</th>
                  </tr>
                </thead>

                <tbody>
                  {sequenceList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        No OT processes found
                      </td>
                    </tr>
                  ) : (
                    sequenceList.map((item, index) => {
                      const isDragging = draggedIndex === index;

                      const isDragOver = dragOverIndex === index;

                      return (
                        <tr
                          key={item.OTProcessId}
                          draggable
                          onDragStart={event => handleDragStart(event, index)}
                          onDragOver={event => handleDragOver(event, index)}
                          onDragLeave={event => handleDragLeave(event, index)}
                          onDrop={event => handleDrop(event, index)}
                          onDragEnd={handleDragEnd}
                          className={`table-row cursor-grab select-none transition-all duration-150 active:cursor-grabbing ${isDragging ? "opacity-40" : ""} ${isDragOver ? "bg-blue-50" : ""}`}
                        >
                          <td className="table-td  font-medium">{index + 1}</td>

                          <td className="table-td">{item?.ProcessName || "-"}</td>

                          <td className="table-td">{item?.ProcessKey || "-"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-2 flex w-full justify-end gap-2">
          <button type="submit" onClick={handleSave} className="save-btn ">
            Save
          </button>
        </div>
        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default SequenceMappingPopup;
