import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { OptionItem, SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { showError, showSuccess } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  defaultPatientRegistrationValues,
  PatientRegistrationFormItem,
  patientRegistrationSchema,
} from "@/validation/patientRegistrationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ChangeEvent,
  forwardRef,
  useCallback,
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
  CorporateItem,
  InsuranceItem,
  PatientDataEditItem,
  PatientDataHandle,
  PatientDataProps,
} from "../types";
import Address from "./Address";
import {
  formatDate,
  getAgeFromDob,
  getDobFromAge,
  resolveMaritalStatus,
  resolvePickValue,
} from "./dobHelper";
import DocumentPopup from "./DocumentPopup";
import OtherDetails from "./OtherDetails";
import { SaveButtons } from "./patientButtons";

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

const PatientData = forwardRef<PatientDataHandle, PatientDataProps>(
  (
    {
      showRegistrationButton = true,
      selectedPatientId: selectedPatientIdFromProps = null,
      onPayloadChange,
    }: PatientDataProps,
    ref
  ) => {
    const { loading, error, fetchApi } = useGlobalApi();

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

    const [showWebcam, setShowWebcam] = useState(false);
    const [capturedImageFile, setCapturedImageFile] = useState<File | null>(null);
    const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);

    const methods = useForm<PatientRegistrationFormItem>({
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
    // default corporate value
    const defaultCorporate = { value: 0, label: "CASH" };

    useEffect(() => {
      if (!insuranceId) {
        setSelectedCorporate(defaultCorporate);
        setValue("CorporateId", defaultCorporate?.value);
      }
    }, [insuranceId]);

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

    // corporate list
    const getCorporateList = async (corporateId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CORPORATE_MASTER_LIST,
        {},
        { params: { corporateId } },
        { component: "Patient Registration" }
      );
      const list = resp?.data ?? [];
      setCorporateList(list);
      return list as CorporateItem[];
    };

    const corporateSelectOption = useMemo(() => {
      if (!insuranceId) {
        return [defaultCorporate];
      }
      return corporateList.map(item => ({
        value: item.corporateId,
        label: item.corporateName,
      }));
    }, [corporateList, insuranceId]);

    useEffect(() => {
      getInsuranceList();
    }, []);

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
        setValue("Gender", remappedGender, { shouldDirty: false, shouldValidate: true });
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

    // submit handler1
    const onSubmit = async (data: any) => {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
        { component: "Patient Registration" }
      );
      if (!resp?.result) {
        showError(error?.message ?? "Something went wrong");
        return;
      }

      showSuccess(resp?.message ?? "Patient registered successfully");
      resetPatientForm();
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
      setSelectedCorporate(defaultCorporate);
      setPrefillPatientData(null);
      setInsuranceId(0);
      setCorporateList([]);
      setValue("CorporateId", 0);
      setIdProofTypeValue("");
      setCapturedImageFile(null);
      setCapturedImagePreview(null);
    };

    // edit mode
    const getEditPatientData = async (patientId: number) => {
      console.log("this function is called");

      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_MASTER,
        {},
        { params: { patientId: patientId } },
        { component: "Patient Registration" }
      );
      if (!resp?.result) {
        showError(resp?.message ?? "Something went wrong");
        return;
      }
      console.log("resp", resp?.data);

      const data = resp?.data?.[0] as PatientDataEditItem;

      console.log("data of edit ", data);

      setPrefillPatientData(data);

      const mappedTitle = resolvePickValue(titleList, data?.title, {
        mr: ["mr", "mister"],
        mrs: ["mrs", "misses", "mistress"],
        miss: ["miss", "ms"],
        dr: ["dr", "doctor", "doc"],
        master: ["master"],
        mx: ["mx"],
        bo: ["bo", "babyof", "sonof", "daughterof", "wardof", "careof", "co"],
      });

      const mappedGender = resolvePickValue(patientGenderList, data?.gender, {
        male: ["male", "m", "man", "boy"],
        female: ["female", "f", "woman", "girl"],
        other: ["other", "o", "others", "transgender", "trans"],
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
        Gender: mappedGender,
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
        const matchedCorporate = list.find(item => item?.corporateId === Number(data?.corporateId));
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
    };

    useEffect(() => {
      if (selectedPatientIdFromProps) {
        getEditPatientData(selectedPatientIdFromProps);
      }
    }, [selectedPatientIdFromProps]);

    useEffect(() => {
      const subscription = methods.watch(values => {
        onPayloadChange?.(values as Record<string, unknown>);
      });
      onPayloadChange?.(methods.getValues() as Record<string, unknown>);
      return () => subscription.unsubscribe();
    }, [methods, onPayloadChange]);

    // id proof type handler
    const idProofTypeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setValue("IdProofName", value);
      setIdProofTypeValue(value);
    };

    // button click handler
    const buttonClickHandler = (name: string) => {
      if (name === "save") {
        methods.handleSubmit(onSubmit, formErrors => {
          const firstError = Object.values(formErrors)[0];
          const message =
            typeof firstError?.message === "string"
              ? firstError.message
              : "Please fix validation errors before submitting";
          showError(message);
        })();
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
        validateForm: async () => methods.trigger(undefined, { shouldFocus: true }),
      }),
      [methods]
    );

    // open document handler
    const openDocumentHandler = () => {
      setRenderDocument(true);
      setOpenDocument(true);
    };

    const closeDocument = useCallback(() => {
      setRenderDocument(false);
    }, []);

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
                        className="input-field "
                        placeholder="UHID number"
                        {...register("UhidOrBarcode")}
                        readOnly
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
                          <input type="text" className="input-field" {...register("FirstName")} />
                          {errors.FirstName && (
                            <p className="input-field-error">{errors.FirstName.message}</p>
                          )}
                        </InputField>
                      </div>
                    </div>
                    <InputField label="Middle Name">
                      <input type="text" className="input-field" {...register("MiddleName")} />
                    </InputField>
                    <InputField label="Last Name">
                      <input type="text" className="input-field" {...register("LastName")} />
                    </InputField>
                    <div className="flex gap-1 w-full overflow-auto">
                      <InputField label="Age(yrs)" required>
                        <input
                          type="text"
                          className="input-field"
                          {...register("AgeYears")}
                          onInput={allowOnlyNumbers}
                        />
                        {errors.AgeYears && (
                          <p className="input-field-error">{errors.AgeYears.message}</p>
                        )}
                      </InputField>

                      <InputField label="Months" required>
                        <input
                          type="text"
                          className="input-field"
                          {...register("AgeMonths")}
                          onInput={allowOnlyNumbers}
                        />
                        {errors.AgeMonths && (
                          <p className="input-field-error">{errors.AgeMonths.message}</p>
                        )}
                      </InputField>

                      <InputField label="Days" required>
                        <input
                          type="text"
                          className="input-field"
                          {...register("AgeDays")}
                          onInput={allowOnlyNumbers}
                        />
                        {errors.AgeDays && (
                          <p className="input-field-error">{errors.AgeDays.message}</p>
                        )}
                      </InputField>
                    </div>
                    <InputField label="Dob" required>
                      <input type="hidden" {...register("Dob")} />
                      <CustomDateInput
                        name="Dob"
                        value={watch("Dob") || ""}
                        max={today}
                        onChange={(value: string) => setValue("Dob", value)}
                      />
                      {errors.Dob && <p className="input-field-error">{errors.Dob.message}</p>}
                    </InputField>
                    <InputField label="Gender" required>
                      <select className="input-field" {...register("Gender")}>
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
                        <option value="">Select</option>
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
                      <input type="text" className="input-field" {...register("RelativeName")} />
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
                        <input type="text" className="input-field" {...register("IdProofNumber")} />
                        {errors.IdProofNumber && (
                          <p className="input-field-error">{errors.IdProofNumber.message}</p>
                        )}
                      </InputField>
                    )}
                    <InputField label="Contact No.(Self)" required>
                      <input
                        type="text"
                        className="input-field"
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
                      <input type="email" className="input-field" {...register("Email")} />
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
                          <input type="text" className="input-field" {...register("CardNo")} />
                        </InputField>
                        <InputField label="Policy NO.">
                          <input type="text" className="input-field" {...register("PolicyNo")} />
                        </InputField>
                        <InputField label="Policy Card No.">
                          <input
                            type="text"
                            className="input-field"
                            {...register("PolicyCardNo")}
                          />
                        </InputField>
                        <InputField label="Expiry Date">
                          <CustomDateInput
                            value={watch("ExpiryDate")}
                            onChange={(value: string) => methods.setValue("ExpiryDate", value)}
                          />
                        </InputField>
                        <InputField label="Card Holder Name">
                          <input type="text" className="input-field" {...register("CardHolder")} />
                        </InputField>
                        <InputField label="Referal NO.">
                          <input type="text" className="input-field" {...register("ReferalNo")} />
                        </InputField>
                        <InputField label="Referal Date">
                          <CustomDateInput
                            name="referralDate"
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
                    ) : capturedImagePreview ? (
                      <img src={capturedImagePreview} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 bg-white">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <button
                      type="button"
                      className="save-btn w-full"
                      onClick={() => setShowWebcam(prev => !prev)}
                    >
                      {showWebcam ? "Close Camera" : "Open Camera"}
                    </button>
                  </div>

                  {showWebcam && (
                    <div className="flex gap-2">
                      <button type="button" className="save-btn" onClick={capturePhoto}>
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
                    <button className="save-btn w-full" type="button" onClick={openDocumentHandler}>
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
        {!!renderDocument && <DocumentPopup isOpen={openDocument} onClose={closeDocument} />}

        {!!loading && <CustomLoader isLoading={loading} />}
      </FormProvider>
    );
  }
);

