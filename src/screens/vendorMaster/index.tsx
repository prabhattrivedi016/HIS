import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import InputField from "../../components/customInputField";
import { SelectStyles } from "../../components/customSelect";
import CheckboxOption from "../../components/multiSelectCheckBox";
import { ENDPOINTS } from "../../config/defaults";
import { Status, VendorDetailsTableHeader } from "../../constants/constants";
import useGetBranchList from "../../hooks/useGetBranchList";
import useGlobalApi from "../../hooks/useGlobalApi";
import { CityItem, CountryItem, DistrictItem, SelectItem, StateItem } from "./types";

export const VendorDetailsTableData = [
  {
    id: 1,
    vendorName: "Shree Medical Store",
    contactNumber: "9876543210",
    gstin: "27ABCDE1234F1Z5",
    address: "MG Road, Andheri East, Mumbai",
    status: "Active",
  },
  {
    id: 2,
    vendorName: "Aarav Pharma Distributors",
    contactNumber: "9123456789",
    gstin: "09AABCU9603R1ZP",
    address: "Sector 18, Noida, Uttar Pradesh",
    status: "Inactive",
  },
  {
    id: 3,
    vendorName: "HealthPlus Agencies",
    contactNumber: "9988776655",
    gstin: "24AAACH7409R1ZX",
    address: "CG Road, Navrangpura, Ahmedabad",
    status: "Active",
  },
  {
    id: 4,
    vendorName: "MedCare Suppliers",
    contactNumber: "9090909090",
    gstin: "29AADCM5146R1ZB",
    address: "Indiranagar, Bengaluru",
    status: "Active",
  },
  {
    id: 5,
    vendorName: "LifeLine Enterprises",
    contactNumber: "8866554433",
    gstin: "07AAEPL1234C1Z9",
    address: "Karol Bagh, New Delhi",
    status: "Inactive",
  },
];

const VendorMaster = () => {
  /*----------------------branches--------------------------- */
  const getBranches = useGetBranchList();
  const { loading, error, fetchApi } = useGlobalApi();

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

  console.log("branchIds", branchIds);

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

  const showDetailPopUpHandler = () => {
    setShowDetails(prev => !prev);
  };

  return (
    <div className="bg-gray-50 min-h-screen px-3 py-4">
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
        <form>
          <div className="form-grid-4">
            <InputField label="Map in Branches">
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
            <InputField label="Type">
              <select className="input-field">
                <option>Both</option>
                <option>Medicine</option>
                <option>General</option>
              </select>
            </InputField>
            <InputField label="Name" required>
              <input className="input-field" type="text" placeholder="Enter Name" />
            </InputField>
            <InputField label="Contact Number" required>
              <input className="input-field" type="text" placeholder="Enter Contact Number" />
            </InputField>
            <InputField label="Email" required>
              <input className="input-field" type="email" placeholder="Enter Email Address" />
            </InputField>
            <InputField label="DL Number" required>
              <input className="input-field" type="text" placeholder="Enter DL Number" />
            </InputField>
            <InputField label="GSTIN Number" required>
              <input className="input-field" type="text" placeholder="Enter GSTIN Number" />
            </InputField>
            <InputField label="Address" required>
              <input className="input-field" type="text" placeholder="Enter Address" />
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
            <InputField label="City">
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
            <InputField label="Active">
              <select className="input-field">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </InputField>
          </div>
        </form>
      </div>
      <div className="shadow-lg m-2 p-6 rounded-lg bg-white overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Vendor List</h2>

          <button
            className="border border-gray-500 bg-[#1e6da1] rounded-lg text-white px-4 py-2 active:scale-95"
            onClick={showDetailPopUpHandler}
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
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="w-full max-h-[250px]  overflow-x-auto border rounded-md mt-4">
                <table className=" table-fixed">
                  <thead className="bg-gray-100 whitespace-nowrap">
                    <tr>
                      {VendorDetailsTableHeader.map((h, index) => (
                        <th key={index} className="border-b px-7 py-2 text-left  w-auto gap-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {VendorDetailsTableData?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 ">
                        <td className="border-b px-6 py-2 ">{idx + 1}</td>

                        <td className="border-b px-6 py-2 ">{item.vendorName}</td>

                        <td className="border-b px-6 py-2 ">{item?.contactNumber}</td>

                        <td className="border-b px-6 py-2 ">{item?.gstin}</td>

                        <td className="border-b px-6 py-2 ">{item?.address}</td>

                        <td className="border-b px-6 py-2 ">{item?.status}</td>
                        <td className="border-b px-6 py-2 ">
                          <i className="fa-edit fa-solid"></i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VendorMaster;
