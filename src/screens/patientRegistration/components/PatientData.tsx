import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { OptionItem, SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { allowOnlyNumbers, allowOnlyText } from "@/utils/inputValidationHandler";
import {
  defaultPatientRegistrationValues,
  patientRegistrationSchema,
} from "@/validation/patientRegistrationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import {
  ChangeEvent,
  forwardRef,
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import Select, { StylesConfig } from "react-select";
import Webcam from "react-webcam";
import {
  BranchDetailsItem,
  CorporateItem,
  DOcumentListItem,
  InsuranceItem,
  PatientDataEditItem,
  PatientDataHandle,
  PatientDataProps,
  PatientDocumentPayloadItem,
} from "../types";
import Address from "./Address";
import {
  formatDate,
  getAgeFromDob,
  getDobFromAge,
  normalizePatientGenderForApi,
  resolveMaritalStatus,
  resolvePickValue,
} from "./dobHelper";
import DocumentPopup from "./DocumentPopup";
import { getMandatoryDocumentErrors } from "./documentValidation";
import OtherDetails from "./OtherDetails";
import { SaveButtons } from "./patientButtons";

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

const getCorporateIdFromItem = (item: CorporateItem | Record<string, unknown>) =>
  Number(item.corporateId ?? item.CorporateId ?? 0);

const getCorporateNameFromItem = (item: CorporateItem | Record<string, unknown>) =>
  String(item.corporateName ?? item.CorporateName ?? "");

const normalizeCorporateList = (data: unknown): CorporateItem[] => {
  if (!Array.isArray(data)) return [];

  return data
    .map(item => {
      const record = item as Record<string, unknown>;
      return {
        corporateId: getCorporateIdFromItem(record),
        corporateName: getCorporateNameFromItem(record),
        insuranceCompanyId: Number(record.insuranceCompanyId ?? record.InsuranceCompanyId ?? 0),
        isActive: Number(record.isActive ?? record.IsActive ?? 1),
      };
    })
    .filter(item => item.corporateId > 0);
};

const PatientData = forwardRef<PatientDataHandle, PatientDataProps>(
  (
    {
      showRegistrationButton = true,
      selectedPatientId: selectedPatientIdFromProps = null,
      onPayloadChange,
      onPatientLoaded,
    }: PatientDataProps,
    ref
  ) => {
    const { loading, fetchApi } = useGlobalApi();
    const branchId = useContext(AuthContext)?.user?.branchId ?? 1;
    const roleId = useContext(RoleContext)?.roleId ?? 0;
    const lastAppliedBranchInsuranceKeyRef = useRef("");

    const [insuranceList, setInsuranceList] = useState<InsuranceItem[]>([]);
    const [insuranceId, setInsuranceId] = useState<number>(0);

    const [corporateList, setCorporateList] = useState<CorporateItem[]>([]);
    const [selectedCorporate, setSelectedCorporate] = useState<OptionItem | null>(null);

    const [prefillPatientData, setPrefillPatientData] = useState<PatientDataEditItem | null>(null);

    const isUpdatingAgeDob = useRef(false);
    const [addressResetSignal, setAddressResetSignal] = useState(0);

    const [idProofTypeValue, setIdProofTypeValue] = useState<string>("");

    // documents
    const [renderDocument, setRenderDocument] = useState<boolean>(false);
    const [openDocument, setOpenDocument] = useState<boolean>(false);

    const relationType = usePickMaster("PatientRelation");
    const relationTypeList = relationType?.pickMasterValue ?? [];

    // web cam setup
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const existingImageBlobUrlRef = useRef<string | null>(null);

    const [showWebcam, setShowWebcam] = useState(false);
    const [capturedImageFile, setCapturedImageFile] = useState<File | null>(null);
    const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);
    const [existingImagePreview, setExistingImagePreview] = useState<string | null>(null);

    const [documentUploadError, setDocumentUploadError] = useState("");

    // patient document
    const [documentFileStore, setDocumentFileStore] = useState<Record<number, File>>({});
    const [patientDocumentPayload, setPatientDocumentPayload] = useState<
      PatientDocumentPayloadItem[]
    >([]);
    const [documentValidationErrors, setDocumentValidationErrors] = useState<
      Record<number, string>
    >({});

    const documentFileStoreRef = useRef(documentFileStore);
    const patientDocumentPayloadRef = useRef(patientDocumentPayload);

    useEffect(() => {
      documentFileStoreRef.current = documentFileStore;
    }, [documentFileStore]);

    useEffect(() => {
      patientDocumentPayloadRef.current = patientDocumentPayload;
    }, [patientDocumentPayload]);

    const methods = useForm({
      resolver: yupResolver(patientRegistrationSchema),
      defaultValues: defaultPatientRegistrationValues,
      mode: "onChange",
      reValidateMode: "onChange",
    });
    const {
      register,
      watch,
      setValue,
      reset,
      formState: { errors },
    } = methods;

    const isEdit = Boolean(watch("PatientId"));
    const watchedPatientId = watch("PatientId");
    const watchedCorporateId = watch("CorporateId");
    const isExistingPatient = Number(watchedPatientId) > 0;

    const watchedTitle = watch("Title");

    const today = formatDate(new Date());

    // capture photo
    const capturePhoto = useCallback(async () => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setShowWebcam(false);

        const blob = await fetch(imageSrc).then(res => res.blob());
        const mimeType = blob.type || "image/jpeg";
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
          showError("Only JPG, JPEG or PNG image types are allowed.");
          return;
        }

        const extension = mimeType === "image/png" ? "png" : "jpg";
        const file = new File([blob], `photo.${extension}`, { type: mimeType });

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          showError("Image size must be 2MB or less.");
          return;
        }

        setCapturedImageFile(file);
        setValue("PatientImageFile", file, { shouldDirty: true, shouldValidate: true });
      }
    }, [setValue]);

    const openPhotoPicker = () => {
      fileInputRef.current?.click();
    };

    const photoUploadChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (!ALLOWED_IMAGE_MIME_TYPES.includes(selectedFile.type)) {
        showError("Only JPG, JPEG or PNG image types are allowed.");
        e.target.value = "";
        return;
      }

      if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
        showError("Image size must be 2MB or less.");
        e.target.value = "";
        return;
      }

      setShowWebcam(false);
      setCapturedImageFile(selectedFile);
      setValue("PatientImageFile", selectedFile, { shouldDirty: true, shouldValidate: true });
      e.target.value = "";
    };

    useEffect(() => {
      if (!capturedImageFile) {
        setCapturedImagePreview(null);
        return;
      }
      const objectUrl = URL.createObjectURL(capturedImageFile);
      setCapturedImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }, [capturedImageFile]);

    const buildImagePreviewUrl = (base64Data: string, contentType?: string) => {
      const sanitizedBase64 = String(base64Data ?? "").trim();
      if (!sanitizedBase64) return "";
      if (sanitizedBase64.startsWith("data:image")) return sanitizedBase64;

      const mimeType =
        typeof contentType === "string" && contentType.startsWith("image/")
          ? contentType
          : "image/jpeg";

      return `data:${mimeType};base64,${sanitizedBase64}`;
    };

    const clearExistingImagePreview = () => {
      if (existingImageBlobUrlRef.current) {
        URL.revokeObjectURL(existingImageBlobUrlRef.current);
        existingImageBlobUrlRef.current = null;
      }
      setExistingImagePreview(null);
    };

    useEffect(() => {
      return () => {
        if (existingImageBlobUrlRef.current) {
          URL.revokeObjectURL(existingImageBlobUrlRef.current);
        }
      };
    }, []);

    const defaultCorporate = { value: 0, label: "CASH" };

    // insurance handler

    const insuranceSelectHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const insuranceCompanyId = Number(e.target.value);
      setInsuranceId(insuranceCompanyId);
      setValue("InsuranceCompanyId", insuranceCompanyId);

      if (!insuranceCompanyId) {
        setCorporateList([]);
        setSelectedCorporate(defaultCorporate);
        setValue("CorporateId", 0);
        return;
      }
      setSelectedCorporate(null);
      getCorporateList(Number(insuranceCompanyId));
    };

    // corporate handler
    const corporateSelectHandler = (option: OptionItem | null) => {
      if (!option) {
        setSelectedCorporate(null);
        setValue("CorporateId", 0);
        return;
      }
      setSelectedCorporate(option);
      setValue("CorporateId", Number(option.value ?? 0));
    };

    // corporate list
    const getCorporateList = async (insuranceCompanyId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CORPORATE_LIST_BY_BRANCH_ID_AND_INSURANCE_COMPANY_ID,
        {},
        { params: { branchId, insuranceCompanyId } },
        { component: "Patient Registration" }
      );
      const list = normalizeCorporateList(resp?.data);
      setCorporateList(list);
      return list;
    };

    const applyCorporateSelection = useCallback(
      (corporate: CorporateItem) => {
        setSelectedCorporate({
          value: corporate.corporateId,
          label: corporate.corporateName,
        });
        setValue("CorporateId", corporate.corporateId, { shouldDirty: false });
      },
      [setValue]
    );

    const findCorporateInList = useCallback((list: CorporateItem[], corporateId: number) => {
      return list.find(item => Number(item.corporateId) === corporateId);
    }, []);

    const getBranchDetails = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_BRANCH_DETAILS,
        {},
        { params: { branchId } },
        { component: "PatientRegistration" }
      );
      return (resp?.data?.[0] ?? {}) as BranchDetailsItem;
    };

    const { data: branchDetails } = useQuery({
      queryKey: ["getBranchDetails", branchId],
      queryFn: getBranchDetails,
    });

    const applyBranchInsuranceDefaults = useCallback(async () => {
      if (!branchDetails || prefillPatientData || isExistingPatient) return;

      const defaultInsuranceId = Number(branchDetails.defaultInsuranceCompanyId ?? 0);
      const defaultCorporateId = Number(branchDetails.defaultCorporateId ?? 0);

      if (!defaultInsuranceId) {
        setInsuranceId(0);
        setValue("InsuranceCompanyId", 0, { shouldDirty: false });
        setCorporateList([]);
        setSelectedCorporate(defaultCorporate);
        setValue("CorporateId", 0, { shouldDirty: false });
        return;
      }

      setInsuranceId(defaultInsuranceId);
      setValue("InsuranceCompanyId", defaultInsuranceId, { shouldDirty: false });

      const list = await getCorporateList(defaultInsuranceId);

      if (!defaultCorporateId) {
        setSelectedCorporate(defaultCorporate);
        setValue("CorporateId", 0, { shouldDirty: false });
        return;
      }

      const matchedCorporate = findCorporateInList(list, defaultCorporateId);

      if (matchedCorporate) {
        applyCorporateSelection(matchedCorporate);
        return;
      }

      setSelectedCorporate({ value: defaultCorporateId, label: "Selected Corporate" });
      setValue("CorporateId", defaultCorporateId, { shouldDirty: false });
    }, [
      branchDetails,
      prefillPatientData,
      isExistingPatient,
      setValue,
      getCorporateList,
      findCorporateInList,
      applyCorporateSelection,
    ]);

    // apis
    const idProofType = usePickMaster("IDProofType");
    const idProofTypeList = idProofType?.pickMasterValue ?? [];

    const patientGender = usePickMaster("gender");
    const patientGenderList = patientGender?.pickMasterValue ?? [];

    const title = usePickMaster("Title");
    const titleList = title?.pickMasterValue ?? [];

    useEffect(() => {
      if (!titleList.length) return;
      if (watchedPatientId) return;
      if (String(watchedTitle ?? "").trim()) return;
      const defaultTitle = titleList.find(item => item.value === "Mr.") || null;
      if (!defaultTitle?.value) return;
      setValue("Title", defaultTitle.value, { shouldDirty: false, shouldValidate: true });
    }, [titleList, watchedPatientId, watchedTitle, setValue]);

    // insurance company list
    const getInsuranceList = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_INSURANCE_COMPANY_MASTER_LIST,
        {},
        {},
        { component: "Patient Registration" }
      );
      setInsuranceList(resp?.data ?? []);
    };

    const corporateSelectOption = useMemo(() => {
      if (!insuranceId) {
        return [defaultCorporate];
      }

      const options = corporateList.map(item => ({
        value: item.corporateId,
        label: item.corporateName,
      }));

      const selectedId = Number(watchedCorporateId ?? selectedCorporate?.value ?? 0);
      const selectedLabel = selectedCorporate?.label ?? "";

      if (
        selectedId > 0 &&
        selectedLabel &&
        !options.some(option => Number(option.value) === selectedId)
      ) {
        options.unshift({
          value: selectedId,
          label: selectedLabel,
        });
      }

      return options;
    }, [corporateList, insuranceId, watchedCorporateId, selectedCorporate]);

    useEffect(() => {
      getInsuranceList();
    }, []);

    useEffect(() => {
      if (!insuranceList.length || !branchDetails) return;
      if (prefillPatientData || isExistingPatient) return;

      const defaultsKey = [
        addressResetSignal,
        branchId,
        branchDetails.defaultInsuranceCompanyId,
        branchDetails.defaultCorporateId,
      ].join("-");

      if (lastAppliedBranchInsuranceKeyRef.current === defaultsKey) return;
      lastAppliedBranchInsuranceKeyRef.current = defaultsKey;

      applyBranchInsuranceDefaults();
    }, [
      insuranceList,
      branchDetails,
      prefillPatientData,
      isExistingPatient,
      addressResetSignal,
      branchId,
      applyBranchInsuranceDefaults,
    ]);

    useEffect(() => {
      if (!insuranceId || !corporateList.length) return;
      if (prefillPatientData || isExistingPatient) return;

      const corporateId = Number(watchedCorporateId ?? 0);
      if (!corporateId) return;
      if (Number(selectedCorporate?.value) === corporateId) return;

      const matchedCorporate = findCorporateInList(corporateList, corporateId);
      if (matchedCorporate) {
        applyCorporateSelection(matchedCorporate);
      }
    }, [
      insuranceId,
      corporateList,
      watchedCorporateId,
      selectedCorporate?.value,
      prefillPatientData,
      isExistingPatient,
      findCorporateInList,
      applyCorporateSelection,
    ]);

    useEffect(() => {
      if (!watch("PatientId")) return;

      const remappedTitle = resolvePickValue(titleList, watch("Title"), {
        mr: ["mr", "mister"],
        mrs: ["mrs", "misses", "mistress"],
        miss: ["miss", "ms"],
        dr: ["dr", "doctor", "doc"],
        master: ["master"],
        mx: ["mx"],
        bo: ["bo", "babyof", "sonof", "daughterof", "wardof", "careof", "co"],
      });
      const remappedGender = resolvePickValue(patientGenderList, watch("Gender"), {
        male: ["male", "m", "man", "boy"],
        female: ["female", "f", "woman", "girl"],
        other: ["other", "o", "others", "transgender", "trans"],
      });

      if (remappedTitle && remappedTitle !== watch("Title")) {
        setValue("Title", remappedTitle, { shouldDirty: false, shouldValidate: true });
      }
      if (remappedGender && remappedGender !== watch("Gender")) {
        setValue("Gender", normalizePatientGenderForApi(remappedGender) || remappedGender, {
          shouldDirty: false,
          shouldValidate: true,
        });
      }
    }, [titleList, patientGenderList, watch, setValue]);

    useEffect(() => {
      if (isUpdatingAgeDob.current) return;

      const dob = watch("Dob");
      if (!dob) return;

      const age = getAgeFromDob(dob);
      if (!age) return;

      isUpdatingAgeDob.current = true;

      setValue("AgeYears", Number(age.years));
      setValue("AgeMonths", Number(age.months));
      setValue("AgeDays", Number(age.days));

      isUpdatingAgeDob.current = false;
    }, [watch("Dob"), setValue]);

    // age to dob
    useEffect(() => {
      if (isUpdatingAgeDob.current) return;

      const age = watch("AgeYears");
      const months = watch("AgeMonths");
      const days = watch("AgeDays");

      if (!age && !months && !days) {
        isUpdatingAgeDob.current = true;
        setValue("Dob", "");
        isUpdatingAgeDob.current = false;
        return;
      }

      const dob = getDobFromAge(Number(age || 0), Number(months || 0), Number(days || 0));

      if (!dob) return;

      isUpdatingAgeDob.current = true;
      setValue("Dob", dob);

      isUpdatingAgeDob.current = false;
    }, [watch("AgeYears"), watch("AgeMonths"), watch("AgeDays"), setValue]);

    // submit handler
    const onSubmit = async (data: any) => {
      const payload = { ...data, roleId };
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
        { component: "Patient Registration" }
      );

      if (!resp?.result) {
        showWarning(resp?.message ?? "Failed to register patient");
        return;
      }

      showSuccess(resp?.message ?? "Patient registered successfully");
      resetPatientForm();

      if (resp?.data?.patientId && patientDocumentPayload.length > 0) {
        const updatedDocumentPayload = patientDocumentPayload.map(
          (item: PatientDocumentPayloadItem) => ({
            ...item,
            PatientId: Number(resp?.data?.patientId),
          })
        );
        setPatientDocumentPayload(updatedDocumentPayload);

        const patientDocumentFormData = new FormData();

        updatedDocumentPayload.forEach((item: PatientDocumentPayloadItem) => {
          if (!item.DocumentFile) return;
          patientDocumentFormData.append(`DocumentId`, String(item.DocumentId));
          patientDocumentFormData.append(`PatientId`, String(item.PatientId));
          patientDocumentFormData.append(`DocumentFile`, item.DocumentFile);
        });

        const response = await fetchApi(
          "POST",
          ENDPOINTS.UPLOAD_PATIENT_DOCUMENT,
          patientDocumentFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
          { component: "PatientDocumentUpload" }
        );

        if (!response?.result) {
          showWarning(response?.message || "Failed to upload documents");
          return;
        }

        setDocumentFileStore({});
        setPatientDocumentPayload([]);
      }
    };

    const resetPatientForm = () => {
      reset(defaultPatientRegistrationValues);
      setValue("Address", "");
      setValue("Pincode", "");
      setValue("CountryId", 0);
      setValue("Country", "");
      setValue("StateId", 0);
      setValue("State", "");
      setValue("DistrictId", 0);
      setValue("District", "");
      setValue("CityId", 0);
      setValue("City", "");
      setAddressResetSignal(prev => prev + 1);
      setPrefillPatientData(null);
      setInsuranceId(0);
      setCorporateList([]);
      setSelectedCorporate(defaultCorporate);
      setValue("InsuranceCompanyId", 0);
      setValue("CorporateId", 0);
      lastAppliedBranchInsuranceKeyRef.current = "";
      setIdProofTypeValue("");
      setCapturedImageFile(null);
      setCapturedImagePreview(null);
      clearExistingImagePreview();
      setDocumentFileStore({});
      setPatientDocumentPayload([]);
      setDocumentValidationErrors({});
      setOpenDocument(false);
      setRenderDocument(false);
    };

    const getPatientImage = async (filePath: string) => {
      const normalizedPath = String(filePath ?? "").trim();
      if (!normalizedPath) {
        clearExistingImagePreview();
        return;
      }

      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_FILE_AS_BASE_64,
        {},
        { params: { filePath: normalizedPath } },
        { component: "PatientDataOfRegistration" }
      );

      const base64Data = resp?.data?.base64Data;
      if (base64Data) {
        const imagePreviewUrl = buildImagePreviewUrl(
          base64Data,
          resp?.data?.contentType ?? resp?.data?.mimeType
        );
        clearExistingImagePreview();
        setExistingImagePreview(imagePreviewUrl || null);
        return;
      }

      const blobResp = await fetchApi(
        "GET",
        ENDPOINTS.GET_IMAGE_FILE,
        {},
        {
          params: { filePath: normalizedPath },
          responseType: "blob",
        },
        { component: "PatientDataOfRegistration" }
      );

      if (blobResp instanceof Blob && blobResp.size > 0) {
        clearExistingImagePreview();
        const objectUrl = URL.createObjectURL(blobResp);
        existingImageBlobUrlRef.current = objectUrl;
        setExistingImagePreview(objectUrl);
        return;
      }

      clearExistingImagePreview();
    };

    const onPayloadChangeRef = useRef(onPayloadChange);
    onPayloadChangeRef.current = onPayloadChange;

    const patientDoctorMetaRef = useRef<{ doctorId?: number; DoctorId?: number }>({});

    const emitPatientPayload = (values: Record<string, unknown>) => {
      onPayloadChangeRef.current?.({
        ...values,
        ...(patientDoctorMetaRef.current.doctorId ? patientDoctorMetaRef.current : {}),
      });
    };

    // edit mode
    const getEditPatientData = async (patientId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_MASTER,
        {},
        { params: { patientId: patientId } },
        { component: "patientRegistration" }
      );

      if (!resp?.result) {
        showWarning(resp?.message ?? "Failed to get patient data");
        return;
      }

      const data = resp?.data?.[0] as PatientDataEditItem;

      if (!data) return;

      setDocumentFileStore({});
      setPatientDocumentPayload([]);
      setDocumentValidationErrors({});

      setCapturedImageFile(null);
      setCapturedImagePreview(null);
      clearExistingImagePreview();
      await getPatientImage(data?.patientImagePath ?? "");

      setPrefillPatientData(data);

      const mappedTitle = resolvePickValue(titleList, data?.title, {
        mr: ["mr", "Mr"],
        mrs: ["mrs", "Mrs"],
        miss: ["miss", "ms"],
        dr: ["dr", "doctor", "doc"],
        master: ["master"],
        mx: ["mx"],
        bo: ["bo", "babyof", "sonof", "daughterof", "wardof", "careof", "co"],
      });

      const mappedGender = resolvePickValue(patientGenderList, data?.gender, {
        male: ["male", "MALE"],
        female: ["female", "FEMALE"],
        other: ["other", "OTHER", "OTHERS", "others"],
      });

      reset({
        ...defaultPatientRegistrationValues,
        PatientId: data?.patientId ?? null,
        BranchId: data?.branchId ?? null,
        UhidOrBarcode: data?.uhid ?? "",
        // ipdNumber: data?.ipdNumber,
        Title: mappedTitle,
        FirstName: data?.firstName ?? "",
        MiddleName: data?.middleName ?? "",
        LastName: data?.lastName ?? "",
        AgeYears: data?.ageYears ?? 0,
        AgeMonths: data?.ageMonths ?? 0,
        AgeDays: data?.ageDays ?? 0,
        Dob: data?.dob ?? "",
        Gender: normalizePatientGenderForApi(mappedGender || data?.gender),
        MaritalStatus: resolveMaritalStatus(data?.maritalStatus),
        Relation: data?.relation ?? "",
        RelativeName: data?.relativeName ?? "",
        IdProofName: data?.idProofName ?? "",
        IdProofNumber: data?.idProofNumber ?? "",
        SelfContactNumber: data?.contactNumber ?? "",
        EmergencyContactNumber: data?.emergencyContactNumber ?? "",
        Email: data?.email ?? "",
        Address: data?.address ?? "",
        CountryId: data?.countryId ?? null,
        Country: data?.country ?? "",
        StateId: data?.stateId ?? null,
        State: data?.state ?? "",
        DistrictId: data?.districtId ?? null,
        District: data?.district ?? "",
        CityId: data?.cityId ?? null,
        City: data?.city ?? "",
        InsuranceCompanyId: data?.insuranceCompanyId ?? null,
        CorporateId: data?.corporateId ?? null,
        CardNo: data?.cardNo ?? "",

        PolicyNo: data?.policyNo ?? "",
        PolicyCardNo: data?.policyCardNo ?? "",
        ExpiryDate: data?.expiryDate ?? "",
        CardHolder: data?.cardHolder ?? "",
        ReferalNo: data?.referalNo ?? "",
        ReferalDate: data?.referalDate ?? "",
        PrivilegedCardNumber: data?.privilegedCardNumber ?? "",
        LandlineNo: data?.landlineNo ?? "",
        BirthPlace: data?.birthPlace ?? "",
        Religion: data?.religion ?? "",
        RelationPhone: data?.relationPhone ?? "",
        RelationAge: data?.relationAge ?? "",
        RelationGender: data?.relationGender ?? "",
        EMG_FirstName: data?.emG_FirstName ?? "",
        EMG_LastName: data?.emG_LastName ?? "",
        EMG_Relation: data?.emG_Relation ?? "",
        EMG_MobileNo: data?.emG_MobileNo ?? "",
        EMG_ResidentNo: data?.emG_ResidentNo ?? "",
        EMG_Address: data?.emG_Address ?? "",
        IsInternational: data?.internationalNo ? 1 : 0,
        Locality: data?.locality ?? "",
        PassportNumber: data?.passportNumber ?? "",
        InternationalNo: data?.internationalNo ?? "",
        MembershipNo: data?.membershipNo ?? "",
        PatientType: data?.patientType ?? "",
        IdentityMark: data?.identityMark ?? "",
        IdentityMark2: data?.identityMark2 ?? "",
        ReferenceType: data?.referenceType ?? "",
        Remarks: data?.remarks ?? "",
      });

      setInsuranceId(Number(data?.insuranceCompanyId ?? 0));
      setIdProofTypeValue((data?.idProofName ?? "") as string);

      if (data?.insuranceCompanyId) {
        const list = await getCorporateList(Number(data.insuranceCompanyId));
        const matchedCorporate = findCorporateInList(list, Number(data?.corporateId ?? 0));
        setSelectedCorporate(
          matchedCorporate
            ? {
                value: matchedCorporate.corporateId,
                label: matchedCorporate.corporateName,
              }
            : null
        );
      } else {
        setCorporateList([]);
        setSelectedCorporate(defaultCorporate);
      }

      const resolvedDoctorId =
        Number(data?.doctorId ?? (data as Record<string, unknown>)?.DoctorId ?? 0) || 0;
      patientDoctorMetaRef.current = resolvedDoctorId
        ? { doctorId: resolvedDoctorId, DoctorId: resolvedDoctorId }
        : {};

      emitPatientPayload(methods.getValues() as Record<string, unknown>);
    };

    useEffect(() => {
      if (selectedPatientIdFromProps) {
        getEditPatientData(selectedPatientIdFromProps);
      }
    }, [selectedPatientIdFromProps]);

    const getPatientDataByUHID = async (uhid: string) => {
      const trimmedUHID = String(uhid ?? "").trim();
      if (!trimmedUHID) return;

      const searchResp = await fetchApi(
        "GET",
        ENDPOINTS.SEARCH_PATIENT_MASTER,
        {},
        { params: { uhid: trimmedUHID } },
        { component: "PatientRegistrationByUHIDSearch" }
      );

      const matchedPatient = searchResp?.data?.[0];
      const patientId = Number(matchedPatient?.patientId ?? 0);

      if (!patientId) {
        showWarning("No patient found for the entered UHID.");
        return;
      }

      await getEditPatientData(patientId);
      onPatientLoaded?.("uhid");
    };

    useEffect(() => {
      emitPatientPayload(methods.getValues() as Record<string, unknown>);

      const subscription = methods.watch(values => {
        emitPatientPayload(values as Record<string, unknown>);
      });

      return () => subscription.unsubscribe();
      // Subscribe once; parent remounts PatientData via key when form resets.
    }, []);

    // id proof type handler
    const idProofTypeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setValue("IdProofName", value);
      setIdProofTypeValue(value);
    };

    // button click handler
    const fetchDocumentMapping = useCallback(async (patientId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_DOCUMENT_MAPPING,
        {},
        { params: { patientId: patientId || 0 } },
        { component: "PatientDataDocumentValidation" }
      );

      return (resp?.data ?? []) as DOcumentListItem[];
    }, []);

    const openDocumentPopupWithErrors = useCallback((errors: Record<number, string>) => {
      setDocumentValidationErrors(errors);
      setRenderDocument(true);
      setOpenDocument(true);
    }, []);

    const validateMandatoryDocuments = useCallback(async (): Promise<boolean> => {
      const patientId = Number(watchedPatientId) || 0;
      const documentList = await fetchDocumentMapping(patientId);
      const errors = getMandatoryDocumentErrors(
        documentList,
        documentFileStoreRef.current,
        patientDocumentPayloadRef.current
      );

      if (Object.keys(errors).length > 0) {
        openDocumentPopupWithErrors(errors);
        setDocumentUploadError("Please upload all mandatory documents");

        return false;
      }

      setDocumentValidationErrors({});
      return true;
    }, [fetchDocumentMapping, openDocumentPopupWithErrors, watchedPatientId]);

    const clearDocumentValidationError = useCallback((documentId: number) => {
      setDocumentValidationErrors(prev => {
        if (!prev[documentId]) {
          return prev;
        }

        const next = { ...prev };
        delete next[documentId];
        return next;
      });
    }, []);

    const buttonClickHandler = (name: string) => {
      if (name === "save") {
        methods.handleSubmit(
          async data => {
            const areDocumentsValid = await validateMandatoryDocuments();
            if (!areDocumentsValid) {
              return;
            }

            await onSubmit(data);
          },
          formErrors => {
            const firstError = Object.values(formErrors)[0];
            const message =
              typeof firstError?.message === "string"
                ? firstError.message
                : "Please fix validation errors before submitting";
            showWarning(message);
          }
        )();
        return;
      }

      if (name === "cancel") {
        resetPatientForm();
      }
    };

    // validation from opd billing
    useImperativeHandle(
      ref,
      () => ({
        validateForm: async () => {
          const isFormValid = await methods.trigger(undefined, { shouldFocus: true });
          if (!isFormValid) {
            return false;
          }

          return validateMandatoryDocuments();
        },
        loadPatientById: async (patientId: number) => {
          if (patientId > 0) {
            await getEditPatientData(patientId);
          }
        },
        applyApiFieldErrors: (errors: Record<string, string[] | string>) => {
          Object.entries(errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : String(messages);
            methods.setError(field as keyof typeof defaultPatientRegistrationValues, {
              type: "server",
              message,
            });
          });
        },
      }),
      [methods, validateMandatoryDocuments]
    );

    // open document handler
    const openDocumentHandler = () => {
      setRenderDocument(true);
      setOpenDocument(true);
    };

    const closeDocument = useCallback(() => {
      setOpenDocument(false);

      setTimeout(() => {
        setRenderDocument(false);
      }, 300);
    }, []);

    // auto filling gender on the basis of title
    const titleValue = watch("Title");
    const lockedGenderByTitle = useMemo(() => {
      if (titleValue === "Mr." || titleValue === "Master") {
        return "Male";
      }
      if (titleValue === "Mrs." || titleValue === "Miss.") {
        return "Female";
      }
      return "";
    }, [titleValue]);

    useEffect(() => {
      if (lockedGenderByTitle) {
        setValue("Gender", lockedGenderByTitle, { shouldDirty: true, shouldValidate: true });
      }
    }, [lockedGenderByTitle, setValue]);

    // search by Uhid handler

    const searchByUHIDHandler = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const uhid = e.currentTarget.value;
        if (uhid) {
          getPatientDataByUHID(uhid);
        }
      }
    };

    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="card w-full mb-2 ">
            <div className="">
              <div className="flex flex-col lg:flex-row gap-5">
                <div className="flex-1">
                  <div className="form-grid-4">
                    <InputField label="UHID">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter UHID & press Enter"
                        onKeyDown={searchByUHIDHandler}
                        {...register("UhidOrBarcode")}
                      />
                    </InputField>
                    {/* <InputField label="IPD Number">
                      <input
                        type="text"
                        className="input-field "
                        placeholder="Ipd number"
                        {...register("ipdNumber")}
                        readOnly
                      />
                    </InputField> */}
                    <div className="flex gap-2 w-full">
                      <div className="w-1/3">
                        <InputField label="Title" required>
                          <select className="input-field" {...register("Title")}>
                            <option value="">Select</option>
                            {titleList.map(item => (
                              <option key={item.value} value={item.value}>
                                {item.value}
                              </option>
                            ))}
                          </select>
                          {errors.Title && (
                            <p className="input-field-error">{errors.Title.message}</p>
                          )}
                        </InputField>
                      </div>

                      <div className="w-2/3">
                        <InputField label="First Name" required>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Enter First Name"
                            {...register("FirstName")}
                            onInput={allowOnlyText}
                            maxLength={120}
                          />
                          {errors.FirstName && (
                            <p className="input-field-error">{errors.FirstName.message}</p>
                          )}
                        </InputField>
                      </div>
                    </div>
                    <InputField label="Middle Name">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter Middle Name"
                        {...register("MiddleName")}
                        onInput={allowOnlyText}
                        maxLength={120}
                      />
                    </InputField>
                    <InputField label="Last Name">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter Last Name"
                        {...register("LastName")}
                        onInput={allowOnlyText}
                        maxLength={120}
                      />
                    </InputField>
                    <div className="flex gap-1 w-full overflow-auto">
                      <InputField label="Age(yrs)" required>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Enter Age (yrs)"
                          {...register("AgeYears")}
                          onInput={allowOnlyNumbers}
                          maxLength={3}
                        />
                        {errors.AgeYears && (
                          <p className="input-field-error">{errors.AgeYears.message}</p>
                        )}
                      </InputField>

                      <InputField label="Months" required>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Enter Age (months)"
                          {...register("AgeMonths")}
                          onInput={allowOnlyNumbers}
                          maxLength={3}
                        />
                        {errors.AgeMonths && (
                          <p className="input-field-error">{errors.AgeMonths.message}</p>
                        )}
                      </InputField>

                      <InputField label="Days" required>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Enter Age (days)"
                          {...register("AgeDays")}
                          onInput={allowOnlyNumbers}
                          maxLength={3}
                        />
                        {errors.AgeDays && (
                          <p className="input-field-error">{errors.AgeDays.message}</p>
                        )}
                      </InputField>
                    </div>
                    <InputField label="Dob" required>
                      <input type="hidden" {...register("Dob")} placeholder="Enter Date of Birth" />
                      <CustomDateInput
                        name="Dob"
                        value={watch("Dob") || ""}
                        max={today}
                        onChange={(value: string) => setValue("Dob", value)}
                      />
                      {errors.Dob && <p className="input-field-error">{errors.Dob.message}</p>}
                    </InputField>
                    <InputField label="Gender" required>
                      <select
                        className={lockedGenderByTitle ? "disabled-input-field" : "input-field"}
                        placeholder="Select Gender"
                        {...register("Gender")}
                        disabled={Boolean(lockedGenderByTitle)}
                      >
                        <option value="">Select Gender</option>

                        {patientGenderList.map(item => (
                          <option key={item.value} value={item.value}>
                            {item.value}
                          </option>
                        ))}
                      </select>
                      {errors.Gender && (
                        <p className="input-field-error">{errors.Gender.message}</p>
                      )}
                    </InputField>
                    <InputField label="Marital Status">
                      <select className="input-field" {...register("MaritalStatus")}>
                        <option value="">Select Marital Status</option>
                        <option value={"UN-MARRIED"}>Un-Married</option>
                        <option value={"MARRIED"}>Married</option>
                      </select>
                    </InputField>
                    <InputField label="Relation">
                      <select className="input-field" {...register("Relation")}>
                        <option value="">Select Relation</option>
                        {relationTypeList?.map(r => (
                          <option key={r?.key} value={r?.key}>
                            {r?.value}
                          </option>
                        ))}
                      </select>
                    </InputField>
                    <InputField label="Relative Name">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter Relative Name"
                        {...register("RelativeName")}
                        onInput={allowOnlyText}
                        maxLength={120}
                      />
                    </InputField>
                    <InputField label="ID Proof Type">
                      <select
                        className="input-field"
                        {...register("IdProofName")}
                        onChange={idProofTypeChangeHandler}
                      >
                        <option value="">Select ID Proof Type</option>
                        {idProofTypeList.map(item => (
                          <option key={item.key} value={item.key}>
                            {item.value}
                          </option>
                        ))}
                      </select>
                    </InputField>
                    {!!idProofTypeValue && (
                      <InputField label="ID Proof Number">
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Enter ID Proof Number"
                          {...register("IdProofNumber")}
                          maxLength={18}
                        />
                        {errors.IdProofNumber && (
                          <p className="input-field-error">{errors.IdProofNumber.message}</p>
                        )}
                      </InputField>
                    )}
                    <InputField label="Contact No.(Self)" required>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter Contact No.(Self)"
                        {...register("SelfContactNumber")}
                        maxLength={10}
                        minLength={10}
                        onInput={allowOnlyNumbers}
                      />
                      {errors.SelfContactNumber && (
                        <p className="input-field-error">{errors.SelfContactNumber.message}</p>
                      )}
                    </InputField>
                    <InputField label="Email">
                      <input
                        type="email"
                        className="input-field"
                        {...register("Email")}
                        placeholder="Enter Email"
                      />
                      {errors.Email && <p className="input-field-error">{errors.Email.message}</p>}
                    </InputField>
                    {/* address */}
                    <Address resetSignal={addressResetSignal} prefillData={prefillPatientData} />
                    {/* insurance */}
                    <InputField label="Insurance Company">
                      <input type="hidden" {...register("InsuranceCompanyId")} />
                      <select
                        className="input-field"
                        value={watch("InsuranceCompanyId") ?? 0}
                        onChange={insuranceSelectHandler}
                      >
                        <option value={0}>Self</option>
                        {insuranceList.map(item => (
                          <option key={item?.insuranceCompanyId} value={item?.insuranceCompanyId}>
                            {item?.insuranceCompanyName}
                          </option>
                        ))}
                      </select>
                    </InputField>
                    <InputField label="Corporate">
                      <input type="hidden" {...register("CorporateId")} />
                      <Select<OptionItem, false>
                        value={selectedCorporate}
                        options={corporateSelectOption}
                        placeholder="Select corporate"
                        isSearchable
                        isClearable
                        onChange={option => corporateSelectHandler(option)}
                        styles={SelectStyles as StylesConfig<OptionItem, false>}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </InputField>
                    {!!insuranceId ? (
                      <>
                        <InputField label="Card No./Policy No.">
                          <input
                            type="text"
                            placeholder="Enter Card No./Policy No."
                            className="input-field"
                            {...register("CardNo")}
                            minLength={8}
                            maxLength={20}
                          />
                        </InputField>
                        <InputField label="Policy NO.">
                          <input
                            type="text"
                            placeholder="Enter Policy No."
                            className="input-field"
                            {...register("PolicyNo")}
                            minLength={8}
                            maxLength={20}
                          />
                        </InputField>
                        <InputField label="Policy Card No.">
                          <input
                            type="text"
                            placeholder="Enter Policy Card No."
                            className="input-field"
                            {...register("PolicyCardNo")}
                            minLength={8}
                            maxLength={20}
                          />
                        </InputField>
                        <InputField label="Expiry Date">
                          <CustomDateInput
                            value={watch("ExpiryDate")}
                            onChange={(value: string) => methods.setValue("ExpiryDate", value)}
                          />
                        </InputField>
                        <InputField label="Card Holder Name">
                          <input
                            type="text"
                            placeholder="Enter Card Holder Name"
                            className="input-field"
                            {...register("CardHolder")}
                            onInput={allowOnlyText}
                          />
                        </InputField>
                        <InputField label="Referal NO.">
                          <input
                            type="text"
                            placeholder="Enter Referal No."
                            className="input-field"
                            {...register("ReferalNo")}
                            maxLength={20}
                          />
                        </InputField>
                        <InputField label="Referal Date">
                          <CustomDateInput
                            name="referralDate"
                            placeholder="Enter Referal Date"
                            value={watch("ReferalDate")}
                            onChange={(value: string) => methods.setValue("ReferalDate", value)}
                          />
                        </InputField>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 order-1 lg:order-2 rounded-lg items-center">
                  <div className="border border-gray-300 h-32 w-32 lg:h-40 lg:w-40 rounded-lg overflow-hidden bg-black">
                    {showWebcam ? (
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{
                          facingMode: "user",
                        }}
                      />
                    ) : capturedImagePreview || existingImagePreview ? (
                      <img
                        src={capturedImagePreview || existingImagePreview || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 bg-white">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <button
                      type="button"
                      className="save-btn w-32"
                      onClick={() => setShowWebcam(prev => !prev)}
                    >
                      {showWebcam ? "Close" : "Capture"}
                    </button>
                  </div>

                  {showWebcam && (
                    <div className="flex gap-2 w-full">
                      <button type="button" className="save-btn my-2" onClick={capturePhoto}>
                        Capture
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowWebcam(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      className="hidden"
                      onChange={photoUploadChangeHandler}
                    />
                    <button type="button" className="save-btn w-full" onClick={openPhotoPicker}>
                      Upload Photo
                    </button>
                    <button type="button" onClick={openDocumentHandler} className="save-btn">
                      Documents
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*other details */}
          <OtherDetails />
        </form>

        {showRegistrationButton && (
          <SaveButtons onButtonClick={buttonClickHandler} isEdit={isEdit} />
        )}

        {/* documents */}
        {!!renderDocument && (
          <DocumentPopup
            isOpen={openDocument}
            onClose={closeDocument}
            patientId={Number(watchedPatientId) || 0}
            fileStore={documentFileStore}
            setFileStore={setDocumentFileStore}
            payload={patientDocumentPayload}
            setPayload={setPatientDocumentPayload}
            validationErrors={documentValidationErrors}
            onClearDocumentError={clearDocumentValidationError}
            documentError={documentUploadError}
          />
        )}

        {!!loading && <CustomLoader isLoading={loading} />}
      </FormProvider>
    );
  }
);

PatientData.displayName = "PatientData";

export default PatientData;