PatientData.displayName = "PatientData";

export default PatientData;

/*
{
    "patientId": 28,
    "branchId": 1,
    "uhid": "GWS/00000016",
    "title": "MR.",
    "firstName": "PRABHAT",
    "middleName": null,
    "lastName": null,
    "patientName": "MR. PRABHAT",
    "ageYears": 0,
    "ageMonths": 0,
    "ageDays": 5,
    "age": "0Y 0M 5D",
    "dob": "05-04-2026",
    "gender": "MALE",
    "maritalStatus": null,
    "relation": null,
    "relativeName": null,
    "idProofName": null,
    "idProofNumber": null,
    "contactNumber": "1234567890",
    "emergencyContactNumber": "3456789234",
    "email": null,



    "privilegedCardNumber": null,
    "address": "VARANASI",
    "countryId": 2,
    "country": "AFGHANISTAN",
    "stateId": 30,
    "state": "ABC",
    "districtId": 793,
    "district": "AB",
    "cityId": 149693,
    "city": "MNOPQ",
    "insuranceCompanyId": 0,
    "corporateId": 0,
    "cardNo": null,

    "isVaccination": 0,
    "vipPatient": null,
    "patientImagePath": "",
    "policyNo": null,
    "policyCardNo": null,
    "expiryDate": null,
    "cardHolder": null,
    "referalNo": null,
    "referalDate": null,
    "landlineNo": "gfghjk",
    "birthPlace": "dfghjk",
    "religion": null,
    "relationPhone": null,
    "relationAge": null,
    "relationGender": null,
    "emG_FirstName": null,
    "emG_LastName": null,
    "emG_Relation": null,
    "emG_MobileNo": null,
    "emG_ResidentNo": null,
    "emG_Address": null,
    "isInternational": 0,
    "locality": null,
    "passportNumber": null,
    "internationalNo": "fghjk",
    "membershipNo": "dfghjk",
    "patientType": null,
    "identityMark": null,
    "identityMark2": null,
    "referenceType": null,
    "remarks": null,
    "doctorId": 1002,
    "ipdNo": 0,
    "dayCareNo": 0,
    "dialysisNo": 0,
    "emergencyNo": 0
} */

