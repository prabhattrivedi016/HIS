import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import InputField from "../../components/customInputField";
import useGlobalApi from "../../hooks/useGlobalApi";

import Select from "react-select";
import { SelectStyles } from "../../components/customSelect";
import { ENDPOINTS } from "../../config/defaults";
import LocationMasterDrawer from "./components/locationMasterDrawer";
import {
  CityItem,
  CountryItem,
  DistrictItem,
  PinCodeItem,
  PopUpValueItem,
  SelectItem,
  StateItem,
} from "./types";

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

  const [popupValue, setPopupValue] = useState<PopUpValueItem | null>(null);

  const [stateError, setStateError] = useState<string>("");
  const [districtError, setDistrictError] = useState<string>("");
  const [cityError, setCityError] = useState<string>("");
  const [pincodeError, setPincodeError] = useState<string>("");

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
  const countryDropDownHandler = (newValue: unknown) => {
    const option = newValue as SelectItem;
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

  const stateDropDownHandler = (newValue: unknown) => {
    const option = newValue as SelectItem;

    const v = option?.value ?? null;
    setStateId(v);
    setDistrictId(null);
    setCityId(null);
    setDistrictList([]);
    setCityList([]);
    if (v) getDistrictName(v);
  };

  const distDropDownHandler = (newValue: unknown) => {
    const option = newValue as SelectItem;

    const v = option?.value ?? null;
    setDistrictId(v);
    setCityId(null);
    setCityList([]);
    if (v) getCityName(v);
  };

  const cityDropDownHandler = (newValue: unknown) => {
    const option = newValue as SelectItem;

    const v = option?.value ?? null;
    setCityId(v);
    setPincodeId(null);
    setPinCodeList([]);
    if (v) getPinCodeName(v);
  };

  const pinCodeDropDownHandler = (newValue: unknown) => {
    const option = newValue as SelectItem;

    setPincodeId(option?.value ?? null);
  };

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
  const pinCodeSelectOption = pinCodeList.map((p: PinCodeItem) => ({
    value: p.pincodeId,
    label: p.pincode,
  }));

  const selectedCountryOption = countrySelectOption.find(o => o.value === countryId) || null;
  const selectedStateOption = stateSelectOption.find(o => o.value === stateId) || null;
  const selectedDistrictOption = districtSelectOption.find(o => o.value === districtId) || null;
  const selectedCityOption = citySelectOption.find(o => o.value === cityId) || null;
  const selectedPinCodeOption = pinCodeSelectOption.find(o => o.value === pincodeId) || null;

  const popupHandler = ({
    type,
    countryId = 0,
    stateId = 0,
    districtId = 0,
    cityId = 0,
    pincodeId = 0,
  }: {
    type: string;
    countryId?: number | null;
    stateId?: number | null;
    districtId?: number | null;
    cityId?: number | null;
    pincodeId?: number | null;
  }) => {
    if (!countryId && type === "STATE") {
      setStateError("Please select country first");
      return;
    }
    if (!stateId && type === "DISTRICT") {
      setDistrictError("Please select state first");
      return;
    }
    if (!districtId && type === "CITY") {
      setCityError("Please select district first");
      return;
    }
    if (!cityId && type === "PINCODE") {
      setPincodeError("Please select city first");
      return;
    }

    setPopupValue({
      type,
      countryId: selectedCountryOption?.value ?? null,
      stateId: selectedStateOption?.value ?? null,
      districtId: selectedDistrictOption?.value ?? null,
      cityId: selectedCityOption?.value ?? null,
      pincodeId: selectedPinCodeOption?.value ?? null,
      value: type !== "STATE" ? true : selectedStateOption ? true : false,
    });
    setStateError("");
    setDistrictError("");
    setCityError("");
    setPincodeError("");

    setEditPopup(true);
  };

  /*------------------------------drawer close handler--------------- */
  const closeHandler = useCallback(() => {
    setEditPopup(false);
  }, [editPopup]);

  return (
    <div className="page-container">
      <h1 className="page-heading">Location Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Location Master</span>
      </nav>

      <div className="card">
        <h2 className="card-title ">Location Details</h2>
        <div className="form-grid-4">
          <InputField label="Country" required={true}>
            <Select
              options={countrySelectOption}
              value={selectedCountryOption}
              placeholder="Select country"
              isSearchable
              isClearable
              onChange={countryDropDownHandler}
              styles={SelectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          <InputField label="State" required={true}>
            <div className="flex gap-2 items-center">
              <Select
                options={stateSelectOption}
                value={selectedStateOption}
                placeholder="Select state"
                isSearchable
                isClearable
                onChange={stateDropDownHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button onClick={() => popupHandler({ type: "STATE", countryId })}>
                <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
              </button>
            </div>
            {stateError && <p className="input-field-error">{stateError}</p>}
          </InputField>
          <InputField label="District" required={true}>
            <div className="flex gap-2 items-center">
              <Select
                options={districtSelectOption}
                value={selectedDistrictOption}
                placeholder="Select district"
                isSearchable
                isClearable
                onChange={distDropDownHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button onClick={() => popupHandler({ type: "DISTRICT", stateId })}>
                <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
              </button>
            </div>
            {districtError && <p className="input-field-error">{districtError}</p>}
          </InputField>

          <InputField label="City" required={true}>
            <div className="flex gap-2 items-center">
              <Select
                options={citySelectOption}
                value={selectedCityOption}
                placeholder="Select city"
                isSearchable
                isClearable
                onChange={cityDropDownHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button onClick={() => popupHandler({ type: "CITY", districtId })}>
                <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
              </button>
            </div>
            {cityError && <p className="input-field-error">{cityError}</p>}
          </InputField>

          <InputField label="PinCode" required={true}>
            <div className="flex gap-2 items-center">
              <Select
                options={pinCodeSelectOption}
                value={selectedPinCodeOption}
                placeholder="Select pincode"
                isSearchable
                isClearable
                onChange={pinCodeDropDownHandler}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button onClick={() => popupHandler({ type: "PINCODE", pincodeId, cityId })}>
                <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
              </button>
            </div>
            {pincodeError && <p className="input-field-error">{pincodeError}</p>}
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
