import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { BedMasterPopupName, Status } from "@/constants/constants";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { BranchItem, PickMasterItem } from "@/types";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { bedMasterSchema, BranchMasterFormItem } from "@/validation/bedMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { BedMasterTableItem, BlockItem, FloorItem, TypeItem, WardItem } from "../types";
import CreateUpdateFloorWard from "./CreateUpdateFloorWard";

const AddNewBedMaster = ({
  isOpen,
  onClose,
  data,
  refreshBedList,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: BedMasterTableItem | null;
  refreshBedList: () => Promise<QueryObserverResult<any, Error>>;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const branchList = useGetBranchList()?.branchList?.data ?? [];
  const applicableList = usePickMaster("BedApplicableGender")?.pickMasterValue ?? [];

  const [openCreateUpdateWardFloor, setOpenCreateUpdateWardFloor] = useState<boolean>(false);
  const [renderCreateUpdateWardFloor, setRenderCreateUpdateWardFloor] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<"ward" | "floor" | "block">("floor");

  const [selectedFloor, setSelectedFloor] = useState<FloorItem | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardItem | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockItem | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bedMasterSchema),
    defaultValues: {
      bedId: 0,
      branchId: 0,
      typeId: 0,
      floorId: 0,
      blockId: 0,
      wardNameId: 0,
      roomName: "",
      gender: "B",
      bedNo: "",
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("bedId"));
  const buttonTitle = isEdit ? "Update" : "Create";

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
      setValue("blockId", 0);
      return;
    }
    setValue("blockId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });
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
      setValue("floorId", 0);
      return;
    }
    setValue("floorId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    const selected = FloorList.find((f: FloorItem) => f?.floorId === value);
    setSelectedFloor(selected);

    setSelectedWard(null);
    setSelectedBlock(null);
  };

  //   ward select handler
  const wardSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedWard(null);
      setValue("wardNameId", 0);
      return;
    }
    setValue("wardNameId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const selected = wardList.find((f: WardItem) => f?.WardNameId === value);
    setSelectedWard(selected);

    setSelectedFloor(null);
    setSelectedBlock(null);
  };

  // submit handler
  const onSubmit = async (formData: BranchMasterFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_BED_MASTER,
      formData,
      {},
      { component: "AddNewBedMaster" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to update bed");
      setSuccessMessage("");
      return;
    }
    setErrorMessage("");
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    refreshBedList?.();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onClose?.();
      setSuccessMessage("");
      setErrorMessage("");
      reset({
        bedId: 0,
        branchId: 0,
        typeId: 0,
        floorId: 0,
        wardNameId: 0,
        roomName: "",
        gender: "B",
        bedNo: "",
        isActive: 0,
      });
    }, 500);
  };

  // edit mode
  useEffect(() => {
    if (!isOpen || !data) return;

    reset({
      bedId: data?.BedId ?? 0,
      branchId: data?.BranchId ?? 0,
      typeId: data?.TypeId ?? 0,
      floorId: data?.FloorId ?? 0,
      blockId: data?.BlockId ?? 0,
      wardNameId: data?.WardNameId ?? 0,
      roomName: data?.RoomName ?? "",
      gender: data?.Gender ?? "B",
      bedNo: String(data?.BedNo ?? ""),
      isActive: data?.IsActive ?? 1,
    });

    // Optional: set selected objects for dropdown edit mode
    const branch = branchList.find(
      (b: BranchItem) => Number(b?.branchId) === Number(data?.BranchId)
    );
    const floor = FloorList.find((f: FloorItem) => Number(f.floorId) === Number(data?.FloorId));

    const ward = wardList.find((w: WardItem) => Number(w.WardNameId) === Number(data?.WardNameId));

    const block = blockList.find((b: BlockItem) => Number(b.blockId) === Number(data?.BlockId));

    setValue("branchId", branch?.branchId, { shouldValidate: true, shouldDirty: true });
    setSelectedFloor(floor ?? null);
    setSelectedWard(ward ?? null);
    setSelectedBlock(block ?? null);
  }, [isOpen, data, reset, FloorList, wardList, blockList, branchList]);

  // cancel handler
  const cancelHandler = () => {
    reset({
      bedId: 0,
      branchId: 0,
      typeId: 0,
      floorId: 0,
      blockId: 0,
      wardNameId: 0,
      roomName: "",
      gender: "B",
      bedNo: "",
      isActive: 1,
    });
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

          {!!successMessage && <SuccessMessage text={successMessage} />}
          {!!errorMessage && <ErrorMessage text={errorMessage} />}

          <div className="card m-1 ">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid-2">
                <InputField label="Branch Name" required>
                  <select className="input-field" {...register("branchId")}>
                    <option value={0}>Select branch</option>
                    {branchList?.map((b: BranchItem) => (
                      <option key={b?.branchId} value={b?.branchId}>
                        {b?.branchName}
                      </option>
                    ))}
                  </select>
                  {errors.branchId && (
                    <p className="input-field-error">{errors.branchId.message}</p>
                  )}
                </InputField>

                <InputField label="Type" required>
                  <select className="input-field" {...register("typeId")}>
                    <option value={0}>Select type</option>
                    {TypeList?.map((t: TypeItem) => (
                      <option key={t?.serviceItemId} value={t?.serviceItemId}>
                        {t?.name}
                      </option>
                    ))}
                  </select>
                  {errors.typeId && <p className="input-field-error">{errors.typeId.message}</p>}
                </InputField>

                <InputField label="Block" required>
                  <div className="flex gap-2 items-center">
                    <select
                      className="input-field"
                      {...register("blockId")}
                      onChange={blockSelectHandler}
                    >
                      <option value={0}>Select block</option>
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
                  {errors.blockId && <p className="input-field-error">{errors.blockId.message}</p>}
                </InputField>

                <InputField label="Floor" required>
                  <div className="flex gap-2 items-center">
                    <select
                      className="input-field"
                      {...register("floorId")}
                      onChange={floorSelectHandler}
                    >
                      <option value={0}>Select floor</option>
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
                  {errors.floorId && <p className="input-field-error">{errors.floorId.message}</p>}
                </InputField>

                <InputField label="Ward Name / No" required>
                  <div className="flex gap-2 items-center">
                    <select
                      className="input-field"
                      {...register("wardNameId")}
                      onChange={wardSelectHandler}
                    >
                      <option value={0}>Select ward</option>
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
                  {errors.wardNameId && (
                    <p className="input-field-error">{errors.wardNameId.message}</p>
                  )}
                </InputField>

                <InputField
                  label={isEdit ? "Update number " : "Number of Beds"}
                  hint="Enter between 1 to 25 only"
                  required
                >
                  <input
                    type="text"
                    className="input-field"
                    max={25}
                    min={1}
                    onInput={allowOnlyNumbers}
                    placeholder="Enter bed number"
                    {...register("bedNo")}
                  />

                  {errors.bedNo && <p className="input-field-error">{errors.bedNo.message}</p>}
                </InputField>

                <InputField label="Room Name" required>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter room name"
                    {...register("roomName")}
                  />
                  {errors.roomName && (
                    <p className="input-field-error">{errors.roomName.message}</p>
                  )}
                </InputField>

                <InputField label="Applicable for">
                  <select className="input-field" {...register("gender")}>
                    {applicableList.map((a: PickMasterItem) => (
                      <option key={a?.key} value={a?.key}>
                        {a?.value}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Status">
                  <select className="input-field" {...register("isActive")}>
                    <option value={0}>Inactive</option>
                    <option value={1}>Active</option>
                  </select>
                </InputField>
              </div>

              <div className="form-actions-responsive mt-5">
                <button type="submit" className="save-btn">
                  {buttonTitle}
                </button>
                <button type="button" className="cancel-button" onClick={cancelHandler}>
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