/*
    UhidOrBarcode
GWS/00000016
UniqueId
Pincode
ipdNumber
Remarks
fdghjk
ReferenceType
Government Scheme
IdentityMark2
fghj
IdentityMark
e45678
PatientType
Dependent
MembershipNo
dfghjk
InternationalNo
fghjk
PassportNumber
123456789876
Locality
45678
IsInternational
1
EMG_Address
fghj
EMG_ResidentNo
45678
EMG_MobileNo
3456789
EMG_Relation
fghjk
EMG_LastName
dfghjk
EMG_FirstName
ghjkl
RelationGender
RelationAge
4567890
RelationPhone
3456789
Religion
Hindu
BirthPlace
dfghjk
LandlineNo
gfghjk
HealthIdNumber
HealthId
OnlinePtId
0
ReferalNo
45678
ReferalDate
CardHolder
dfghj
ExpiryDate
2026-04-10
PolicyCardNo
345678
PolicyNo
4789
VipPatient
IsVaccination
0
PatientImageFile
CardNo
345678
CorporateId
3
InsuranceCompanyId
3
City
MNOPQ
CityId
149693
District
AB
DistrictId
793
State
ABC
StateId
30
Country
AFGHANISTAN
CountryId
2
Address
VARANASI
PrivilegedCardNumber
Email
EmergencyContactNumber
3456789234
SelfContactNumber
1234567890
IdProofName
IdProofNumber
RelativeName
Relation
MaritalStatus
Gender
Male
Dob
2026-04-06
AgeDays
5
AgeMonths
0
AgeYears
0
LastName
MiddleName
FirstName
PRABHAT
Title
Mr.
BranchId
1
PatientId
28
ReferralDate
2026-04-09 */
