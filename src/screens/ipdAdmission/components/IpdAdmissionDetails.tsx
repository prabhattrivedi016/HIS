import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import CustomTimePicker from "@/components/timePicker";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { ipdAdmissionSchema } from "@/validation/ipdAdmissionSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import Select, { MultiValue, SingleValue, StylesConfig } from "react-select";
import ProNamePopUp from "../../referDoctorMaster/components/ProNamePopup";
import {
  AvailableBedItem,
  BillingTypeItem,
  CorporateItem,
  DoctorItem,
  InsuranceItem,
  IpdAdmissionDetailsHandle,
  IpdAdmissionFormValues,
  PickMasterItem,
  ProNameItem,
  ReferDoctorItem,
  SelectOption,
  SpecializationItem,
} from "../types";

const getToday = (): string => new Date().toISOString().split("T")[0];

const getCurrentTimeLabel = (): string => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
};

const defaultFormValues = (currentDate: string, currentTime: string): IpdAdmissionFormValues => ({
  insuranceCompanyId: 0,
  corporateId: 0,
  specializationId: 0,
  primaryDoctorId: 0,
  secondaryDoctorIds: [],
  referDoctorId: 0,
  proId: 0,
  proName: "",
  billingTypeId: 0,
  roomTypeId: 0,
  bedId: 0,

  admissionDate: currentDate,
  admissionTime: currentTime,

  attendantRelation: "",
  attendantName: "",
  attendantContactNumber: "",

  handleWithCare: 0,
  nameMasking: 0,

  admissionType: "",

  mlcNo: "",
  mlcTypeId: 0,
  mlcType: "",

  injuryTypeId: 0,
  injuryType: "",

  broughtBy: "",
  transportId: 0,
  transport: "",

  placeOfAccident: "",
  policeStation: "",
  officerName: "",
  officerPhone: "",

  complaintNo: "",
  buckleNoOfPolice: "",

  dateOfInjury: currentDate,
  dateOfInitiation: currentDate,

  causeOfAccident: "",
  identificationMarks: "",
  remarks: "",
});

