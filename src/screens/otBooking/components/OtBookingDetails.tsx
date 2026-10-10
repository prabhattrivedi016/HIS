import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import RemoveIconButton from "@/components/globalButtons/RemoveIconButton";
import InputFieldModal from "@/components/inputFieldModal";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import CustomTimePicker from "@/components/timePicker";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem, SubSubCategoryItem } from "@/types";
import { showWarning } from "@/utils/alert";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import Select, { ActionMeta, GroupBase, MultiValue, SingleValue, StylesConfig } from "react-select";
import { convertTo24HourFormat } from "..";
import {
  BloodGroupItem,
  CategoryItem,
  DoctorByBranchItem,
  EquipmentItem,
  OtMasterItem,
  PaylaodValueItem,
  ServiceItemList,
  ServiceTableItem,
  SubCategoryItem,
  UserMasterItem,
} from "../types";

const OtBookingDetails = ({
  setPayloadValue,
  payloadValue,
  serviceTableItemList,
  setServiceTableItemList,
  isMainSurgery,
}: {
  setPayloadValue: React.Dispatch<React.SetStateAction<PaylaodValueItem>>;
  payloadValue: PaylaodValueItem;
  serviceTableItemList: ServiceTableItem[];
  setServiceTableItemList: React.Dispatch<React.SetStateAction<ServiceTableItem[]>>;
  isMainSurgery: number;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const { branchId } = useContext(BranchContext);

  const anesthesiaTypeList = usePickMaster("AnesthesiaType")?.pickMasterValue ?? [];

  console.log("anesthesiaTypeList", anesthesiaTypeList);

  const [thearterLists, setTheaterList] = useState<OtMasterItem[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryItem[]>([]);
  const [userMasterLists, setUserMasterList] = useState<UserMasterItem[]>([]);
  const [surgeonList, setSurgeonList] = useState<DoctorByBranchItem[]>([]);
  const [anesthetistList, setAnesthetistList] = useState<DoctorByBranchItem[]>([]);
  const [assistantSurgeonList1, setAssistantSurgeonList1] = useState<DoctorByBranchItem[]>([]);
  const [assistantSurgeonList2, setAssistantSurgeonList2] = useState<DoctorByBranchItem[]>([]);
  const [subCategoryList, setSubCategoryList] = useState<SubCategoryItem[]>([]);
  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);

  const [serviceNameList, setServiceNameList] = useState<ServiceItemList[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(0);

  // state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(9);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number>(0);
  const [selectedSubSubCategoryId, setSelectedSubSubCategoryId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [anesthesist, setAnesthesist] = useState<DoctorByBranchItem[]>([]);
  const [asstAnesthesist, setAsstAnesthesist] = useState<DoctorByBranchItem[]>([]);

  const [bloodGroupList, setBloodGroupList] = useState<BloodGroupItem[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);

  // ot master list
  const getOtMasterList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OT_MASTER_LIST,
      {},
      {},
      { component: "OtBookingDetails" }
    );
    setTheaterList(resp?.data ?? []);
  };

  // category lists
  const getCategoryLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryTypeIds: "9" } },
      { component: "OtBookingDetails" }
    );
    setCategoryList(resp?.data ?? []);
  };

  // user master lists
  const getUserMasterLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.USER_MASTER_LIST,
      {},
      { params: { isActive: 1 } },
      { component: "OtBookingDetails" }
    );

    setUserMasterList(resp?.data ?? []);
  };

  // surgeon list
  const getDoctorsLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID,
      {},
      { params: { branchId, isDoctorUnit: 0, departmentTypeId: 1 } },
      { component: "OtBookingDetails" }
    );
    setSurgeonList(resp?.data ?? []);
  };

  // surgeon list
  const getAnesthetistsLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID,
      {},
      { params: { branchId, isDoctorUnit: 0, departmentTypeId: 2 } },
      { component: "OtBookingDetails" }
    );
    setAnesthetistList(resp?.data ?? []);
  };

  // get blood group list
  const getBloodGroupList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PREDEFINE_QUERY_RESULT,
      {},
      { params: { queryName: "GetBloodGroupList" } },
      { component: "OtBookingDetails" }
    );
    setBloodGroupList(resp?.data ?? []);
  };

  useEffect(() => {
    getOtMasterList();
    getCategoryLists();
    getUserMasterLists();
    getDoctorsLists();
    getAnesthetistsLists();
    getBloodGroupList();
    getEquipmentList();
  }, []);

  // auto fill start and end time and date
  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const formattedDate = now.toISOString().split("T")[0];

    setPayloadValue(prev => {
      let updated = false;
      const newPayload = { ...prev };

      if (!prev.otBookingFromTime && !prev.otBookingToTime) {
        newPayload.otBookingFromTime = formattedTime;
        newPayload.otBookingToTime = formattedTime;
        updated = true;
      }

      if (!prev.otBookingDate) {
        newPayload.otBookingDate = formattedDate;
        updated = true;
      }

      return updated ? newPayload : prev;
    });
  }, [setPayloadValue]);

  // different user role
  const getDifferentUserRoles = useMemo(() => {
    const scrubNurses = userMasterLists.filter(item => Number(item?.userRoleId) === 1);
    const circulatingNurses = userMasterLists.filter(item => Number(item?.userRoleId) === 2);
    const otTechnicians = userMasterLists.filter(item => Number(item?.userRoleId) === 3);
    const atTechnicians = userMasterLists.filter(item => Number(item?.userRoleId) === 4);
    const perfusionists = userMasterLists.filter(item => Number(item?.userRoleId) === 5);
    const anesthesiologist = userMasterLists.filter(item => Number(item?.userRoleId) === 6);

    return {
      scrubNurses,
      circulatingNurses,
      otTechnicians,
      atTechnicians,
      perfusionists,
      anesthesiologist,
    };
  }, [userMasterLists]);

  // assistant surgeon 1 list
  useEffect(() => {
    const assistSurgeon = surgeonList.filter(
      item => !(payloadValue?.surgeonIds || []).includes(item.doctorId)
    );
    setAssistantSurgeonList1(assistSurgeon);
  }, [surgeonList, payloadValue?.surgeonIds]);

  // assistant surgeon 1 list

  useEffect(() => {
    const assistSurgeon = surgeonList.filter(
      item =>
        !(payloadValue?.surgeonIds || []).includes(item.doctorId) &&
        item?.doctorId !== payloadValue?.assistantSurgeonId1
    );
    setAssistantSurgeonList2(assistSurgeon);
  }, [surgeonList, payloadValue?.surgeonIds, payloadValue?.assistantSurgeonId1]);

  // Anesthetist
  useEffect(() => {
    const anesthesist = anesthetistList.filter(
      item => item.doctorId !== payloadValue?.assistantAnesthetistId
    );
    setAnesthesist(anesthesist);
  }, [anesthetistList, payloadValue?.assistantAnesthetistId]);

  // Asst Anesthetist
  useEffect(() => {
    const anesthesist1 = anesthetistList.filter(
      item => item.doctorId !== payloadValue?.anesthetistId
    );
    setAsstAnesthesist(anesthesist1);
  }, [anesthetistList, payloadValue?.anesthetistId]);
  // get sub category list
  const getSubCategoryList = async (categoryIds: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      { params: { categoryIds } },
      { component: "OtBookingDetails" }
    );

    setSubCategoryList(resp?.data ?? []);
  };

  useEffect(() => {
    getSubCategoryList(selectedCategoryId);
  }, [selectedCategoryId]);

  // get sub sub category list
  const getSubSubCategoryList = async (subCategoryIds: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      { component: "OtBookingDetails" }
    );
    setSubSubCategoryList(resp?.data ?? []);
  };

  // category change handler
  const categoryChangeHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    if (!value) {
      setSelectedCategoryId(0);
      setSelectedSubCategoryId(0);
      setSelectedSubSubCategoryId(0);
      setSubCategoryList([]);
      setSubSubCategoryList([]);
      return;
    }
    setSelectedCategoryId(value);
    await getSubCategoryList(value);
  };

  // sub category select handler

  const subCategoryChangeHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedSubCategoryId(0);
      setSelectedSubSubCategoryId(0);
      setSubSubCategoryList([]);
      return;
    }
    setSelectedSubCategoryId(value);
    await getSubSubCategoryList(value);
  };

  // sub sub category select handler
  const subSubCategoryChangeHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedSubSubCategoryId(0);
      return;
    }
    setSelectedSubSubCategoryId(value);
  };

  //   service item select handler
  const serviceItemHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setServiceNameList([]);
      setShowPopup(false);
      setActiveServiceIndex(0);
      return;
    }
    setShowPopup(true);
    setActiveServiceIndex(0);
  };

  // debounced api call
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) return;

    const timer = setTimeout(async () => {
      try {
        const resp = await fetchApi(
          "GET",
          ENDPOINTS.GET_SERVICE_ITEM_LIST,
          {},
          {
            params: {
              serviceName: searchTerm,
              categoryId: selectedCategoryId || "2,3,4,5,8,10",
              subCategoryId: selectedSubCategoryId || 0,
              subSubCategoryId: selectedSubSubCategoryId || 0,
              isActive: 1,
            },
          },
          { component: "IpdBillingComponent" }
        );
        if (!resp?.result) {
          showWarning(resp?.message ?? "Service not found!");
          setServiceNameList([]);
          return;
        }

        setServiceNameList(resp?.data ?? []);
        setShowPopup(true);
        setActiveServiceIndex(0);
      } catch (err) {
        console.error(err);
        setShowPopup(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategoryId, selectedSubCategoryId, selectedSubSubCategoryId]);

  // service select handler
  const serviceInputKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPopup || serviceNameList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveServiceIndex(prev => (prev + 1) % serviceNameList.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveServiceIndex(prev => (prev - 1 + serviceNameList.length) % serviceNameList.length);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selectedService = serviceNameList[activeServiceIndex];
      if (selectedService) {
        selectedServiceHandler(selectedService);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setShowPopup(false);
      setActiveServiceIndex(0);
    }
  };

  // service table data
  const selectedServiceHandler = async (item: ServiceItemList) => {
    setShowPopup(false);
    setSearchTerm("");

    if (
      !payloadValue?.otBookingDate ||
      !payloadValue?.otBookingFromTime ||
      !payloadValue?.otBookingToTime
    ) {
      showWarning("Please select Date, Start Time and End Time before adding a service.");
      return;
    }

    const isAlreadyAdded = serviceTableItemList.some(s => s?.serviceItemId === item?.serviceItemId);
    if (isAlreadyAdded) {
      showWarning("Service is already added, Please select another service");
      return;
    }

    const isMain = serviceTableItemList.some(s => s?.isMainSurgery === 1);
    if (isMain && isMainSurgery === 1) {
      showWarning(
        "Main surgery is already added, Please uncheck main surgery checkbox to add  service"
      );
      return;
    }

    setServiceTableItemList((prev: ServiceTableItem[]) => {
      return [
        ...prev,
        {
          serviceItemId: item?.serviceItemId,
          serviceName: item?.name,
          otBookingFromTime: convertTo24HourFormat(payloadValue?.otBookingFromTime),
          otBookingToTime: convertTo24HourFormat(payloadValue?.otBookingToTime),
          isMainSurgery: isMainSurgery,
          date: formatToDDMMYYYY(new Date().toISOString().split("T")[0]),
        },
      ];
    });
  };

  // checkbox change handler
  const checkboxChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (!name) return;
    setPayloadValue((prev: PaylaodValueItem) => ({ ...prev, [name]: checked ? 1 : 0 }));
  };

  // dropdown select handler
  const dropdownSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!name) return;

    if (name === "otTypeId") {
      setPayloadValue(prev => ({
        ...prev,
        otTypeId: Number(value),
        otType: Number(value) === 1 ? "elective" : "emergency",
      }));
      return;
    }

    if (name === "isEquipmentRequest" && Number(value) === 0) {
      setPayloadValue((prev: PaylaodValueItem) => ({
        ...prev,
        [name]: Number(value),
        equipmentServiceItemIds: [],
      }));
      return;
    }

    setPayloadValue((prev: PaylaodValueItem) => ({ ...prev, [name]: Number(value) }));
  };

  // time change handler
  const timeChangeHandler = (value: string, name: string) => {
    setPayloadValue((prev: PaylaodValueItem) => {
      const newPayload = { ...prev, [name]: value };

      if (newPayload.otBookingFromTime && newPayload.otBookingToTime) {
        const parseTime = (timeStr: string) => {
          if (!timeStr) return 0;
          const [time, period] = timeStr.split(" ");
          if (!time || !period) return 0;
          let [h, m] = time.split(":").map(Number);
          if (period === "PM" && h !== 12) h += 12;
          if (period === "AM" && h === 12) h = 0;
          return h * 60 + m;
        };

        const start = parseTime(newPayload.otBookingFromTime);
        const end = parseTime(newPayload.otBookingToTime);

        if (start > 0 && end > 0 && end < start) {
          showWarning("End time cannot be less than start time");
          setTimeout(() => {
            setPayloadValue((p: PaylaodValueItem) => ({
              ...p,
              otBookingToTime: p.otBookingFromTime,
            }));
          }, 0);
        }
      }

      return newPayload;
    });
  };

  // text change handler
  const textChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("namenamenamename", name);
    console.log("valuevaluevaluevalue", value);

    if (!name) return;
    setPayloadValue((prev: PaylaodValueItem) => ({ ...prev, [name]: value }));
  };

  // surgeon & other resource dropdown handler
  const surgeonAndOtherResourceSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!name) return;

    setPayloadValue(prev => ({ ...prev, [name]: Number(value) }));
  };

  // single react-select handler
  const singleReactSelectChangeHandler = (
    selectedOption: SingleValue<{ label: string; value: number }>,
    actionMeta: ActionMeta<{ label: string; value: number }>
  ) => {
    const name = actionMeta.name;
    if (!name) return;
    setPayloadValue((prev: PaylaodValueItem) => ({
      ...prev,
      [name]: selectedOption ? Number(selectedOption.value) : 0,
    }));
  };

  const anesthetistOptions = useMemo(
    () => anesthesist.map(s => ({ label: s?.name, value: s?.doctorId })),
    [anesthesist]
  );
  const asstSurgeon1Options = useMemo(
    () => assistantSurgeonList1.map(s => ({ label: s?.name, value: s?.doctorId })),
    [assistantSurgeonList1]
  );
  const asstSurgeon2Options = useMemo(
    () => assistantSurgeonList2.map(s => ({ label: s?.name, value: s?.doctorId })),
    [assistantSurgeonList2]
  );
  const asstAnesthetistOptions = useMemo(
    () => asstAnesthesist.map(s => ({ label: s?.name, value: s?.doctorId })),
    [asstAnesthesist]
  );
  const perfusionistOptions = useMemo(
    () =>
      getDifferentUserRoles.perfusionists.map(u => ({
        label: `${u?.firstName} ${u?.lastName}`,
        value: u?.id,
      })),
    [getDifferentUserRoles.perfusionists]
  );
  const scrubNurseOptions = useMemo(
    () =>
      getDifferentUserRoles.scrubNurses.map(u => ({
        label: `${u?.firstName} ${u?.lastName}`,
        value: u?.id,
      })),
    [getDifferentUserRoles.scrubNurses]
  );
  const circulatingNurseOptions = useMemo(
    () =>
      getDifferentUserRoles.circulatingNurses.map(u => ({
        label: `${u?.firstName} ${u?.lastName}`,
        value: u?.id,
      })),
    [getDifferentUserRoles.circulatingNurses]
  );
  const otTechnicianOptions = useMemo(
    () =>
      getDifferentUserRoles.otTechnicians.map(u => ({
        label: `${u?.firstName} ${u?.lastName}`,
        value: u?.id,
      })),
    [getDifferentUserRoles.otTechnicians]
  );
  const atTechnicianOptions = useMemo(
    () =>
      getDifferentUserRoles.atTechnicians.map(u => ({
        label: `${u?.firstName} ${u?.lastName}`,
        value: u?.id,
      })),
    [getDifferentUserRoles.atTechnicians]
  );

  // surgeon select options
  const surgeonSelectOptions = useMemo(() => {
    return surgeonList.map(s => ({ label: s?.name, value: s?.doctorId }));
  }, [surgeonList]);

  // selected surgeons value
  const selectedSurgeons = useMemo(() => {
    return surgeonList
      .filter(s => payloadValue?.surgeonIds?.includes(s?.doctorId))
      .map(s => ({ label: s?.name, value: s?.doctorId }));
  }, [surgeonList, payloadValue?.surgeonIds]);

  // surgeon multiselect change handler
  const surgeonMultiSelectChangeHandler = (
    selectedOptions: MultiValue<{ label: string; value: number }>
  ) => {
    const selectedIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setPayloadValue((prev: PaylaodValueItem) => ({ ...prev, surgeonIds: selectedIds }));
  };

  // equipment select options
  const equipmentSelectOptions = useMemo(() => {
    return equipmentList.map(e => ({ label: e?.name, value: e?.serviceItemId }));
  }, [equipmentList]);

  // selected equipments value
  const selectedEquipments = useMemo(() => {
    return equipmentList
      .filter(e => payloadValue?.equipmentServiceItemIds?.includes(e?.serviceItemId))
      .map(e => ({ label: e?.name, value: e?.serviceItemId }));
  }, [equipmentList, payloadValue?.equipmentServiceItemIds]);

  // equipment multiselect change handler
  const equipmentMultiSelectChangeHandler = (
    selectedOptions: MultiValue<{ label: string; value: number }>
  ) => {
    const selectedIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setPayloadValue((prev: PaylaodValueItem) => ({
      ...prev,
      equipmentServiceItemIds: selectedIds,
    }));
  };

  // main surgery change handler
  const mainSurgeryChangeHandler = (item: ServiceTableItem, e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setServiceTableItemList(prev =>
      prev.map(s =>
        s.serviceItemId === item.serviceItemId
          ? { ...s, isMainSurgery: checked ? 1 : 0 }
          : { ...s, isMainSurgery: checked ? 0 : s.isMainSurgery }
      )
    );
  };

  // remove handler
  const deleteHandler = (item: ServiceTableItem) => {
    setServiceTableItemList(prev => prev.filter(i => i?.serviceItemId !== item?.serviceItemId));
  };

  // an
  const handleAnesthesiaTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    setPayloadValue(prev => {
      return {
        ...prev,
        anesthesia: value,
      };
    });
  };

  // equipment list'
  const getEquipmentList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryTypeId: 14, isActive: 1 } },
      { component: "OtBookingDetails" }
    );
    console.log("resp", resp?.data);
    setEquipmentList(resp?.data ?? []);
  };

  return (
    <div className="card !overflow-visible">
      {/* case details */}
      <div className=" w-full mb-1 border-2 border-gray-200 p-1 rounded-lg">
        <div className="flex gap-2 justify-between">
          <h1 className="font-bold text-lg -mt-1 p-1">Case Details & Provisional Diagnosis</h1>
          {/* check box */}
          <div className="flex gap-2 -mt-1 ">
            {/* <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="input-checkbox"
                  name="isBloodRequired"
                  onChange={checkboxChangeHandler}
                />

                <span className="font-semibold">Blood Required</span>
              </label>
            </div> */}
            <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="input-checkbox"
                  name="isVentilatorRequired"
                  onChange={checkboxChangeHandler}
                />

                <span className="font-semibold">Ventilator Required</span>
              </label>
            </div>

            <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="input-checkbox"
                  name="isICURequired"
                  onChange={checkboxChangeHandler}
                />

                <span className="font-semibold">ICU Required</span>
              </label>
            </div>

            {/* <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="input-checkbox"
                  name="isInfectiousCase"
                  onChange={checkboxChangeHandler}
                />

                <span className="font-semibold">Infectious Case</span>
              </label>
            </div> */}
            <div className="flex items-center gap-2 m-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="input-checkbox"
                  name="isUnderPackage"
                  onChange={checkboxChangeHandler}
                />

                <span className="font-semibold">Under package</span>
              </label>
            </div>
          </div>
        </div>

        {/* input field */}
        <div className="form-grid-4 m-2">
          {/* <InputField label="IPD Number">
            <input
              className="disabled-input-field"
              name="ipdNo"
              value={ipdNo}
              readOnly
              disabled={true}
            />
          </InputField> */}

          {/* <InputField label="IPD Visit ID">
            <input
              className="disabled-input-field"
              name="ipdVisitId"
              value={ipdVisitId || ""}
              readOnly
              disabled={true}
            />
          </InputField> */}

          <InputField label="Blood Required">
            <select
              className="input-field"
              name="isBloodRequired"
              value={payloadValue?.isBloodRequired}
              onChange={surgeonAndOtherResourceSelectHandler}
            >
              <option value="">--Select--</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </InputField>

          <InputField label="No of blood Unit">
            <input
              className={`${payloadValue.isBloodRequired ? "input-field" : "disabled-input-field"}`}
              placeholder="Enter no. of blood unit"
              onInput={allowOnlyNumbers}
              name="numberOfBloodUnits"
              onChange={textChangeHandler}
              value={payloadValue.numberOfBloodUnits}
              disabled={payloadValue.isBloodRequired ? false : true}
            />
          </InputField>

          <InputField label="Blood Group">
            <select
              className="input-field"
              name="bloodGroupId"
              value={payloadValue?.bloodGroupId}
              onChange={surgeonAndOtherResourceSelectHandler}
            >
              <option value="">--Select--</option>
              {bloodGroupList?.map((bg: BloodGroupItem) => (
                <option key={bg?.BloodId} value={bg?.BloodId}>
                  {bg?.BloodGroupType}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Infectious Case">
            <select
              className="input-field"
              name="isInfectiousCase"
              value={payloadValue?.isInfectiousCase}
              onChange={surgeonAndOtherResourceSelectHandler}
            >
              <option value="">--Select--</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </InputField>

          <InputField label="Infectious Remarks">
            <input
              className={`${payloadValue.isInfectiousCase ? "input-field" : "disabled-input-field"}`}
              placeholder="Enter infectious remarks"
              name="infectiousCaseRemarks"
              value={payloadValue.infectiousCaseRemarks}
              onChange={textChangeHandler}
              disabled={payloadValue.isInfectiousCase ? false : true}
            />
          </InputField>
          <InputField label="Diagnosis">
            <input
              className={`input-field`}
              placeholder="Enter diagnosis"
              name="diagnosisName"
              value={payloadValue.diagnosisName}
              onChange={textChangeHandler}
            />
          </InputField>
        </div>
      </div>

      {/* surgeon details and other resources */}
      <div className="w-full border-2 border-gray-200  rounded-lg  mt-1 p-1">
        <h1 className="font-bold text-lg">Surgeon Details & Other Resources</h1>
        <div className="form-grid-4 m-2">
          <InputField label="Surgeon" required>
            <Select
              isMulti
              options={surgeonSelectOptions}
              value={selectedSurgeons}
              placeholder="Select Surgeon"
              isSearchable
              isClearable
              onChange={surgeonMultiSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, true, GroupBase<any>>}
              menuPortalTarget={document.body}
              components={{ Option: MultiCheckboxOption }}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label="Anesthetist">
            <Select
              name="anesthetistId"
              options={anesthetistOptions}
              value={
                anesthetistOptions.find(opt => opt.value === payloadValue?.anesthetistId) || null
              }
              placeholder="Select Anesthetist"
              isSearchable
              isClearable
              onChange={singleReactSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, false, GroupBase<any>>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label="Asst Surgeon 1">
            <Select
              name="assistantSurgeonId1"
              options={asstSurgeon1Options}
              value={
                asstSurgeon1Options.find(opt => opt.value === payloadValue?.assistantSurgeonId1) ||
                null
              }
              placeholder="Select Asst Surgeon 1"
              isSearchable
              isClearable
              onChange={singleReactSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, false, GroupBase<any>>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label="Asst Surgeon 2">
            <Select
              name="assistantSurgeonId2"
              options={asstSurgeon2Options}
              value={
                asstSurgeon2Options.find(opt => opt.value === payloadValue?.assistantSurgeonId2) ||
                null
              }
              placeholder="Select Asst Surgeon 2"
              isSearchable
              isClearable
              onChange={singleReactSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, false, GroupBase<any>>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label="Asst Anesthetist ">
            <Select
              name="assistantAnesthetistId"
              options={asstAnesthetistOptions}
              value={
                asstAnesthetistOptions.find(
                  opt => opt.value === payloadValue?.assistantAnesthetistId
                ) || null
              }
              placeholder="Select Asst Anesthetist"
              isSearchable
              isClearable
              onChange={singleReactSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, false, GroupBase<any>>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label=" Anesthesia Type ">
            <select className="input-field" onChange={handleAnesthesiaTypeChange}>
              <option value="">Select Anesthesia Type</option>
              {anesthesiaTypeList.map((a: PickMasterItem) => (
                <option key={a?.key} value={a?.key}>
                  {a?.value}
                </option>
              ))}
            </select>
          </InputField>
          <InputField label="Perfusionist">
            <Select
              name="perfusionistUserId"
              options={perfusionistOptions}
              value={
                perfusionistOptions.find(opt => opt.value === payloadValue?.perfusionistUserId) ||
                null
              }
              placeholder="Select Perfusionist"
              isSearchable
              isClearable
              onChange={singleReactSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, false, GroupBase<any>>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label="Scrub Nurse(s)">
            <Select
              name="scrubNurseUserId"
              options={scrubNurseOptions}
              value={
                scrubNurseOptions.find(opt => opt.value === payloadValue?.scrubNurseUserId) || null
              }
              placeholder="Select Scrub Nurse"
              isSearchable
              isClearable
              onChange={singleReactSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, false, GroupBase<any>>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label="Circulating Nurse(s)">
            <Select
              name="circulatingNurseUserId"
              options={circulatingNurseOptions}
              value={
                circulatingNurseOptions.find(
                  opt => opt.value === payloadValue?.circulatingNurseUserId
                ) || null
              }
              placeholder="Select Circulating Nurse"
              isSearchable
              isClearable
              onChange={singleReactSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, false, GroupBase<any>>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label="OT Technician">
            <Select
              name="otTechnicianUserId"
              options={otTechnicianOptions}
              value={
                otTechnicianOptions.find(opt => opt.value === payloadValue?.otTechnicianUserId) ||
                null
              }
              placeholder="Select OT Technician"
              isSearchable
              isClearable
              onChange={singleReactSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, false, GroupBase<any>>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>

          <InputField label="AT Technician">
            <Select
              name="atTechnicianUserId"
              options={atTechnicianOptions}
              value={
                atTechnicianOptions.find(opt => opt.value === payloadValue?.atTechnicianUserId) ||
                null
              }
              placeholder="Select AT Technician"
              isSearchable
              isClearable
              onChange={singleReactSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, false, GroupBase<any>>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
        </div>
      </div>

      {/* theature details and surgery details */}
      <div className="w-full border-2 border-gray-200 rounded-lg p-1 mt-1 !overflow-visible">
        <div className="flex gap-2 justify-between">
          <h1 className="font-bold text-lg -mt-1 p-1">Theater & Surgery Details</h1>
          {/* check box */}
          <div className="flex gap-2 -mt-1 ">
            {/* <div className="flex items-center gap-2 ml-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="input-checkbox"
                  name="isMainSurgery"
                  onChange={mainSurgeryChangeHandler}
                />

                <span className="font-semibold">Main</span>
              </label>
            </div> */}
          </div>
        </div>
        <div className="form-grid-4 m-2">
          <InputField label="OT Type">
            <select
              className="input-field"
              name="otTypeId"
              value={payloadValue?.otTypeId}
              onChange={dropdownSelectHandler}
            >
              <option value={0}>--Select--</option>
              <option value={1}>Elective</option>
              <option value={2}>Emergency</option>
            </select>
          </InputField>
          <InputField label="Theater" required>
            <select
              className="input-field"
              value={payloadValue?.otId}
              name="otId"
              onChange={dropdownSelectHandler}
            >
              <option value={0}>--Select--</option>
              {thearterLists.map(item => (
                <option key={item?.OTId} value={item?.OTId}>
                  {item?.OTName}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Date" required>
            <CustomDateInput
              value={payloadValue?.otBookingDate}
              onChange={(val: string) =>
                setPayloadValue((prev: PaylaodValueItem) => ({
                  ...prev,
                  otBookingDate: String(val),
                }))
              }
            />
          </InputField>
          <InputField label="Start Time" required>
            <CustomTimePicker
              value={payloadValue?.otBookingFromTime}
              onChange={e => timeChangeHandler(e, "otBookingFromTime")}
            />
          </InputField>
          <InputField label="End Time" required>
            <CustomTimePicker
              value={payloadValue?.otBookingToTime}
              onChange={e => timeChangeHandler(e, "otBookingToTime")}
            />
          </InputField>
          <InputField label="Equipment Required">
            <select
              className="input-field"
              name="isEquipmentRequest"
              onChange={dropdownSelectHandler}
              value={payloadValue?.isEquipmentRequest}
            >
              <option value="">--Select--</option>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </InputField>

          <InputField label="Equipment Lists">
            <Select
              isMulti
              options={equipmentSelectOptions}
              value={selectedEquipments}
              placeholder="Select Equipment"
              isSearchable
              isClearable
              onChange={equipmentMultiSelectChangeHandler}
              styles={SelectStyles as StylesConfig<any, true, GroupBase<any>>}
              menuPortalTarget={document.body}
              components={{ Option: MultiCheckboxOption }}
              menuPosition="fixed"
              isDisabled={Number(payloadValue?.isEquipmentRequest) !== 1}
            />
          </InputField>
          <InputField label="Category">
            <select
              value={selectedCategoryId}
              className="input-field"
              onChange={categoryChangeHandler}
            >
              <option>--Select--</option>
              {categoryList.map(item => (
                <option key={item?.categoryId} value={item?.categoryId}>
                  {item?.categoryName}
                </option>
              ))}
            </select>
          </InputField>
          <InputField label="Sub Category">
            <select
              value={selectedSubCategoryId}
              className="input-field"
              onChange={subCategoryChangeHandler}
            >
              <option value={0}>All Sub Category</option>
              {subCategoryList.map(item => (
                <option key={item?.subCategoryId} value={item?.subCategoryId}>
                  {item?.subCategoryName}
                </option>
              ))}
            </select>
          </InputField>
          <InputField label="Sub Sub Category">
            <select
              value={selectedSubSubCategoryId}
              className="input-field"
              onChange={subSubCategoryChangeHandler}
            >
              <option value={0}>All Sub Sub Category</option>
              {subSubCategoryList.map(s => (
                <option key={s?.subSubCategoryId} value={s?.subSubCategoryId}>
                  {s?.subSubCategoryName}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Search Service">
            <div className="relative overflow-visible">
              <input
                type="text"
                className="input-field input-field-search-right"
                placeholder="Type to search services"
                value={searchTerm}
                onChange={serviceItemHandler}
                onKeyDown={serviceInputKeyDownHandler}
              />

              <InputFieldModal
                showPopup={showPopup}
                data={serviceNameList}
                activeIndex={activeServiceIndex}
                setActiveIndex={setActiveServiceIndex}
                onSelect={selectedServiceHandler}
                getLabel={item => item.name}
              />
            </div>
          </InputField>
        </div>
      </div>

      {/* table */}
      <div className="table-container mt-1 ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-30 lg:max-h-60">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th p-2">Surgery Name</th>
                  <th className="table-th">Date</th>
                  <th className="table-th"> Start Time</th>
                  <th className="table-th">End Time</th>
                  <th className="table-th">Main Surgery</th>
                  <th className="table-th">Remove</th>
                </tr>
              </thead>

              <tbody>
                {serviceTableItemList?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No surgery list found
                    </td>
                  </tr>
                )}

                {serviceTableItemList.map((item, idx) => (
                  <tr key={idx} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.serviceName || "-"}</td>
                    <td className="table-td">{item?.date || "-"}</td>
                    <td className="table-td">{item?.otBookingFromTime || "-"}</td>
                    <td className="table-td">{item?.otBookingToTime || "-"}</td>

                    <td>
                      <input
                        type="checkbox"
                        checked={!!item?.isMainSurgery}
                        onChange={e => mainSurgeryChangeHandler(item, e)}
                        className="input-checkbox ml-10"
                      />
                    </td>
                    <td>
                      <RemoveIconButton className="ml-3" onClick={() => deleteHandler(item)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtBookingDetails;
