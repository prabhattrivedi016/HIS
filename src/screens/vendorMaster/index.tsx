import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import Animation from "../../components/animation";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { SelectStyles } from "../../components/customSelect";
import CheckboxOption from "../../components/multiSelectCheckBox";
import { ENDPOINTS } from "../../config/defaults";
import { Status, VendorMasterTableHeader } from "../../constants/constants";
import useGetBranchList from "../../hooks/useGetBranchList";
import useGlobalApi from "../../hooks/useGlobalApi";
import { usePickMaster } from "../../hooks/usePickMaster";
import { handleMultiSelectWithAll } from "../../utils/multiSelectAllHandler";
import vendorMasterSchema from "../../validation/vendorMasterSchema";
import {
  CityItem,
  CountryItem,
  DistrictItem,
  SelectItem,
  StateItem,
  TypeItem,
  VendorItem,
  VendorMasterPayload,
} from "./types";

const VendorMaster = () => {
  const getBranches = useGetBranchList();
  const { loading, error, fetchApi } = useGlobalApi();

  const typeList = usePickMaster("VendorTypeName");

  const typeSelectOption = useMemo(() => typeList?.pickMasterValue ?? [], [typeList]);

  const [branchIds, setBranchIds] = useState<number[]>([]);
  const [countryId, setCountryId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [stateList, setStateList] = useState<StateItem[]>([]);
  const [districtList, setDistrictList] = useState<DistrictItem[]>([]);
  const [cityList, setCityList] = useState<CityItem[]>([]);

  const [selectedBranches, setSelectedBranches] = useState<SelectItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<SelectItem | null>(null);
  const [selectedState, setSelectedState] = useState<SelectItem | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectItem | null>(null);
  const [selectedCity, setSelectedCity] = useState<SelectItem | null>(null);

  const [vendorList, setVendorList] = useState<VendorItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    getValues,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(vendorMasterSchema),
    defaultValues: {
      vendorId: 0,
      typeId: "0",
      type: "",
      vendorName: "",
      contactNo: "",
      email: "",
      dlno: "",
      gstinNo: "",
      address: "",
      pincode: "",
      isActive: 1,
      countryId: 0,
      stateId: 0,
      districtId: 0,
      cityId: 0,
      mappingBranch: "",
    },
  });

  // Auto-select type if options available and not set
  useEffect(() => {
    if (typeSelectOption?.length > 0) {
      const currentTypeId = getValues("typeId");
      if (!currentTypeId || currentTypeId === "0") {
        const first = typeSelectOption[0];
        setValue("typeId", first.key, { shouldValidate: true });
        setValue("type", first.value);
      }
    }
  }, [typeSelectOption, setValue, getValues]);

  /*-------------------------edit handler--------------------------*/
  const editHandler = async (item: VendorItem) => {
    // 1. Basic Fields
    setValue("vendorId", item.vendorId);
    setValue("vendorName", item.vendorName);
    setValue("contactNo", item.contactNo);
    setValue("email", item.email);
    setValue("dlno", item.dlno);
    setValue("gstinNo", item.gstinNo);
    setValue("address", item.address);
    setValue("pincode", item.fullAddress ? item.fullAddress.split("-").pop()?.trim() || "" : ""); // Extract pincode if needed or

    setValue("isActive", item.isActive);

    // 2. Type
    setValue("typeId", item.typeId.toString(), { shouldValidate: true });
    setValue("type", item.type);

    // 3. Location (Cascading)
    // Country
    setValue("countryId", item.countryId, { shouldValidate: true });

    const countryOption = countryList.find(c => c.countryId === item.countryId);
    if (countryOption) {
      setSelectedCountry({ label: countryOption.countryName, value: countryOption.countryId });
    }

    if (item.countryId && item.stateId) {
      const stateResp = await fetchApi(
        "GET",
        ENDPOINTS.GET_STATE_MASTER,
        {},
        { params: { countryId: item.countryId, isActive: Status?.ACTIVE } }
      );
      const states = stateResp?.data ?? [];
      setStateList(states);

      const stateOption = states.find((s: StateItem) => s.stateId === item.stateId);
      if (stateOption) {
        setSelectedState({ label: stateOption.stateName, value: stateOption.stateId });
        setValue("stateId", item.stateId, { shouldValidate: true });
      }

      // District
      if (item.stateId && item.districtId) {
        const districtResp = await fetchApi(
          "GET",
          ENDPOINTS.GET_DISTRICT_MASTER,
          {},
          { params: { stateId: item.stateId, isActive: Status?.ACTIVE } }
        );
        const districts = districtResp?.data ?? [];
        setDistrictList(districts);

        const districtOption = districts.find(
          (d: DistrictItem) => d.districtId === item.districtId
        );
        if (districtOption) {
          setSelectedDistrict({
            label: districtOption.districtName,
            value: districtOption.districtId,
          });
          setValue("districtId", item.districtId, { shouldValidate: true });
        }

        // City
        if (item.districtId && item.cityId) {
          const cityResp = await fetchApi(
            "GET",
            ENDPOINTS.GET_CITY_MASTER,
            {},
            { params: { districtId: item.districtId, isActive: Status?.ACTIVE } }
          );
          const cities = cityResp?.data ?? [];
          setCityList(cities);

          const cityOption = cities.find((c: CityItem) => c.cityId === item.cityId);
          if (cityOption) {
            setSelectedCity({ label: cityOption.cityName, value: cityOption.cityId });
            setValue("cityId", item.cityId, { shouldValidate: true });
          }
        }
      }
    }

    if (item.mappingBranch) {
      const branchIds = item.mappingBranch.split(",").map(Number);
      setBranchIds(branchIds);
      setValue("mappingBranch", item.mappingBranch, { shouldValidate: true });

      const selectedBranchOptions = branchOptions.filter(b => branchIds.includes(b.value));
      setSelectedBranches(selectedBranchOptions);
    } else {
      setSelectedBranches([]);
      setBranchIds([]);
      setValue("mappingBranch", "");
    }
  };

  const vendorId = watch("vendorId");
  const isEdit = Boolean(vendorId);
  const buttonTitle = isEdit ? "Update" : "Create";

  /*---------------------branches------------------------ */
  const branchList = useMemo(() => getBranches?.branchList?.data ?? [], [getBranches]);

  const branchOptions = useMemo<readonly SelectItem[]>(() => {
    return [
      { label: "All", value: 0 },
      ...branchList.map(b => ({
        label: b?.branchName,
        value: b?.branchId,
      })),
    ];
  }, [branchList]);

  const branchChangeHandler = (options: readonly SelectItem[] | null) => {
    const result = handleMultiSelectWithAll(options, selectedBranches, branchOptions);

    setSelectedBranches(result.selectedOptions);
    setBranchIds(result.selectedIds);

    setValue("mappingBranch", result.selectedIds.join(","), {
      shouldValidate: true,
      shouldDirty: true,
    });

    clearErrors("mappingBranch");
  };

  /*----------------------country List---------------------- */
  const getCountry = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_COUNTRY_MASTER,
      {},
      {
        params: { isActive: Status?.ACTIVE },
      }
    );

    setCountryList(resp?.data ?? []);
  }, []);

  const countrySelectOption = useMemo<readonly SelectItem[]>(() => {
    return (
      countryList?.map((c: CountryItem) => ({
        label: c?.countryName,
        value: c?.countryId,
      })) || []
    );
  }, [countryList]);

  const countrySelectHandler = (option: SelectItem | null) => {
    setSelectedCountry(option);
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedCity(null);

    setValue("countryId", option?.value ?? 0, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // reset dependent fields
    setValue("stateId", 0);
    setValue("districtId", 0);
    setValue("cityId", 0);

    if (option?.value) {
      getState(option?.value);
    }
  };

  useEffect(() => {
    getCountry();
    getVendorMaster();
  }, []);

  /*-----------------------state lists------------------ */
  const getState = async (countryId: number) => {
    if (!countryId) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_STATE_MASTER,
      {},
      {
        params: { countryId, isActive: Status?.ACTIVE },
      }
    );
    setStateList(resp?.data ?? []);
  };

  const stateSelectOption = useMemo<readonly SelectItem[]>(() => {
    return (
      stateList?.map((s: StateItem) => ({
        label: s?.stateName,
        value: s?.stateId,
      })) || []
    );
  }, [stateList]);

  const stateSelectHandler = (option: SelectItem | null) => {
    setSelectedState(option);
    setSelectedDistrict(null);
    setSelectedCity(null);

    setValue("stateId", option?.value ?? 0, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // reset dependent fields
    setValue("districtId", 0);
    setValue("cityId", 0);

    if (option?.value) {
      getDistrict(option?.value);
    }
  };

  /*---------------------District List----------------------- */
  const getDistrict = async (stateId: number) => {
    if (!stateId) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISTRICT_MASTER,
      {},
      {
        params: { stateId, isActive: Status?.ACTIVE },
      }
    );
    setDistrictList(resp?.data ?? []);
  };

  const districtSelectOption = useMemo<readonly SelectItem[]>(() => {
    return (
      districtList?.map((d: DistrictItem) => ({
        label: d?.districtName,
        value: d?.districtId,
      })) || []
    );
  }, [districtList]);

  const districtSelectHandler = (option: SelectItem | null) => {
    setSelectedDistrict(option);
    setSelectedCity(null);

    setValue("districtId", option?.value ?? 0, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // reset dependent field
    setValue("cityId", 0);

    if (option?.value) {
      getCity(option?.value);
    }
  };

  /*------------------city list----------------------- */
  const getCity = async (districtId: number) => {
    if (!districtId) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CITY_MASTER,
      {},
      {
        params: { districtId, isActive: Status?.ACTIVE },
      }
    );
    setCityList(resp?.data ?? []);
  };
  const citySelectOption = useMemo<readonly SelectItem[]>(() => {
    return (
      cityList?.map((c: CityItem) => ({
        label: c?.cityName,
        value: c?.cityId,
      })) || []
    );
  }, [cityList]);

  const citySelectHandler = (option: SelectItem | null) => {
    setSelectedCity(option);

    setValue("cityId", option?.value ?? 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /*------------------get location by pincode----------------------- */
  const getLocationByPincode = async (pincode: string) => {
    if (!pincode || pincode.trim() === "") return;

    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_LOCATION_BY_PINCODE,
        {},
        {
          params: { pincode: pincode.trim() },
        }
      );

      const locationData = resp?.data;
      if (!locationData) return;

      if (locationData.countryId) {
        const countryOption =
          countrySelectOption.find(c => c.value === locationData.countryId) ||
          (countryList.find(c => c.countryId === locationData.countryId)
            ? {
                label:
                  countryList.find(c => c.countryId === locationData.countryId)?.countryName ?? "",
                value: locationData.countryId,
              }
            : null);

        if (countryOption) {
          countrySelectHandler(countryOption);
        } else {
          setValue("countryId", locationData.countryId, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }

        if (locationData.stateId) {
          const stateResp = await fetchApi(
            "GET",
            ENDPOINTS.GET_STATE_MASTER,
            {},
            { params: { countryId: locationData.countryId, isActive: Status?.ACTIVE } }
          );

          const states = stateResp?.data ?? [];
          setStateList(states);

          const stateOptionRaw = states.find((s: StateItem) => s.stateId === locationData.stateId);
          if (stateOptionRaw) {
            const stateOption = { label: stateOptionRaw.stateName, value: stateOptionRaw.stateId };
            setSelectedState(stateOption);
            setValue("stateId", stateOption.value, { shouldDirty: true, shouldValidate: true });

            // Load districts
            if (locationData.districtId) {
              const districtResp = await fetchApi(
                "GET",
                ENDPOINTS.GET_DISTRICT_MASTER,
                {},
                { params: { stateId: locationData.stateId, isActive: Status?.ACTIVE } }
              );
              const districts = districtResp?.data ?? [];
              setDistrictList(districts);

              const districtOptionRaw = districts.find(
                (d: DistrictItem) => d.districtId === locationData.districtId
              );
              if (districtOptionRaw) {
                const districtOption = {
                  label: districtOptionRaw.districtName,
                  value: districtOptionRaw.districtId,
                };
                setSelectedDistrict(districtOption);
                setValue("districtId", districtOption.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });

                // Load cities
                if (locationData.cityId) {
                  const cityResp = await fetchApi(
                    "GET",
                    ENDPOINTS.GET_CITY_MASTER,
                    {},
                    { params: { districtId: locationData.districtId, isActive: Status?.ACTIVE } }
                  );
                  const cities = cityResp?.data ?? [];
                  setCityList(cities);

                  const cityOptionRaw = cities.find(
                    (c: CityItem) => c.cityId === locationData.cityId
                  );
                  if (cityOptionRaw) {
                    const cityOption = {
                      label: cityOptionRaw.cityName,
                      value: cityOptionRaw.cityId,
                    };
                    setSelectedCity(cityOption);
                    setValue("cityId", cityOption.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching location by pincode:", error);
    }
  };

  /*----------------------vendor details list--------------------------- */
  const getVendorMaster = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_VENDOR_MASTER_LIST);
    setVendorList(resp?.data ?? []);
  };

  /*-----------------------type change hanlder--------- */
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selected = typeSelectOption.find((t: TypeItem) => t.key === id);

    console.log("selected", selected);

    setValue("typeId", id, { shouldValidate: true });
    setValue("type", selected?.value ?? "");
  };

  /*---------------------------submit handler---------------------*/
  const onSubmit = async (data: any) => {
    const payload: VendorMasterPayload = {
      vendorId: Number(data.vendorId),
      typeId: Number(data.typeId),
      type: data.type,
      vendorName: data.vendorName,
      contactNo: data.contactNo,
      email: data.email,
      dlno: data.dlno,
      gstinNo: data.gstinNo,
      address: data.address,
      countryId: Number(data.countryId),
      stateId: Number(data.stateId),
      districtId: Number(data.districtId),
      cityId: Number(data.cityId),
      mappingBranch: data.mappingBranch,
      isActive: Number(data.isActive),
      pincode: Number(data.pincode),
    };

    const resp = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_VENDOR_MASTER, payload);

    if (resp?.result) {
      getVendorMaster();
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedBranches([]);
    setBranchIds([]);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedCity(null);
    setCountryList([]);
    setStateList([]);
    setDistrictList([]);
    setCityList([]);
    setValue("vendorId", 0);
    /*-------------------edit handler-------------------- */
    const editHandler = async (item: VendorItem) => {
      setVendorForm({
        vendorId: item.vendorId,
        typeId: item.typeId,
        type: item.type,
        vendorName: item.vendorName,
        contactNo: item.contactNo,
        email: item.email,
        dlno: item.dlno,
        gstinNo: item.gstinNo,
        address: item.address,
        isActive: item.isActive,
      });

      /*---------------------branch-------------------- */

      const branchIdList = item.mappingBranch ? item.mappingBranch.split(",").map(Number) : [];

      setBranchIds(branchIdList);
      setSelectedBranches(branchOptions.filter(b => branchIdList.includes(b.value)));

      /*---------------------country -------------------- */

      if (item.countryId) {
        setCountryId(item.countryId);

        const countryOption = countrySelectOption.find(c => c.value === item.countryId);

        setSelectedCountry(countryOption || null);

        /*----------------------state -------------------- */

        const stateResp = await fetchApi(
          "GET",
          ENDPOINTS.GET_STATE_MASTER,
          {},
          {
            params: {
              countryId: item.countryId,
              isActive: Status.ACTIVE,
            },
          }
        );

        const states = stateResp?.data ?? [];
        setStateList(states);

        if (item.stateId) {
          setStateId(item.stateId);

          const stateOption = states
            .map(s => ({
              label: s.stateName,
              value: s.stateId,
            }))
            .find(s => s.value === item.stateId);

          setSelectedState(stateOption || null);

          /*----------------------district -------------------- */

          const districtResp = await fetchApi(
            "GET",
            ENDPOINTS.GET_DISTRICT_MASTER,
            {},
            {
              params: {
                stateId: item.stateId,
                isActive: Status.ACTIVE,
              },
            }
          );

          const districts = districtResp?.data ?? [];
          setDistrictList(districts);

          if (item.districtId) {
            setDistrictId(item.districtId);

            const districtOption = districts
              .map(d => ({
                label: d.districtName,
                value: d.districtId,
              }))
              .find(d => d.value === item.districtId);

            setSelectedDistrict(districtOption || null);

            /*----------------------city -------------------- */

            const cityResp = await fetchApi(
              "GET",
              ENDPOINTS.GET_CITY_MASTER,
              {},
              {
                params: {
                  districtId: item.districtId,
                  isActive: Status.ACTIVE,
                },
              }
            );

            const cities = cityResp?.data ?? [];
            setCityList(cities);

            if (item.cityId) {
              setCityId(item.cityId);

              const cityOption = cities
                .map(c => ({
                  label: c.cityName,
                  value: c.cityId,
                }))
                .find(c => c.value === item.cityId);

              setSelectedCity(cityOption || null);
            }
          }
        }
      }
    };
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Vendor Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Vendor Master</span>
      </nav>

      <div className="card">
        <h2 className="card-title ">Vendor Details</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("type")} />
          <input type="hidden" {...register("typeId")} />

          <div className="form-grid-4">
            <InputField label="Vendor Name" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                {...register("vendorName")}
              />
              {errors.vendorName && (
                <p className="input-field-error">{errors.vendorName.message}</p>
              )}
            </InputField>

            <InputField label="Contact Number" required>
              <input
                className="input-field"
                placeholder="Enter contact number"
                {...register("contactNo")}
              />
              {errors.contactNo && <p className="input-field-error">{errors.contactNo.message}</p>}
            </InputField>

            <InputField label="Email">
              <input className="input-field" placeholder="Enter email" {...register("email")} />
            </InputField>

            <InputField label="DL Number">
              <input className="input-field" placeholder="Enter DL Number" {...register("dlno")} />
            </InputField>
            <InputField label="GSTIN Number" required>
              <input
                className="input-field"
                placeholder="Enter GSTIN number"
                {...register("gstinNo")}
              />
              {errors.gstinNo && <p className="input-field-error">{errors.gstinNo.message}</p>}
            </InputField>
            <InputField label="Address">
              <input className="input-field" placeholder="Enter address" {...register("address")} />
            </InputField>

            <InputField label="PinCode" required>
              <input
                className="input-field"
                {...register("pincode")}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const pincode = getValues("pincode");
                    if (pincode) {
                      getLocationByPincode(pincode.toString());
                    }
                  }
                }}
                placeholder="Enter pin code and press Enter"
              />
              {errors.pincode && <p className="input-field-error">{errors.pincode.message}</p>}
            </InputField>

            <InputField label="Country" required>
              <Select
                value={selectedCountry}
                {...register("countryId")}
                options={countrySelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={countrySelectHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.countryId && <p className="input-field-error">{errors.countryId.message}</p>}
            </InputField>

            <InputField label="State" required>
              <Select
                value={selectedState}
                {...register("stateId")}
                options={stateSelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={stateSelectHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.stateId && <p className="input-field-error">{errors.stateId.message}</p>}
            </InputField>

            <InputField label="District" required>
              <Select
                value={selectedDistrict}
                {...register("districtId")}
                options={districtSelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={districtSelectHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.districtId && (
                <p className="input-field-error">{errors.districtId.message}</p>
              )}
            </InputField>
            <InputField label="City" required>
              <Select
                value={selectedCity}
                {...register("cityId")}
                options={citySelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={citySelectHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.cityId && <p className="input-field-error">{errors.cityId.message}</p>}
            </InputField>
            <InputField label="Active" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>

            <InputField label="Type" required>
              <select {...register("typeId")} onChange={handleTypeChange} className="input-field">
                {typeSelectOption?.map((t: TypeItem) => (
                  <option key={t.key} value={t.key}>
                    {t.value}
                  </option>
                ))}
              </select>
              {errors.typeId && <p className="input-field-error">{errors.typeId.message}</p>}
            </InputField>

            <InputField label="Branches" required>
              <Select
                isMulti
                value={selectedBranches}
                options={branchOptions}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onChange={branchChangeHandler}
                components={{ Option: CheckboxOption }}
                styles={SelectStyles}
                menuPortalTarget={document.body}
              />

              {errors.mappingBranch && (
                <p className="input-field-error">{errors.mappingBranch.message}</p>
              )}
            </InputField>
          </div>

          <div className="form-actions-responsive ">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button " onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* ------------------------------vendor master table------------------------------ */}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Vendor Master List</h2>

          <button onClick={() => setShowDetails(p => !p)}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-scroll-wrapper">
              <div className="table-size">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {VendorMasterTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {vendorList.length === 0 && (
                      <tr>
                        <td colSpan={VendorMasterTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {vendorList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>

                        <td className="table-td">{item.vendorName}</td>
                        <td className="table-td">{item.type}</td>
                        <td className="table-td">{item.contactNo}</td>
                        <td className="table-td">{item.email}</td>
                        <td className="table-td">{item.dlno}</td>
                        <td className="table-td">{item.gstinNo}</td>
                        <td className="table-td">{item.address}</td>

                        <td className="table-td" onClick={() => editHandler(item)}>
                          <i className="fa-solid fa-edit text-xl text-blue-500 active:scale-90" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Animation>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default VendorMaster;