const getPickMasterId = (item?: PickMasterItem): number => {
  if (!item) return 0;
  const parsed = Number(item.key);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const DEFAULT_CASH_CORPORATE: CorporateItem = {
  corporateId: 1,
  corporateName: "CASH",
  insuranceCompanyId: 0,
  isActive: 1,
};

const EMPTY_CORPORATE_LIST: CorporateItem[] = [];

const isBedAvailable = (status?: {
  currentStatus?: number;
  isAvailable?: number;
  isOccupid?: number;
  isOccupied?: number;
}) => {
  if (!status) return false;

  return (
    Number(status.currentStatus ?? -1) === 0 &&
    Number(status.isAvailable ?? 0) === 1 &&
    Number(status.isOccupid ?? status.isOccupied ?? 1) === 0
  );
};

interface IpdAdmissionDetailsProps {
  patientDetails?: Record<string, unknown> | null;
}

const IpdAdmissionDetails = forwardRef<IpdAdmissionDetailsHandle, IpdAdmissionDetailsProps>(
  ({ patientDetails }, ref) => {
    const { fetchApi } = useGlobalApi();
    const branchId = useContext(AuthContext)?.user?.branchId ?? 1;

    const {
      register,
      watch,
      setValue,
      reset,
      trigger,
      getValues,
      formState: { errors },
    } = useForm<IpdAdmissionFormValues>({
      resolver: yupResolver(ipdAdmissionSchema),
      defaultValues: defaultFormValues(getToday(), getCurrentTimeLabel()),
    });

    const [renderProPopup, setRenderProPopup] = useState(false);
    const [openProPopup, setOpenProPopup] = useState(false);
    const [selectedProId, setSelectedProId] = useState<number | null>(null);

    const admissionType = watch("admissionType");
    const insuranceCompanyId = watch("insuranceCompanyId");
    const specializationId = watch("specializationId");
    const primaryDoctorId = watch("primaryDoctorId");
    const secondaryDoctorIds = watch("secondaryDoctorIds") ?? [];
    const currentProId = watch("proId");
    const handleWithCare = watch("handleWithCare");
    const nameMasking = watch("nameMasking");

    const admissionTypeList = usePickMaster("AdmissionType")?.pickMasterValue ?? [];
    const isMlcAdmission =
      admissionType === "MLC" ||
      admissionTypeList.some(
        item =>
          (item.key === admissionType || item.value === admissionType) &&
          (item.key === "MLC" || item.value === "MLC")
      );
    const mlcTypeList = usePickMaster("MLCType")?.pickMasterValue ?? [];
    const transportTypeList = usePickMaster("TransportType")?.pickMasterValue ?? [];
    const injuryTypeList = usePickMaster("InjuryType")?.pickMasterValue ?? [];
    const attendantRelationList = usePickMaster("PatientRelation")?.pickMasterValue ?? [];

    // insurance company list
    const getInsuranceList = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_ALL_INSURANCE_COMPANY_LIST,
        {},
        {},
        { component: "IpdAdmission" }
      );
      return (resp?.data ?? []) as InsuranceItem[];
    };

    const { data: insuranceList = [] } = useQuery({
      queryKey: ["ipdAdmissionInsuranceList"],
      queryFn: getInsuranceList,
    });

    // corporate list
    const getCorporateList = async (insuranceCompanyId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CORPORATE_LIST_BY_BRANCH_ID_AND_INSURANCE_COMPANY_ID,
        {},
        { params: { branchId, insuranceCompanyId } },
        { component: "IpdAdmission" }
      );
      return (resp?.data ?? []) as CorporateItem[];
    };

    const { data: corporateList = EMPTY_CORPORATE_LIST } = useQuery({
      queryKey: ["ipdAdmissionCorporateList", branchId, insuranceCompanyId],
      queryFn: () => getCorporateList(Number(insuranceCompanyId)),
      enabled: Number(insuranceCompanyId) > 0,
    });

    // specialization list
    const getSpecializationList = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_DOCTOR_SPECIALIZATION_LIST,
        {},
        {},
        { component: "IpdAdmission", silent: true }
      );
      return (resp?.data ?? []) as SpecializationItem[];
    };

    const { data: specializationList = [] } = useQuery({
      queryKey: ["ipdAdmissionSpecializationList"],
      queryFn: getSpecializationList,
    });

    // doctor list
    const getDoctorList = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_DOCTOR_MASTER,
        {},
        { params: { isDoctorUnit: Status.INACTIVE } },
        { component: "IpdAdmission" }
      );
      return (resp?.data ?? []) as DoctorItem[];
    };

    const { data: doctorList = [] } = useQuery({
      queryKey: ["ipdAdmissionDoctorList"],
      queryFn: getDoctorList,
    });

    // refer doctor list
    const getReferDoctorList = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_REFER_DOCTOR_LIST,
        {},
        {},
        { component: "IpdAdmission" }
      );
      return (resp?.data ?? []) as ReferDoctorItem[];
    };

    const { data: referDoctorList = [] } = useQuery({
      queryKey: ["ipdAdmissionReferDoctorList"],
      queryFn: getReferDoctorList,
    });

    // pro list
    const getProList = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PRO_LIST,
        {},
        {},
        { component: "IpdAdmission" }
      );
      return (resp?.data ?? []) as ProNameItem[];
    };

    const { data: proList = [], refetch: refetchProList } = useQuery({
      queryKey: ["ipdAdmissionProList"],
      queryFn: getProList,
    });

    // billing type list
    const getBillingTypeList = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_BED_TYPES,
        {},
        { params: { roomTypeId: 1, branchId } },
        { component: "IpdAdmission" }
      );
      return (resp?.data?.bedTypes ?? []) as BillingTypeItem[];
    };

    const { data: billingTypeList = [] } = useQuery({
      queryKey: ["ipdAdmissionBillingTypeList", branchId],
      queryFn: getBillingTypeList,
    });

    const typeId = watch("roomTypeId");

    const getAvailableBedsList = async () => {
      if (!typeId) return [];

      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_AVAILABLE_BEDS,
        {},
        { params: { branchId, typeId: Number(typeId) } },
        { component: "IpdAdmission" }
      );
      return (resp?.data ?? []) as AvailableBedItem[];
    };

    const { data: roomList = [] } = useQuery({
      queryKey: ["getAvailableBedsList", branchId, typeId],
      queryFn: getAvailableBedsList,
      enabled: Boolean(typeId),
    });

    const corporateOptions = useMemo(() => {
      if (!insuranceCompanyId) {
        const cashFromList = corporateList.find(
          item =>
            item.corporateId === DEFAULT_CASH_CORPORATE.corporateId ||
            item.corporateName?.toUpperCase().includes("CASH")
        );

        return [cashFromList ?? DEFAULT_CASH_CORPORATE];
      }

      return corporateList;
    }, [corporateList, insuranceCompanyId]);

    const filteredDoctors = useMemo(() => {
      if (!specializationId) {
        return doctorList;
      }
      return doctorList.filter(item => item.specializationId === Number(specializationId));
    }, [doctorList, specializationId]);

    const primaryDoctorOptions = useMemo<SelectOption[]>(
      () =>
        filteredDoctors.map(item => ({
          value: item.doctorId,
          label: item.completeName,
        })),
      [filteredDoctors]
    );

    const secondaryDoctorOptions = useMemo<SelectOption[]>(
      () =>
        filteredDoctors
          .filter(item => item.doctorId !== Number(primaryDoctorId))
          .map(item => ({
            value: item.doctorId,
            label: item.completeName,
          })),
      [filteredDoctors, primaryDoctorId]
    );

    const referDoctorOptions = useMemo<SelectOption[]>(
      () =>
        referDoctorList.map(item => ({
          value: item.referDoctorId,
          label: item.doctorName,
        })),
      [referDoctorList]
    );

    const proOptions = useMemo<SelectOption[]>(
      () =>
        proList.map(item => ({
          value: item.proId,
          label: item.name,
        })),
      [proList]
    );

    const selectedPrimaryDoctor =
      primaryDoctorOptions.find(item => item.value === Number(primaryDoctorId)) ?? null;

    const selectedSecondaryDoctors = useMemo(
      () =>
        secondaryDoctorOptions.filter(
          option => secondaryDoctorIds.includes(option.value) && option.value > 0
        ),
      [secondaryDoctorOptions, secondaryDoctorIds]
    );

    const selectedReferDoctor =
      referDoctorOptions.find(item => item.value === Number(watch("referDoctorId"))) ?? null;

    const selectedPro = proOptions.find(item => item.value === Number(currentProId)) ?? null;

    const validateBedStatus = useCallback(async (bedId: number) => {
      if (!bedId) return true;

      const resp = await fetchApi(
        "GET",
        ENDPOINTS.CHECK_BED_STATUS,
        {},
        { params: { bedId } },
        { component: "IpdAdmission", silent: true }
      );

      if (!isBedAvailable(resp?.data)) {
        showWarning("This bed is already occupied");
        return false;
      }

      return true;
    }, []);

    useImperativeHandle(ref, () => ({
      validateForm: () => trigger(),
      validateBedSelection: async () => validateBedStatus(Number(getValues("bedId") ?? 0)),
      getValues,
      resetForm: () => reset(defaultFormValues(getToday(), getCurrentTimeLabel())),
    }));

    useEffect(() => {
      if (!patientDetails || Object.keys(patientDetails).length === 0) return;

      const insId = Number(
        patientDetails.insuranceCompanyId ?? patientDetails.InsuranceCompanyId ?? 0
      );
      const corpId = Number(patientDetails.corporateId ?? patientDetails.CorporateId ?? 0);

      setValue("insuranceCompanyId", insId, { shouldValidate: true });
      setValue("corporateId", corpId, { shouldValidate: true });
    }, [patientDetails, setValue]);

    useEffect(() => {
      if (Number(insuranceCompanyId) > 0) return;

      const cashCorporate =
        corporateList.find(
          item =>
            item.corporateId === DEFAULT_CASH_CORPORATE.corporateId ||
            item.corporateName?.toUpperCase().includes("CASH")
        ) ?? DEFAULT_CASH_CORPORATE;

      const currentCorporateId = Number(getValues("corporateId") ?? 0);
      if (currentCorporateId === cashCorporate.corporateId) return;

      setValue("corporateId", cashCorporate.corporateId, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }, [insuranceCompanyId, corporateList, getValues, setValue]);

    useEffect(() => {
      if (Number(getValues("bedId") ?? 0) === 0) return;

      setValue("bedId", 0, { shouldDirty: false, shouldValidate: false });
    }, [typeId, getValues, setValue]);

    useEffect(() => {
      if (!Number(primaryDoctorId)) return;

      const filteredIds = secondaryDoctorIds.filter(
        id => Number(id) > 0 && Number(id) !== Number(primaryDoctorId)
      );

      if (filteredIds.length === secondaryDoctorIds.length) return;

      setValue("secondaryDoctorIds", filteredIds, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }, [primaryDoctorId, secondaryDoctorIds, setValue]);

    useEffect(() => {
      if (openProPopup) return;

      const closeTimer = setTimeout(() => {
        setRenderProPopup(false);
      }, 300);

      return () => clearTimeout(closeTimer);
    }, [openProPopup]);

    const selectHandler =
      (field: keyof IpdAdmissionFormValues) => (option: SingleValue<SelectOption>) => {
        setValue(field, Number(option?.value ?? 0) as never, { shouldValidate: true });
      };

    const primaryDoctorSelectHandler = (option: SingleValue<SelectOption>) => {
      setValue("primaryDoctorId", Number(option?.value ?? 0), { shouldValidate: true });
    };

    const secondaryDoctorSelectHandler = (options: MultiValue<SelectOption>) => {
      const ids = options.map(option => option.value).filter(id => id > 0);
      setValue("secondaryDoctorIds", ids, { shouldValidate: true });
    };

    const proSelectHandler = (option: SingleValue<SelectOption>) => {
      setValue("proId", Number(option?.value ?? 0), { shouldValidate: true });
      setValue("proName", option?.label ?? "", { shouldValidate: true });
    };

    const proNamePopupHandler = useCallback(() => {
      const proIdToEdit = currentProId && currentProId !== 0 ? Number(currentProId) : null;
      setSelectedProId(proIdToEdit);
      setRenderProPopup(true);
      requestAnimationFrame(() => {
        setOpenProPopup(true);
      });
    }, [currentProId]);

    const closeProPopupHandler = useCallback(() => {
      setOpenProPopup(false);
    }, []);

    const refreshProNameList = useCallback(async () => {
      await refetchProList();
    }, [refetchProList]);

    const pickMasterSelectHandler = (
      fieldId: "mlcTypeId" | "injuryTypeId" | "transportId",
      fieldName: "mlcType" | "injuryType" | "transport",
      list: PickMasterItem[],
      selectedKey: string
    ) => {
      const selectedItem = list.find(item => item.key === selectedKey);
      setValue(fieldId, getPickMasterId(selectedItem), { shouldValidate: true });
      setValue(fieldName, selectedItem?.value ?? selectedKey, { shouldValidate: true });
    };

    const bedSelectHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
      const bedId = Number(e.target.value);
      if (!bedId) {
        setValue("bedId", 0, { shouldValidate: true });
        return;
      }

      const isAvailable = await validateBedStatus(bedId);
      if (!isAvailable) {
        setValue("bedId", 0, { shouldValidate: true });
        return;
      }

      setValue("bedId", bedId, { shouldValidate: true });
    };

    return (
      <div className="space-y-4 pb-24">
        <div className="card">
          <div className="form-grid-4">
            <InputField label="Insurance Company">
              <select
                className="input-field"
                value={insuranceCompanyId ?? 0}
                onChange={e => {
                  const value = Number(e.target.value);
                  setValue("insuranceCompanyId", value, { shouldValidate: true });
                  if (!value) {
                    setValue("corporateId", DEFAULT_CASH_CORPORATE.corporateId, {
                      shouldValidate: true,
                    });
                  } else {
                    setValue("corporateId", 0, { shouldValidate: true });
                  }
                }}
              >
                <option value={0}>Self</option>
                {insuranceList.map(item => (
                  <option key={item.insuranceCompanyId} value={item.insuranceCompanyId}>
                    {item.insuranceCompanyName}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Corporate">
              <select
                className="input-field"
                value={watch("corporateId") ?? 0}
                disabled={Boolean(insuranceCompanyId) && corporateOptions.length === 0}
                onChange={e =>
                  setValue("corporateId", Number(e.target.value), { shouldValidate: true })
                }
              >
                <option value={0}>Select corporate</option>
                {corporateOptions.map(item => (
                  <option key={item.corporateId} value={item.corporateId}>
                    {item.corporateName}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Doctor Specialization">
              <select
                className="input-field"
                value={specializationId ?? 0}
                onChange={e => {
                  setValue("specializationId", Number(e.target.value), { shouldValidate: true });
                  setValue("primaryDoctorId", 0, { shouldValidate: true });
                  setValue("secondaryDoctorIds", [], { shouldValidate: true });
                }}
              >
                <option value={0}>All</option>
                {specializationList.map(item => (
                  <option key={item.specializationId} value={item.specializationId}>
                    {item.specialization}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Primary Doctor" required>
              <Select<SelectOption, false>
                value={selectedPrimaryDoctor}
                options={primaryDoctorOptions}
                placeholder="Select primary doctor"
                isSearchable
                isClearable
                onChange={primaryDoctorSelectHandler}
                styles={SelectStyles as StylesConfig<SelectOption, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.primaryDoctorId && (
                <p className="input-field-error">{errors.primaryDoctorId.message}</p>
              )}
            </InputField>

            <InputField label="Secondary Doctor">
              <Select<SelectOption, true>
                value={selectedSecondaryDoctors}
                options={secondaryDoctorOptions}
                placeholder="Select secondary doctors"
                isSearchable
                isClearable
                isMulti
                closeMenuOnSelect={false}
                onChange={secondaryDoctorSelectHandler}
                styles={SelectStyles as StylesConfig<SelectOption, true>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Refer Doctor">
              <Select<SelectOption, false>
                value={selectedReferDoctor}
                options={referDoctorOptions}
                placeholder="Select refer doctor"
                isSearchable
                isClearable
                onChange={selectHandler("referDoctorId")}
                styles={SelectStyles as StylesConfig<SelectOption, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="PRO Name">
              <div className="flex gap-2 items-center">
                <Select<SelectOption, false>
                  value={selectedPro}
                  options={proOptions}
                  placeholder="Select PRO"
                  isSearchable
                  isClearable
                  onChange={proSelectHandler}
                  styles={SelectStyles as StylesConfig<SelectOption, false>}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  className="flex-1"
                />
                <button type="button" onClick={proNamePopupHandler} className="shrink-0">
                  <i className="fa-solid fa-circle-plus fa-xl"></i>
                </button>
              </div>
            </InputField>

            <InputField label="Billing Type" required>
              <select
                className="input-field"
                value={watch("billingTypeId") ?? 0}
                onChange={e =>
                  setValue("billingTypeId", Number(e.target.value), { shouldValidate: true })
                }
              >
                <option value={0}>Select billing type</option>
                {billingTypeList.map(item => (
                  <option key={item.typeId} value={item.typeId}>
                    {item.roomTypeName}
                  </option>
                ))}
              </select>
              {errors.billingTypeId && (
                <p className="input-field-error">{errors.billingTypeId.message}</p>
              )}
            </InputField>

            <InputField label="Room Type" required>
              <select
                className="input-field"
                value={watch("roomTypeId") ?? 0}
                onChange={e => {
                  setValue("roomTypeId", Number(e.target.value), { shouldValidate: true });
                  setValue("bedId", 0, { shouldValidate: true });
                }}
              >
                <option value={0}>Select room type</option>
                {billingTypeList.map(item => (
                  <option key={item?.typeId} value={item?.typeId}>
                    {item?.roomTypeName} | Avl: {item?.availableBeds ?? 0} | Occ:{" "}
                    {item?.occupiedBeds ?? 0}
                  </option>
                ))}
              </select>
              {errors.roomTypeId && (
                <p className="input-field-error">{errors.roomTypeId.message}</p>
              )}
            </InputField>

            <InputField label="Room/Bed" required>
              <select
                className="input-field"
                value={watch("bedId") ?? 0}
                disabled={!typeId}
                onChange={bedSelectHandler}
              >
                <option value={0}>Select room/bed</option>
                {roomList.map(item => (
                  <option key={item.bedId} value={item.bedId}>
                    {item.bedName} ({item.gender})
                  </option>
                ))}
              </select>
              {errors.bedId && <p className="input-field-error">{errors.bedId.message}</p>}
            </InputField>

            <InputField label="Attender Title">
              <select
                className="input-field"
                value={watch("attendantRelation") ?? ""}
                onChange={e =>
                  setValue("attendantRelation", e.target.value, { shouldValidate: true })
                }
              >
                <option value="">Select title</option>
                {attendantRelationList.map(item => (
                  <option key={item.key} value={item.key}>
                    {item.value}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Attender Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter attender name"
                {...register("attendantName")}
              />
            </InputField>

            <InputField label="Attender Contact Number">
              <input
                type="text"
                className="input-field"
                placeholder="Enter attender contact number"
                maxLength={10}
                {...register("attendantContactNumber")}
                onInput={allowOnlyNumbers}
              />
              {errors.attendantContactNumber && (
                <p className="input-field-error">{errors.attendantContactNumber.message}</p>
              )}
            </InputField>

            <InputField label="Admission Type">
              <select
                className="input-field"
                value={admissionType ?? ""}
                onChange={e => setValue("admissionType", e.target.value, { shouldValidate: true })}
              >
                <option value="">Select admission type</option>
                {admissionTypeList.map(item => (
                  <option key={item.key} value={item.key}>
                    {item.value}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Admission Date" required>
              <CustomDateInput
                value={watch("admissionDate")}
                onChange={(value: string) =>
                  setValue("admissionDate", value, { shouldValidate: true })
                }
              />
              {errors.admissionDate && (
                <p className="input-field-error">{errors.admissionDate.message}</p>
              )}
            </InputField>

            <InputField label="Admission Time" required>
              <CustomTimePicker
                value={watch("admissionTime")}
                onChange={(value: string) =>
                  setValue("admissionTime", value, { shouldValidate: true })
                }
              />
              {errors.admissionTime && (
                <p className="input-field-error">{errors.admissionTime.message}</p>
              )}
            </InputField>

            <div className="flex gap-2 mt-7 ">
              <input
                type="checkbox"
                className="input-checkbox mt-2"
                checked={Number(handleWithCare) === 1}
                onChange={e => setValue("handleWithCare", e.target.checked ? 1 : 0)}
              />
              <label className="input-label mt-1 font-bold">Handle With Care</label>

              <input
                type="checkbox"
                className="input-checkbox mt-2"
                checked={Number(nameMasking) === 1}
                onChange={e => setValue("nameMasking", e.target.checked ? 1 : 0)}
              />
              <label className="input-label mt-1 font-bold">Name Masking</label>
            </div>
          </div>
        </div>

        {isMlcAdmission && (
          <div className="card -mt-3">
            <div className="card-header">
              <h2 className="card-title">MLC Details</h2>
            </div>

            <div className="form-grid-4">
              <InputField label="MLC Number" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter MLC number"
                  {...register("mlcNo")}
                />
                {errors.mlcNo && <p className="input-field-error">{errors.mlcNo.message}</p>}
              </InputField>

              <InputField label="MLC Type" required>
                <select
                  className="input-field"
                  value={
                    mlcTypeList.find(item => getPickMasterId(item) === Number(watch("mlcTypeId")))
                      ?.key ?? ""
                  }
                  onChange={e =>
                    pickMasterSelectHandler("mlcTypeId", "mlcType", mlcTypeList, e.target.value)
                  }
                >
                  <option value="">Select MLC type</option>
                  {mlcTypeList.map(item => (
                    <option key={item.key} value={item.key}>
                      {item.value}
                    </option>
                  ))}
                </select>
                {errors.mlcType && <p className="input-field-error">{errors.mlcType.message}</p>}
              </InputField>

              <InputField label="Injury Type" required>
                <select
                  className="input-field"
                  value={
                    injuryTypeList.find(
                      item => getPickMasterId(item) === Number(watch("injuryTypeId"))
                    )?.key ?? ""
                  }
                  onChange={e =>
                    pickMasterSelectHandler(
                      "injuryTypeId",
                      "injuryType",
                      injuryTypeList,
                      e.target.value
                    )
                  }
                >
                  <option value="">Select injury type</option>
                  {injuryTypeList.map(item => (
                    <option key={item.key} value={item.key}>
                      {item.value}
                    </option>
                  ))}
                </select>
                {errors.injuryType && (
                  <p className="input-field-error">{errors.injuryType.message}</p>
                )}
              </InputField>

              <InputField label="Brought By">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter brought by"
                  {...register("broughtBy")}
                />
              </InputField>

              <InputField label="Transport">
                <select
                  className="input-field"
                  value={
                    transportTypeList.find(
                      item => getPickMasterId(item) === Number(watch("transportId"))
                    )?.key ?? ""
                  }
                  onChange={e =>
                    pickMasterSelectHandler(
                      "transportId",
                      "transport",
                      transportTypeList,
                      e.target.value
                    )
                  }
                >
                  <option value="">Select transport</option>
                  {transportTypeList.map(item => (
                    <option key={item.key} value={item.key}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </InputField>

              <InputField label="Place Of Accident">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter place of accident"
                  {...register("placeOfAccident")}
                />
              </InputField>

              <InputField label="Police Station">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter police station"
                  {...register("policeStation")}
                />
              </InputField>

              <InputField label="Officer Name">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter officer name"
                  {...register("officerName")}
                />
              </InputField>

              <InputField label="Officer Phone" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter officer phone"
                  maxLength={10}
                  {...register("officerPhone")}
                  onInput={allowOnlyNumbers}
                />
                {errors.officerPhone && (
                  <p className="input-field-error">{errors.officerPhone.message}</p>
                )}
              </InputField>

              <InputField label="Complaint Number">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter complaint number"
                  {...register("complaintNo")}
                />
              </InputField>

              <InputField label="Buckle Number Of Police">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter buckle number"
                  {...register("buckleNoOfPolice")}
                />
              </InputField>

              <InputField label="Date Of Injury">
                <CustomDateInput
                  value={watch("dateOfInjury") ?? ""}
                  onChange={(value: string) =>
                    setValue("dateOfInjury", value, { shouldValidate: true })
                  }
                />
              </InputField>

              <InputField label="Date Of Intimation">
                <CustomDateInput
                  value={watch("dateOfInitiation") ?? ""}
                  onChange={(value: string) =>
                    setValue("dateOfInitiation", value, { shouldValidate: true })
                  }
                />
              </InputField>

              <InputField label="Cause Of Accident">
                <textarea
                  className="input-field"
                  placeholder="Enter cause of accident"
                  rows={2}
                  {...register("causeOfAccident")}
                />
              </InputField>

              <InputField label="Identification">
                <textarea
                  className="input-field"
                  placeholder="Enter identification details"
                  rows={2}
                  {...register("identificationMarks")}
                />
              </InputField>

              <InputField label="Remarks">
                <textarea
                  className="input-field"
                  placeholder="Enter remarks"
                  rows={2}
                  {...register("remarks")}
                />
              </InputField>
            </div>
          </div>
        )}

        {renderProPopup ? (
          <ProNamePopUp
            isOpen={openProPopup}
            onClose={closeProPopupHandler}
            proId={selectedProId}
            refreshProName={refreshProNameList}
          />
        ) : null}
      </div>
    );
  }
);

IpdAdmissionDetails.displayName = "IpdAdmissionDetails";

export default IpdAdmissionDetails;
