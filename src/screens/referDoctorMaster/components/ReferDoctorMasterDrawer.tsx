import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useScrollLock } from "@/hooks/useScrollLock";
import { referDoctorMasterSchema } from "@/validation/referDoctorMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { number } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { ProNameItem, ReferDoctorMasterDrawerProps, TitleItem } from "../types";
import ProNamePopUp from "./ProNamePopup";
type ReferDoctorFormItem = InferType<typeof referDoctorMasterSchema>;

const ReferDoctorMasterDrawer = ({
  isOpen,
  onClose,
  referDoctorId,
  onCloseDrawer,
}: ReferDoctorMasterDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const drawerTitle = referDoctorId ? "Update" : "Create";

  const [proNameLists, setProNameLists] = useState<ProNameItem[]>([]);
  const [selectedProId, setSelectedProId] = useState<number | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [defaultTitle, setDefaultTitle] = useState<TitleItem>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(referDoctorMasterSchema),
    defaultValues: {
      referDoctorId: 0,
      title: "",
      name: "",
      doctorContacNo: "",
      clinicName: "",
      address: "",
      proId: 0,
      active: 1,
    },
  });
  const currentProId = watch("proId");

  useScrollLock(isOpen);

  /*-----------------title------------------ */
  const title = usePickMaster("title");
  const titleLists = title?.pickMasterValue ?? [];

  useEffect(() => {
    if (!titleLists.length) return;

    const dt = titleLists.find((item: TitleItem) => item?.value?.includes("Mr."));
    if (dt) {
      setDefaultTitle(dt?.value);
      setValue("title", dt?.value);
    }
  }, [titleLists, setValue]);

  /*---------------pro list---------------- */
  const getProLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PRO_LIST,
      {},
      {},
      { component: "ReferDoctorMasterDrawer" }
    );
    setProNameLists(resp?.data ?? []);
  };

  useEffect(() => {
    getProLists();
  }, []);

  /*-------------------refer doctor for edit---------------- */
  const getReferDoctorById = useCallback(
    async (referDoctorId: number | undefined) => {
      if (!number) return;
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_REFER_DOCTOR_LIST,
        {},
        { params: { referDoctorId } },
        { component: "ReferDoctorMasterDrawer" }
      );
      const referDoc = resp?.data?.[0];

      reset({
        referDoctorId: referDoc?.referDoctorId || 0,
        title: referDoc?.title || "",
        name: referDoc?.name || "",
        doctorContacNo: referDoc?.contactNo || "",
        clinicName: referDoc?.clinicName || "",
        address: referDoc?.address || "",
        proId: referDoc?.proId || 0,
        active: referDoc?.isActive || 1,
      });
    },
    [reset]
  );

  useEffect(() => {
    if (referDoctorId) {
      getReferDoctorById(referDoctorId);
    }
  }, [referDoctorId]);

  /*---------------------submit handler----------------- */
  const onSubmit = async (formData: ReferDoctorFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_REFER_DOCTOR,
      formData,
      {},
      { component: "ReferDoctorMasterDrawer" }
    );
    if (!resp) return;

    if (resp?.result) {
      setSuccessMessage(resp?.message || "Saved successfully");

      onCloseDrawer?.();
      timerRef.current = setTimeout(() => {
        onClose?.();
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  /*---------------popup handler-------------- */

  const proNamePopupHandler = useCallback(() => {
    const proIdToEdit = !!currentProId && currentProId !== 0 ? Number(currentProId) : null;
    setSelectedProId(proIdToEdit);
    setRenderPopup(true);
    requestAnimationFrame(() => {
      setOpenPopup(true);
    });
  }, [currentProId]);

  const closeHandler = useCallback(() => {
    setOpenPopup(false);
  }, []);

  useEffect(() => {
    if (openPopup) return;

    const closeTimer = setTimeout(() => {
      setRenderPopup(false);
    }, 300);

    return () => clearTimeout(closeTimer);
  }, [openPopup]);

  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div className={`drawer-layout drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="drawer-title-border">
            <h2 className="drawer-title">{drawerTitle} Refer Doctor Master</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          {successMessage ? <SuccessMessage text={successMessage} /> : <></>}
          {error ? <ErrorMessage text={error?.message} /> : <></>}

          <div className=" card m-1">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid-2">
                <InputField label="Title" required>
                  <select className="input-field" {...register("title")}>
                    <option value="">Select</option>
                    {titleLists?.map(l => (
                      <option key={l?.value} value={l?.value}>
                        {l?.value}
                      </option>
                    ))}
                  </select>
                  {errors.title && <p className="input-field-error">{errors.title.message}</p>}
                </InputField>

                <InputField label="Doctor Name" required>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contact number "
                    {...register("name")}
                  />
                  {errors.name && <p className="input-field-error">{errors.name.message}</p>}
                </InputField>

                <InputField label="Contact No" required>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contact number "
                    {...register("doctorContacNo")}
                  />
                  {errors.doctorContacNo && (
                    <p className="input-field-error">{errors.doctorContacNo.message}</p>
                  )}
                </InputField>

                <InputField label="Clinic Name">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter clinic name "
                    {...register("clinicName")}
                  />
                  {errors.clinicName && (
                    <p className="input-field-error">{errors.clinicName.message}</p>
                  )}
                </InputField>

                <InputField label="Address">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter clinic name "
                    {...register("address")}
                  />
                  {errors.address && <p className="input-field-error">{errors.address.message}</p>}
                </InputField>

                <InputField label="Pro Name" required>
                  <div className="flex gap-2 items-center">
                    <select
                      className="input-field"
                      required
                      {...register("proId", { valueAsNumber: true })}
                    >
                      <option value={0}>Select</option>

                      {proNameLists?.map(p => (
                        <option key={p?.proId} value={p?.proId}>
                          {p?.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={proNamePopupHandler}>
                      <i className="fa-solid fa-circle-plus fa-xl"></i>
                    </button>
                  </div>
                  {errors.proId && <p className="input-field-error">{errors.proId.message}</p>}
                </InputField>

                <InputField label="Status" required>
                  <select className="input-field  " {...register("active")}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                  {errors.active && <p className="input-field-error">{errors.active.message}</p>}
                </InputField>
              </div>
              <div className="form-actions-responsive mt-5">
                <button type="submit" className="save-btn">
                  {drawerTitle}
                </button>
                <button type="button" className="cancel-button ">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {renderPopup ? (
            <ProNamePopUp
              isOpen={openPopup}
              onClose={closeHandler}
              proId={selectedProId}
              refreshProName={getProLists}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
      {!!loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>,
    document.body
  );
};

export default memo(ReferDoctorMasterDrawer);
