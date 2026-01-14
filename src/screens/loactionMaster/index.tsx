import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import InputField from "../../components/customInputField";
import useGlobalApi from "../../hooks/useGlobalApi";

import Select from "react-select";
import { SelectStyles } from "../../components/customSelect";
import { ENDPOINTS } from "../../config/defaults";
import LocationMasterDrawer from "./components/locationMasterDrawer";
import { CityItem, CountryItem, DistrictItem, SelectItem, StateItem } from "./types";

const LocationMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [editPopup, setEditPopup] = useState<boolean>(false);
  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [stateList, setStateList] = useState<StateItem[]>([]);
  const [districtList, setDistrictList] = useState<DistrictItem[]>([]);
  const [cityList, setCityList] = useState<CityItem[]>([]);
  const [pinCodeList, setPinCodeList] = useState([]);

  const [countryId, setCountryId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [pincodeId, setPincodeId] = useState<number | null>(null);

  const [popupValue, setPopupValue] = useState(null);

  /* -------------------- api handlers -------------------- */
  const getCountryName = useCallback(async () => {
    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_COUNTRY_MASTER,
      {},
      { params: { isActive: 1 } }
    );
    setCountryList(res?.data ?? []);
  }, []);

  const getStateName = useCallback(async (id: number) => {
    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_STATE_MASTER,
      {},
      { params: { countryId: id, isActive: 1 } }
    );
    setStateList(res?.data ?? []);
  }, []);

  const getDistrictName = useCallback(async (id: number) => {
    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISTRICT_MASTER,
      {},
      { params: { stateId: id, isActive: 1 } }
    );
    setDistrictList(res?.data ?? []);
  }, []);

  const getCityName = useCallback(async (id: number) => {
    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_CITY_MASTER,
      {},
      { params: { districtId: id, isActive: 1 } }
    );
    setCityList(res?.data ?? []);
  }, []);

  useEffect(() => {
    getCountryName();
  }, []);

  const getPinCodeName = useCallback(async (id: number) => {
    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_PINCODE_MASTER,
      {},
      { params: { cityId: id, isActive: 1 } }
    );
    setPinCodeList(res?.data ?? []);
  }, []);

  useEffect(() => {
    getCountryName();
  }, []);

  /* -------------------- dropdown handlers -------------------- */
  const countryDropDownHandler = (option: SelectItem) => {
    const v = option?.value ?? null;
    setCountryId(v);
    setStateId(null);
    setDistrictId(null);
    setCityId(null);
    setStateList([]);
    setDistrictList([]);
    setCityList([]);
    if (v) getStateName(v);
  };

  const stateDropDownHandler = (option: SelectItem) => {
    const v = option?.value ?? null;
    setStateId(v);
    setDistrictId(null);
    setCityId(null);
    setDistrictList([]);
    setCityList([]);
    if (v) getDistrictName(v);
  };

  const distDropDownHandler = (option: SelectItem) => {
    const v = option?.value ?? null;
    setDistrictId(v);
    setCityId(null);
    setCityList([]);
    if (v) getCityName(v);
  };

  const cityDropDownHandler = (option: SelectItem) => {
    const v = option?.value ?? null;
    setCityId(v);
    setPincodeId(null);
    setPinCodeList([]);
    if (v) getPinCodeName(v);
  };

  const pinCodeDropDownHandler = (option: SelectItem) => setPincodeId(option?.value ?? null);

  const countrySelectOption = countryList.map(c => ({
    value: c.countryId,
    label: c.countryName,
  }));
  const stateSelectOption = stateList.map(s => ({ value: s.stateId, label: s.stateName }));
  const districtSelectOption = districtList.map(d => ({
    value: d.districtId,
    label: d.districtName,
  }));
  const citySelectOption = cityList.map(c => ({ value: c.cityId, label: c.cityName }));
  const pinCodeSelectOption = pinCodeList.map(p => ({ value: p.pincodeId, label: p.pincode }));

  const selectedCountryOption = countrySelectOption.find(o => o.value === countryId) || null;
  const selectedStateOption = stateSelectOption.find(o => o.value === stateId) || null;
  const selectedDistrictOption = districtSelectOption.find(o => o.value === districtId) || null;
  const selectedCityOption = citySelectOption.find(o => o.value === cityId) || null;
  const selectedPinCodeOption = pinCodeSelectOption.find(o => o.value === pincodeId) || null;

  const popupHandler = ({ type }) => {
    setPopupValue({
      type,
      countryId: selectedCountryOption?.value ?? null,
      stateId: selectedStateOption?.value ?? null,
      districtId: selectedDistrictOption?.value ?? null,
      cityId: selectedCityOption?.value ?? null,
      pincodeId: selectedPinCodeOption?.value ?? null,
      value: type !== "STATE" ? true : selectedStateOption ? true : false,
    });

    setEditPopup(true);
  };

  /*------------------------------drawer close handler--------------- */
  const closeHandler = useCallback(() => {
    setEditPopup(false);
  }, [editPopup]);

  return (
    <div className="bg-gray-50 min-h-screen px-3 py-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Location Master</h1>
        <nav className="text-sm text-gray-500 flex  gap-2 mt-1">
          <NavLink to="/dashboard" className="hover:underline">
            Home
          </NavLink>
          <span>››</span>
          <span>Location Master</span>
        </nav>
      </div>
      <div className=" shadow-lg m-2 p-6 rounded-lg   ">
        <h1 className="mb-4 text-xl font-semibold">Location Details</h1>
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-4">
          <InputField label="Country" required={true}>
            <Select
              options={countrySelectOption}
              value={selectedCountryOption}
              placeholder="Select..."
              isSearchable
              isClearable
              onChange={countryDropDownHandler}
              classNames={SelectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label="State" required={true}>
            <div className="flex gap-2 items-center">
              <Select
                options={stateSelectOption}
                value={selectedStateOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={stateDropDownHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button
                disabled={!selectedCountryOption}
                onClick={() => popupHandler({ type: "STATE" })}
              >
                <i className="fa-solid fa-circle-plus fa-xl"></i>
              </button>
            </div>
          </InputField>
          <InputField label="District" required={true}>
            <div className="flex gap-2 items-center">
              <Select
                options={districtSelectOption}
                value={selectedDistrictOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={distDropDownHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button
                disabled={!selectedStateOption}
                onClick={() => popupHandler({ type: "DISTRICT" })}
              >
                <i className="fa-solid fa-circle-plus fa-xl "></i>
              </button>
            </div>
          </InputField>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InputField label="City" required={true}>
            <div className="flex gap-2 items-center">
              <Select
                options={citySelectOption}
                value={selectedCityOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={cityDropDownHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button
                disabled={!selectedDistrictOption}
                onClick={() => popupHandler({ type: "CITY" })}
              >
                <i className="fa-solid fa-circle-plus fa-xl"></i>
              </button>
            </div>
          </InputField>

          <InputField label="PinCode" required={true}>
            <div className="flex gap-2 items-center">
              <Select
                options={pinCodeSelectOption}
                value={selectedPinCodeOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={pinCodeDropDownHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button
                disabled={!selectedCityOption}
                onClick={() => popupHandler({ type: "PINCODE" })}
              >
                <i className="fa-solid fa-circle-plus fa-xl"></i>
              </button>
            </div>
          </InputField>
        </div>
      </div>
      {editPopup ? (
        <LocationMasterDrawer data={popupValue} onCloseTab={closeHandler} isOpenTab={editPopup} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default LocationMaster;
