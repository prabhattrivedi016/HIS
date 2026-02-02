import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { SelectStyles } from "../../components/customSelect";
import CheckboxOption from "../../components/multiSelectCheckBox";
import { ENDPOINTS } from "../../config/defaults";
import { Status, VendorMasterTableHeader } from "../../constants/constants";
import useGetBranchList from "../../hooks/useGetBranchList";
import useGlobalApi from "../../hooks/useGlobalApi";
import { usePickMaster } from "../../hooks/usePickMaster";
import { CityItem, CountryItem, DistrictItem, SelectItem, StateItem, VendorItem } from "./types";

const VendorMaster = () => {
  /*----------------------branches--------------------------- */
  const getBranches = useGetBranchList();
  const { loading, error, fetchApi } = useGlobalApi();

  const typeList = usePickMaster({ fieldName: "VendorTypeName" });

  const typeSelectOption = useMemo(() => typeList?.pickMasterValue?.data ?? [], [typeList]);

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

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [vendorList, setVendorList] = useState<VendorItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [vendorForm, setVendorForm] = useState({
    vendorId: 0,
    typeId: 0,
    type: "",
    vendorName: "",
    contactNo: "",
    email: "",
    dlno: "",
    gstinNo: "",
    address: "",
    isActive: 1,
  });

  const buttonTitle = vendorForm?.vendorName ? "Update" : "Save";

  /*-------------------branches------------------------- */

  const branchList = useMemo(() => getBranches?.branchList?.data ?? [], [getBranches]);

  const branchOptions = useMemo<readonly SelectItem[]>(() => {
    return [
      { label: "All", value: 0 },
      ...branchList.map(b => ({
        label: b.branchName,
        value: b.branchId,
      })),
    ];
  }, [branchList]);

  const branchChangeHandler = (options: readonly SelectItem[] | null) => {
    const selected = options ?? [];

    const allOption = branchOptions.find(o => o.value === 0)!;
    const realOptions = branchOptions.filter(o => o.value !== 0);

    const hasAll = selected.some(o => o.value === 0);
    const hadAllBefore = selectedBranches.some(o => o.value === 0);

    if (!hasAll && hadAllBefore) {
      setSelectedBranches([]);
      setBranchIds([]);
      return;
    }

    if (hasAll && !hadAllBefore) {
      setSelectedBranches([allOption, ...realOptions]);
      setBranchIds(realOptions.map(o => o.value));
      return;
    }

    const filtered = selected.filter(o => o.value !== 0);

    setSelectedBranches(filtered);
    setBranchIds(filtered.map(o => o.value));
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

  useEffect(() => {
    getCountry();
    getVendorMaster();
  }, []);

  const countrySelectHandler = (option: SelectItem) => {
    setSelectedCountry(option);
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedCity(null);

    if (option?.value) {
      setCountryId(option?.value);
      getState(option?.value);
    }
  };

  const countrySelectOption = useMemo<readonly SelectItem[]>(() => {
    return (
      countryList?.map((c: CountryItem) => ({
        label: c?.countryName,
        value: c?.countryId,
      })) || []
    );
  }, [countryList]);

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

  const stateSelectHandler = (option: SelectItem) => {
    setSelectedState(option);
    setSelectedDistrict(null);
    setSelectedCity(null);

    if (option?.value) {
      setStateId(option?.value);
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

  const districtSelectHandler = (option: SelectItem) => {
    setSelectedDistrict(option);
    setSelectedCity(null);

    if (option?.value) {
      setDistrictId(option?.value);
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

  const citySelectHandler = (option: SelectItem) => {
    setSelectedCity(option);
    setCityId(option?.value);
  };

  /*----------------------vendor details list--------------------------- */
  const getVendorMaster = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_VENDOR_MASTER_LIST);
    setVendorList(resp?.data ?? []);
  };

  /*------------------input handler-------------------------- */

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setVendorForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /* -------------------- payload -------------------- */
  const buildPayload = () => ({
    vendorId: vendorForm.vendorId,
    typeId: vendorForm.typeId,
    type: vendorForm.type,
    vendorName: vendorForm.vendorName,
    contactNo: vendorForm.contactNo,
    email: vendorForm.email,
    dlno: vendorForm.dlno,
    gstinNo: vendorForm.gstinNo,
    address: vendorForm.address,
    countryId: countryId ?? 0,
    stateId: stateId ?? 0,
    districtId: districtId ?? 0,
    cityId: cityId ?? 0,
    mappingBranch: branchIds.join(","),
    isActive: vendorForm.isActive,
  });

  /* -------------------- submit -------------------- */
  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = buildPayload();

    const resp = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_VENDOR_MASTER, payload);

    resetForm();
    getVendorMaster();
  };

  /* -------------------- reset -------------------- */
  const resetForm = () => {
    setVendorForm({
      vendorId: 0,
      typeId: 0,
      type: "",
      vendorName: "",
      contactNo: "",
      email: "",
      dlno: "",
      gstinNo: "",
      address: "",
      isActive: 1,
    });

    setBranchIds([]);
    setSelectedBranches([]);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedCity(null);
  };

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

  return (
    <div className="bg-gray-50 min-h-screen px-3 py-4 -mt-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Master</h1>
        <nav className="text-sm text-gray-500 flex  gap-2 mt-1">
          <NavLink to="/dashboard" className="hover:underline">
            Home
          </NavLink>
          <span>››</span>
          <span>Vendor Master</span>
        </nav>
      </div>
      <div className="shadow-lg m-2 p-6 rounded-lg bg-white">
        <h2 className="mb-4 text-xl font-semibold">Vendor Details</h2>
        <form onSubmit={submitHandler}>
          <div className="form-grid-4">
            <InputField label="Map in Branches" required>
              <Select
                isMulti
                value={selectedBranches}
                options={branchOptions}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onChange={branchChangeHandler}
                components={{ Option: CheckboxOption }}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
              />
            </InputField>
            <InputField label="Type" required>
              <select
                className="input-field"
                name="typeId"
                value={vendorForm.typeId}
                onChange={e => {
                  const selectedId = Number(e.target.value);

                  const selectedType =
                    typeSelectOption.find(t => Number(t.key) === selectedId)?.value || "";

                  setVendorForm(prev => ({
                    ...prev,
                    typeId: selectedId,
                    type: selectedType,
                  }));
                }}
              >
                {typeSelectOption?.map(t => (
                  <option key={t.key} value={t.key}>
                    {t.value}
                  </option>
                ))}
              </select>
              {!!isSubmitting && !vendorForm?.type && (
                <p className="input-field-error">Type is required</p>
              )}
            </InputField>

            <InputField label=" Vendor Name" required>
              <input
                className="input-field"
                name="vendorName"
                value={vendorForm.vendorName}
                onChange={inputHandler}
                placeholder="Enter vendor name"
              />
              {!!isSubmitting && !vendorForm?.vendorName && (
                <p className="input-field-error">Vendor Name is required</p>
              )}
            </InputField>
            <InputField label="Contact Number" required>
              <input
                className="input-field"
                name="contactNo"
                value={vendorForm.contactNo}
                onChange={inputHandler}
                placeholder="Enter contact number"
              />
              {!!isSubmitting && !vendorForm?.contactNo && (
                <p className="input-field-error">Contact is required</p>
              )}
            </InputField>
            <InputField label="Email">
              <input
                className="input-field"
                name="email"
                value={vendorForm.email}
                onChange={inputHandler}
                placeholder="Enter email"
              />
            </InputField>
            <InputField label="DL Number">
              <input
                className="input-field"
                name="dlno"
                value={vendorForm.dlno}
                onChange={inputHandler}
                placeholder="Enter DL Number"
              />
            </InputField>
            <InputField label="GSTIN Number" required>
              <input
                className="input-field"
                name="gstinNo"
                value={vendorForm.gstinNo}
                onChange={inputHandler}
                placeholder="Enter GSTIN number"
              />
              {!!isSubmitting && !vendorForm?.gstinNo && (
                <p className="input-field-error">GSTIN is required</p>
              )}
            </InputField>
            <InputField label="Address">
              <input
                className="input-field"
                name="address"
                value={vendorForm.address}
                onChange={inputHandler}
                placeholder="Enter address"
              />
            </InputField>
            <InputField label="Country" required>
              <Select
                value={selectedCountry}
                options={countrySelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={countrySelectHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>
            <InputField label="State" required>
              <Select
                value={selectedState}
                options={stateSelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={stateSelectHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>
            <InputField label="District" required>
              <Select
                value={selectedDistrict}
                options={districtSelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={districtSelectHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>
            <InputField label="City" required>
              <Select
                value={selectedCity}
                options={citySelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={citySelectHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>
            <InputField label="Active" required>
              <select className="input-field">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </InputField>
            <div className="flex justify-end gap-3 mt-6 col-start-4">
              <button type="submit" className="bg-[#0b5394] rounded-lg text-white min-w-20 h-10">
                {buttonTitle}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="shadow-lg m-2 p-6 rounded-lg bg-white overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Vendor Master List</h2>

          <button
            className="border border-gray-500 bg-[#1e6da1] rounded-lg text-white px-4 py-2 active:scale-95"
            onClick={() => setShowDetails(p => !p)}
          >
            {showDetails ? "Hide" : "Show"}
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="max-w-290 w-full   rounded-xl shadow-lg border border-gray-200 mt-4 overflow-hidden bg-white">
                <div className="max-h-80 overflow-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-[#f5f9ff] sticky top-0 z-10">
                      <tr>
                        {VendorMasterTableHeader.map((h, index) => (
                          <th
                            key={index}
                            className="px-1 py-3 text-left font-semibold text-gray-900 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {vendorList.map((item, idx) => (
                        <tr
                          key={item?.vendorId}
                          className="hover:bg-gray-150 transition last:border-none"
                        >
                          <td className="px-2 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.vendorName}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.type}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.contactNo}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.email}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.dlno}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.gstinNo}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.fullAddress}</td>

                          <td className="px-2 py-3 text-blue-500" onClick={() => editHandler(item)}>
                            <i className="fa-edit fa-solid fa-xl"></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default VendorMaster;
