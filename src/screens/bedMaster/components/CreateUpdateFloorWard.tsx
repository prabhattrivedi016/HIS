import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { BedMasterPopupName } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  createUpdateBlockSchema,
  CreateUpdateBlockSchemaFormItem,
  createUpdateFloorSchema,
  CreateUpdateFloorSchemaFormItem,
  createUpdateWardSchema,
  CreateUpdateWardSchemaFormItem,
} from "@/validation/bedMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { QueryObserverResult } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { BlockItem, FloorItem, WardItem } from "../types";

const CreateUpdateFloorWard = ({
  isOpen,
  onClose,
  popupName,
  selectedFloor,
  selectedWard,
  refreshFloor,
  refreshWard,
  selectBlock,
  refreshBlock,
  resetFloor,
  resetWard,
  resetBlock,
}: {
  isOpen: boolean;
  onClose: () => void;
  popupName: "ward" | "floor" | "block";
  selectedFloor: FloorItem | null;
  selectedWard: WardItem | null;
  selectBlock: BlockItem | null;
  refreshFloor: () => Promise<QueryObserverResult<any, Error>>;
  refreshWard: () => Promise<QueryObserverResult<any, Error>>;
  refreshBlock: () => Promise<QueryObserverResult<any, Error>>;
  resetFloor: Dispatch<SetStateAction<FloorItem | null>>;
  resetWard: Dispatch<SetStateAction<WardItem | null>>;
  resetBlock: Dispatch<SetStateAction<BlockItem | null>>;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const floorButtonTitle = selectedFloor !== null ? "Update" : "Create";
  const blockButtonTitle = selectBlock !== null ? "Update" : "Create";

  const wardButtonTitle = selectedWard !== null ? "Update" : "Create";
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const blockForm = useForm({
    resolver: yupResolver(createUpdateBlockSchema),
    defaultValues: {
      blockId: 0,
      blockName: "",
    },
  });

  const floorForm = useForm({
    resolver: yupResolver(createUpdateFloorSchema),
    defaultValues: {
      floorId: 0,
      floorName: "",
    },
  });

  const wardForm = useForm({
    resolver: yupResolver(createUpdateWardSchema),
    defaultValues: {
      wardNameId: 0,
      wardName: "",
    },
  });

  // floor
  useEffect(() => {
    blockForm.reset({
      blockId: selectBlock?.blockId ?? 0,
      blockName: selectBlock?.blockName ?? "",
    });
  }, [selectBlock]);

  // floor
  useEffect(() => {
    floorForm.reset({
      floorId: selectedFloor?.floorId ?? 0,
      floorName: selectedFloor?.floorName ?? "",
    });
  }, [selectedFloor]);

  // ward
  useEffect(() => {
    wardForm.reset({
      wardNameId: selectedWard?.WardNameId ?? 0,
      wardName: selectedWard?.WardName ?? "",
    });
  }, [selectedFloor]);

  const blockSubmitHandler = async (formData: CreateUpdateBlockSchemaFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_BLOCK_MASTER,
      formData,
      {},
      { component: "CreateUpdateFloorWard" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to update floor");
      setSuccessMessage("");
      return;
    }
    setErrorMessage("");
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    refreshBlock?.();
    resetBlock?.(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onClose?.();
      setSuccessMessage("");
      setErrorMessage("");
      blockForm.reset({
        blockId: 0,
        blockName: "",
      });
    }, 500);
  };

  // floor submit handler
  const floorSubmitHandler = async (formData: CreateUpdateFloorSchemaFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_FLOOR_MASTER,
      formData,
      {},
      { component: "CreateUpdateFloorWard" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to update floor");
      setSuccessMessage("");
      return;
    }
    setErrorMessage("");
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    refreshFloor?.();
    resetFloor?.(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onClose?.();
      setSuccessMessage("");
      setErrorMessage("");
      floorForm.reset({
        floorId: 0,
        floorName: "",
      });
    }, 500);
  };

  // floor submit handler
  const wardSubmitHandler = async (formData: CreateUpdateWardSchemaFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_WARD_NAME_MASTER,
      formData,
      {},
      { component: "CreateUpdateFloorWard" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to update ward");
      setSuccessMessage("");
      return;
    }
    setErrorMessage("");
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    refreshWard?.();
    resetWard?.(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onClose?.();
      setSuccessMessage("");
      setErrorMessage("");
      wardForm.reset({
        wardNameId: 0,
        wardName: "",
      });
    }, 500);
  };

  // block cancel handler
  const blockCancelHandler = () => {
    blockForm.reset({
      blockId: 0,
      blockName: "",
    });
  };

  // floor cancel handler
  const floorCancelHandler = () => {
    floorForm.reset({
      floorId: 0,
      floorName: "",
    });
  };

  // ward cancel handler
  const wardCancelHandler = () => {
    wardForm.reset({
      wardNameId: 0,
      wardName: "",
    });
  };

  const renderComponent = (popupName: "ward" | "floor" | "block") => {
    switch (popupName) {
      case BedMasterPopupName?.BLOCK: {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = blockForm;
        return (
          <form className="form-grid-1" onSubmit={handleSubmit(blockSubmitHandler)}>
            <InputField label="Block Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter block name"
                {...register("blockName")}
              />
              {errors.blockName && <p className="input-field-error">{errors.blockName.message}</p>}
            </InputField>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {blockButtonTitle}
              </button>

              <button type="button" className="cancel-button" onClick={blockCancelHandler}>
                Cancel
              </button>
            </div>
          </form>
        );
      }
      case BedMasterPopupName?.FLOOR: {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = floorForm;
        return (
          <form className="form-grid-1" onSubmit={handleSubmit(floorSubmitHandler)}>
            <InputField label="Floor Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter floor name"
                {...register("floorName")}
              />
              {errors.floorName && <p className="input-field-error">{errors.floorName.message}</p>}
            </InputField>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {floorButtonTitle}
              </button>

              <button type="button" className="cancel-button" onClick={floorCancelHandler}>
                Cancel
              </button>
            </div>
          </form>
        );
      }
      case BedMasterPopupName?.WARD: {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = wardForm;

        return (
          <form className="form-grid-1" onSubmit={handleSubmit(wardSubmitHandler)}>
            <InputField label="Ward Name/Number" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter ward name or number"
                {...register("wardName")}
              />
              {errors.wardName && <p className="input-field-error">{errors.wardName.message}</p>}
            </InputField>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {wardButtonTitle}
              </button>

              <button type="button" className="cancel-button" onClick={wardCancelHandler}>
                Cancel
              </button>
            </div>
          </form>
        );
      }
      default:
        return;
    }
  };
  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">
            {popupName === BedMasterPopupName?.FLOOR
              ? `${floorButtonTitle} Floor`
              : popupName === BedMasterPopupName?.WARD
                ? `${wardButtonTitle} Ward`
                : popupName === BedMasterPopupName?.BLOCK
                  ? `${blockButtonTitle} Block`
                  : null}
          </h2>

          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        {/* render component */}
        {renderComponent(popupName)}
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(CreateUpdateFloorWard);
