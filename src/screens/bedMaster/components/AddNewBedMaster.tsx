import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { BedMasterPopupName, Status } from "@/constants/constants";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { BranchItem, PickMasterItem } from "@/types";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useQuery } from "@tanstack/react-query";
import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BedMasterTableItem, BlockItem, FloorItem, TypeItem, WardItem } from "../types";
import CreateUpdateFloorWard from "./CreateUpdateFloorWard";

const AddNewBedMaster = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: BedMasterTableItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const buttonTitle = data !== null ? "Update" : "Create";
  const branchList = useGetBranchList()?.branchList?.data ?? [];
  const applicableList = usePickMaster("BedApplicableGender")?.pickMasterValue ?? [];

  const [openCreateUpdateWardFloor, setOpenCreateUpdateWardFloor] = useState<boolean>(false);
  const [renderCreateUpdateWardFloor, setRenderCreateUpdateWardFloor] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<"ward" | "floor" | "block">("floor");

  const [selectedFloor, setSelectedFloor] = useState<FloorItem | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardItem | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockItem | null>(null);

  //   type list
  const getTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryId: 10, isActive: Status?.ACTIVE } },
      { component: "BedMaster" }
    );
    return resp?.data;
  };

  const { data: TypeList = [] } = useQuery({
    queryKey: ["getTypeList"],
    queryFn: getTypeList,
  });

  // block list
  const getBlockList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BLOCK_LIST,
      {},
      {},
      { component: "BedMaster" }
    );
    return resp?.data;
  };

  const { data: blockList = [], refetch: refetchBlock } = useQuery({
    queryKey: ["getBlockList"],
    queryFn: () => getBlockList(),
  });

  // floor list
  const getFloorList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_FLOOR_LIST,
      {},
      {},
      { component: "BedMaster" }
    );
    return resp?.data;
  };

  const { data: FloorList = [], refetch: refetchFloor } = useQuery({
    queryKey: ["getFloorList"],
    queryFn: getFloorList,
  });

  // ward list
  const getWardList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_WARD_NAME_MASTER,
      {},
      {},
      { component: "BedMaster" }
    );
    return resp?.data;
  };

  const { data: wardList = [], refetch: refetchWard } = useQuery({
    queryKey: ["getWardList"],
    queryFn: getWardList,
  });

  //   popup handler
  const openPopupHandler = (popupName: string) => {
    switch (popupName) {
      case BedMasterPopupName?.FLOOR: {
        setSelectedPopup(BedMasterPopupName?.FLOOR);
        setOpenCreateUpdateWardFloor(true);
        setRenderCreateUpdateWardFloor(true);
        return;
      }

      case BedMasterPopupName?.WARD: {
        setSelectedPopup(BedMasterPopupName?.WARD);
        setOpenCreateUpdateWardFloor(true);
        setRenderCreateUpdateWardFloor(true);
        return;
      }

      case BedMasterPopupName?.BLOCK: {
        setSelectedPopup(BedMasterPopupName?.BLOCK);
        setOpenCreateUpdateWardFloor(true);
        setRenderCreateUpdateWardFloor(true);
        return;
      }

      default:
        return;
    }
  };

  //   close handler
  const closePopupHandler = useCallback(() => {
    setOpenCreateUpdateWardFloor(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setRenderCreateUpdateWardFloor(false);
    }, 100);
  }, []);

  //   block select handler
  const blockSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedBlock(null);
      return;
    }
    const selected = blockList.find((f: BlockItem) => f?.blockId === value);
    setSelectedBlock(selected);
    setSelectedFloor(null);
    setSelectedWard(null);
  };

  //   floor select handler
  const floorSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedFloor(null);
      return;
    }
    const selected = FloorList.find((f: FloorItem) => f?.floorId === value);
    setSelectedFloor(selected);
    setSelectedWard(null);
    setSelectedBlock(null);
  };

  //   floor select handler
  const wardSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedWard(null);
      return;
    }
    const selected = wardList.find((f: WardItem) => f?.WardNameId === value);
    setSelectedWard(selected);
    setSelectedFloor(null);
    setSelectedBlock(null);
  };
  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div
          className={`drawer-layout drawer-bg lg:min-w-200 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="drawer-title-border">
            <h2 className="drawer-title">{buttonTitle} Bed</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          {/* {!!successMessage && <SuccessMessage text={successMessage} />} */}
          {/* {!!errorMessage && <ErrorMessage text={errorMessage} />} */}

          <div className="card m-1 ">
            <form>
              <div className="form-grid-2">
                <InputField label="Branch Name" required>
                  <select className="input-field">
                    <option value="">Select branch</option>
                    {branchList?.map((b: BranchItem) => (
                      <option key={b?.branchId} value={b?.branchId}>
                        {b?.branchName}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Type" required>
                  <select className="input-field">
                    <option value="">Select type</option>
                    {TypeList?.map((t: TypeItem) => (
                      <option key={t?.serviceItemId} value={t?.serviceItemId}>
                        {t?.name}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Block" required>
                  <div className="flex gap-2 items-center">
                    <select className="input-field" onChange={blockSelectHandler}>
                      <option value="">Select block</option>
                      {blockList?.map((f: BlockItem) => (
                        <option key={f?.blockId} value={f?.blockId}>
                          {f?.blockName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler(BedMasterPopupName?.BLOCK)}
                    >
                      <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                    </button>
                  </div>
                </InputField>

                <InputField label="Floor" required>
                  <div className="flex gap-2 items-center">
                    <select className="input-field" onChange={floorSelectHandler}>
                      <option value="">Select floor</option>
                      {FloorList?.map((f: FloorItem) => (
                        <option key={f?.floorId} value={f?.floorId}>
                          {f?.floorName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler(BedMasterPopupName?.FLOOR)}
                    >
                      <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                    </button>
                  </div>
                </InputField>

                <InputField label="Ward Name / No" required>
                  <div className="flex gap-2 items-center">
                    <select className="input-field" onChange={wardSelectHandler}>
                      <option value="">Select ward</option>
                      {wardList.map((w: WardItem) => (
                        <option key={w?.WardNameId} value={w?.WardNameId}>
                          {w?.WardName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler(BedMasterPopupName?.WARD)}
                    >
                      <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                    </button>
                  </div>
                </InputField>

                <InputField label="Number of bed" required>
                  <input
                    type="text"
                    className="input-field"
                    max={25}
                    min={1}
                    onInput={allowOnlyNumbers}
                    placeholder="Enter bed number"
                  />
                  <p className="input-field-msg"> * Enter between 1 to 25 only</p>
                </InputField>

                <InputField label="Room Name" required>
                  <input type="text" className="input-field" placeholder="Enter room name" />
                </InputField>

                <InputField label="Applicable for">
                  <select className="input-field">
                    {applicableList.map((a: PickMasterItem) => (
                      <option key={a?.key} value={a?.key}>
                        {a?.value}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Status">
                  <select className="input-field">
                    <option value={0}>Inactive</option>
                    <option value={1}>Active</option>
                  </select>
                </InputField>
              </div>

              <div className="form-actions-responsive mt-5">
                <button type="submit" className="save-btn">
                  {buttonTitle}
                </button>
                <button type="button" className="cancel-button ">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* popup */}
      {!!renderCreateUpdateWardFloor && (
        <CreateUpdateFloorWard
          isOpen={openCreateUpdateWardFloor}
          onClose={closePopupHandler}
          popupName={selectedPopup}
          selectedFloor={selectedFloor}
          refreshFloor={refetchFloor}
          resetFloor={setSelectedFloor}
          selectedWard={selectedWard}
          refreshWard={refetchWard}
          resetWard={setSelectedWard}
          selectBlock={selectedBlock}
          refreshBlock={refetchBlock}
          resetBlock={setSelectedBlock}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(AddNewBedMaster);
