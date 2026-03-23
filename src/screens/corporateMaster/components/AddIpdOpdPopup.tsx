import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import { IpdRateListTableHeader, OpdRateListTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AddIpdOpdPopupProps, RateListItem } from "../types";

type SortableRowProps = {
  item: RateListItem;
  onDelete: (id: number) => void;
};

const SortableRow = ({ item, onDelete }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.rateListId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <td className="table-td">
        <i
          className="fa-solid fa-trash icon-color-delete cursor-pointer"
          onPointerDown={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            onDelete(item.rateListId);
          }}
        />
      </td>
      <td className="table-td">{item?.rateListName || "-"}</td>
    </tr>
  );
};

const AddIpdOpdPopup = ({
  isOpen,
  onClose,
  ipdValue,
  opdValue,
  setIpdValue,
  setOpdValue,
}: AddIpdOpdPopupProps) => {
  const { fetchApi } = useGlobalApi();

  const [rateMasterList, setRateMasterList] = useState<RateListItem[]>([]);
  const [selectedRate, setSelectedRate] = useState<RateListItem | null>(null);

  const [ipdRateList, setIpdRateList] = useState<RateListItem[]>([]);
  const [opdRateList, setOpdRateList] = useState<RateListItem[]>([]);

  const [isError, setIsError] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    getRateList();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const idToRate = new Map(rateMasterList.map(item => [item.rateListId, item]));
    const parseIds = (value?: string) =>
      (value ?? "")
        .split(",")
        .map(v => Number(v.trim()))
        .filter(v => Number.isFinite(v) && v > 0);

    const toRateList = (value?: string) =>
      parseIds(value)
        .map(id => idToRate.get(id))
        .filter(Boolean) as RateListItem[];

    setOpdRateList(toRateList(opdValue));
    setIpdRateList(toRateList(ipdValue));
    setSelectedRate(null);
    setIsDisabled(true);
    setIsError("");
  }, [isOpen, ipdValue, opdValue, rateMasterList]);

  const getRateList = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_RATE_LIST_MASTER);
    setRateMasterList(resp?.data ?? []);
  };

  const rateSelectedHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const rateId = Number(e.target.value);
    if (!rateId) {
      setIsDisabled(true);
      setSelectedRate(null);
      return;
    }

    const rate = rateMasterList.find(r => r.rateListId === rateId);
    if (!rate) return;

    setSelectedRate(rate);
    setIsDisabled(false);
    setIsError("");
  };

  const addToList = (list: RateListItem[], setList: Dispatch<SetStateAction<RateListItem[]>>) => {
    if (!selectedRate) return;

    const exists = list.find(i => i.rateListId === selectedRate.rateListId);
    if (exists) {
      setIsError(`${exists.rateListName} already added`);
      return;
    }

    setList([...list, selectedRate]);
    setIsError("");
  };

  const handleDrag =
    (list: RateListItem[], setList: Dispatch<SetStateAction<RateListItem[]>>) => (event: any) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = list.findIndex(i => i.rateListId === active.id);
      const newIndex = list.findIndex(i => i.rateListId === over.id);

      setList(arrayMove(list, oldIndex, newIndex));
    };

  const removeItem = (setList: Dispatch<SetStateAction<RateListItem[]>>) => (id: number) => {
    setList(prev => prev.filter(i => i.rateListId !== id));
  };

  const handleSave = () => {
    const opdRate = opdRateList.map(i => i.rateListId).join(",");
    setOpdValue?.(opdRate ?? "");
    const ipdRate = ipdRateList.map(i => i.rateListId).join(",");
    setIpdValue?.(ipdRate ?? "");
    onClose?.();
  };

  return createPortal(
    <div className={`fixed inset-0 z-9999  ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay  ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div className={`central-popup lg:min-w-[1000px] ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">Follow Rate List (IPD & OPD)</h2>
          <button onClick={onClose} className="close-drawer-btn">
            &times;
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="w-full lg:w-auto">
            <InputField label="Follow Rate List (IPD & OPD)" required>
              <select className="input-field  lg:min-w-70 h-[42px]" onChange={rateSelectedHandler}>
                <option value="">Select</option>
                {rateMasterList.map(r => (
                  <option key={r?.rateListId} value={r?.rateListId}>
                    {r?.rateListName}
                  </option>
                ))}
              </select>
              <div className="  min-h-5">
                <p className="input-field-error text-sm">{isError}</p>
              </div>
            </InputField>
          </div>

          <div className="flex gap-3 w-full lg:w-auto lg:items-end items-center justify-center">
            <button
              type="button"
              className={`save-btn h-[42px] flex items-center justify-center mb-8 ${
                isDisabled ? "disabled-btn" : ""
              }`}
              disabled={isDisabled}
              onClick={() => addToList(opdRateList, setOpdRateList)}
            >
              Add to OPD
            </button>
            <button
              type="button"
              className={`save-btn h-[42px] flex items-center justify-center mb-8 ${
                isDisabled ? "disabled-btn" : ""
              }`}
              onClick={() => addToList(ipdRateList, setIpdRateList)}
              disabled={isDisabled}
            >
              Add to IPD
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDrag(opdRateList, setOpdRateList)}
          >
            <SortableContext
              items={opdRateList.map(i => i.rateListId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <div className="table-size lg:min-h-60 lg:max-h-60 lg:max-w-120">
                    <table className="base-table">
                      <thead className="table-head">
                        <tr>
                          {OpdRateListTableHeader.map((h, index) => (
                            <th key={index} className="table-th">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {opdRateList.map(item => (
                          <SortableRow
                            key={item.rateListId}
                            item={item}
                            onDelete={removeItem(setOpdRateList)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </SortableContext>
          </DndContext>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDrag(ipdRateList, setIpdRateList)}
          >
            <SortableContext
              items={ipdRateList.map(i => i.rateListId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <div className="table-size lg:min-h-60 lg:max-h-60 lg:max-w-120">
                    <table className="base-table">
                      <thead className="table-head">
                        <tr>
                          {IpdRateListTableHeader.map((h, i) => (
                            <th className="table-th" key={i}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {ipdRateList.map(item => (
                          <SortableRow
                            key={item.rateListId}
                            item={item}
                            onDelete={removeItem(setIpdRateList)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="form-actions-responsive mt-5">
          <button type="submit" className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddIpdOpdPopup;
