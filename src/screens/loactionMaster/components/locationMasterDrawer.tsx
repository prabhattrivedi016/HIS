import React, { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import {
  CityItem,
  CityPopUpItem,
  DistrictItem,
  DistrictPopUpItem,
  LocationMasterDrawerProps,
  PinCodeItem,
  PinCodePopUpItem,
  StateItem,
  StatePopUpItem,
} from "../types";

const LocationMasterDrawer = ({ isOpenTab, onCloseTab, data }: LocationMasterDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [stateForm, setStateForm] = useState({
    stateId: 0,
    countryId: data?.countryId,
    stateName: "",
    isActive: null,
  });
  const [districtForm, setDistrictForm] = useState({
    districtId: 0,
    stateId: data?.stateId,
    countryId: data?.countryId,
    districtName: "",
    isActive: null,
  });
  const [cityForm, setCityForm] = useState({
    cityId: 0,
    districtId: data?.districtId,
    stateId: data?.stateId,
    countryId: data?.countryId,
    cityName: "",
    pincode: "",
    isActive: null,
  });
  const [pinCodeForm, setPinCodeForm] = useState({
    pincodeId: 0,
    cityId: data?.cityId,
    pincode: "",
    isActive: null,
  });

  const isEditMode = Boolean(data?.value);

  const extractHeader = (
    data: StatePopUpItem | DistrictPopUpItem | CityPopUpItem | PinCodePopUpItem
  ) => {
    if (!data?.type) return "Add New";

    switch (data.type) {
      case "STATE":
        return data?.value ? "Update State" : "Create State";

      case "DISTRICT":
        return data?.value ? "Update District" : "Create District";

      case "CITY":
        return data?.value ? "Update City" : "Create City";

      case "PINCODE":
        return data?.value ? "Update Pincode" : "Create Pincode";

      default:
        return "Add New";
    }
  };

  const headerName = useMemo(() => extractHeader(data), [data]);

  /*------------------------------pre filled data on edit -------------------------- */

  const getStateValue = useCallback(async () => {
    if (!data?.countryId) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_STATE_MASTER,
      {},
      {
        params: { countryId: data.countryId, isActive: 1 },
      }
    );
    const state = resp?.data?.find((s: StateItem) => s?.stateId === data?.stateId);
    setStateForm({
      stateId: state?.stateId,
      countryId: state?.countryId,
      stateName: state?.stateName,
      isActive: state?.isActive,
    });
  }, [data?.countryId]);

  const getDistrictName = useCallback(async () => {
    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISTRICT_MASTER,
      {},
      { params: { stateId: data?.stateId, isActive: 1 } }
    );
    if (!res) return;
    const dist = res?.data?.find((d: DistrictItem) => d?.districtId === data?.districtId);
    setDistrictForm({
      districtId: dist?.districtId,
      stateId: dist?.stateId,
      countryId: dist?.countryId,
      districtName: dist?.districtName,
      isActive: dist?.isActive,
    });
  }, [data?.stateId]);

  const getCityName = useCallback(async () => {
    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_CITY_MASTER,
      {},
      { params: { districtId: data?.districtId, isActive: 1 } }
    );
    if (!res) return;
    const city = res?.data?.find((c: CityItem) => c?.cityId === data?.cityId);

    setCityForm({
      cityId: city?.cityId,
      districtId: city?.districtId,
      stateId: city?.stateId,
      countryId: city?.countryId,
      cityName: city?.cityName,
      pincode: city?.pincode ?? "123456",
      isActive: city?.isActive,
    });
  }, [data?.districtId]);

  const getPinCodeName = useCallback(async () => {
    if (!data?.pincodeId) return;

    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_PINCODE_MASTER,
      {},
      { params: { cityId: data?.cityId } }
    );

    const pin = res?.data?.find((p: PinCodeItem) => p?.pincodeId === data?.pincodeId);

    setPinCodeForm({
      pincodeId: pin?.pincodeId,
      cityId: pin?.cityId,
      pincode: pin?.pincode ?? "",
      isActive: pin?.isActive,
    });
  }, [data?.pincodeId]);

  useEffect(() => {
    if (!data) return;

    // Edit mode only
    if (!data.value) return;

    if (data?.countryId) {
      getStateValue();
    }

    if (data?.stateId) {
      getDistrictName();
    }

    if (data?.districtId) {
      getCityName();
    }
    if (data?.cityId) {
      getPinCodeName();
    }
  }, [
    data?.countryId,
    data?.stateId,
    data?.districtId,
    data?.cityId,
    data?.value,
    getStateValue,
    getDistrictName,
    getCityName,
    getPinCodeName,
  ]);

  /*--------------------------------form handler----------------------- */
  const stateHandler = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setStateForm(prev => ({
      ...prev,
      [name]: name === "isActive" ? Number(value) : value,
    }));
  };

  const districtHandler = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setDistrictForm(prev => ({
      ...prev,
      [name]: name === "isActive" ? Number(value) : value,
    }));
  };

  const cityHandler = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setCityForm(prev => ({
      ...prev,
      [name]: name === "isActive" ? Number(value) : value,
    }));
  };

  const pinCodeHandler = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setPinCodeForm(prev => ({
      ...prev,
      [name]: name === "isActive" ? Number(value) : value,
    }));
  };

  /*-----------------------------submit handlers------------------------------------- */
  const submitStateHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    if (!stateForm?.stateName || !stateForm?.isActive) return;

    try {
      const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_STATE_MASTER, stateForm);
      if (!response) return;
      setSuccessMessage(isEditMode ? "Updated successfully" : "Created successfully");

      setTimeout(() => {
        onCloseTab();
      }, 1000);
      setStateForm({
        stateId: 0,
        countryId: data?.countryId,
        stateName: "",
        isActive: null,
      });
    } catch (error) {
      console.error("Error while submitting State", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDistrictHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!districtForm?.districtName || !districtForm?.isActive) return;

    try {
      const response = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_DISTRICT_MASTER,
        districtForm
      );
      if (!response) return;
      setSuccessMessage(isEditMode ? "Updated successfully" : "Created successfully");

      setTimeout(() => {
        onCloseTab();
      }, 1000);
      setDistrictForm({
        districtId: 0,
        stateId: data?.stateId,
        countryId: data?.countryId,
        districtName: "",
        isActive: null,
      });
    } catch (error) {
      console.error("Error while submitting District", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCityHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!cityForm?.cityName || !cityForm?.isActive) return;

    try {
      const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_CITY_MASTER, cityForm);
      if (!response) return;
      setSuccessMessage(isEditMode ? "Updated successfully" : "Created successfully");

      setTimeout(() => {
        onCloseTab();
      }, 1000);

      setCityForm({
        cityId: 0,
        districtId: data?.districtId,
        stateId: data?.stateId,
        countryId: data?.countryId,
        cityName: "",
        pincode: "",
        isActive: null,
      });
    } catch (error) {
      console.error("Error while submitting City", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPinCodeHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!pinCodeForm?.pincode || !pinCodeForm?.isActive) return;

    try {
      const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_PINCODE_MASTER, pinCodeForm);
      if (!response) return;

      setSuccessMessage(isEditMode ? "Updated successfully" : "Created successfully");

      setTimeout(() => {
        onCloseTab();
      }, 1000);

      setPinCodeForm({
        pincodeId: 0,
        cityId: data?.cityId,
        pincode: "",
        isActive: null,
      });
    } catch (error) {
      console.error("Error while submitting PinCode", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /*---------------------------render form based on condition------------------------ */
  const renderForm = () => {
    switch (data?.type) {
      case "STATE": {
        return (
          <form className="space-y-4" onSubmit={submitStateHandler}>
            <InputField label="State Name" required className="mb-3">
              <input
                type="text"
                placeholder="State Name"
                className="input-field"
                value={stateForm?.stateName}
                onChange={stateHandler}
                name="stateName"
              />

              {!stateForm?.stateName && isSubmitting && (
                <p className="input-field-error">State Name is required</p>
              )}
            </InputField>
            <InputField label="Status" required>
              <select
                className="input-field"
                value={stateForm?.isActive ?? ""}
                name="isActive"
                onChange={stateHandler}
              >
                <option value="">Select</option>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {!stateForm?.isActive && isSubmitting && (
                <p className="input-field-error">Status is required</p>
              )}
            </InputField>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {"Save"}
              </button>

              <button type="button" className="cancel-button" onClick={onCloseTab}>
                Cancel
              </button>
            </div>
          </form>
        );
      }
      case "DISTRICT": {
        return (
          <form className="space-y-4" onSubmit={submitDistrictHandler}>
            <InputField label="District Name" className="mb-3" required>
              <input
                type="text"
                placeholder="District Name"
                className="input-field"
                value={districtForm?.districtName}
                onChange={districtHandler}
                name="districtName"
              />
              {!districtForm?.districtName && isSubmitting && (
                <p className="input-field-error">District Name is required</p>
              )}
            </InputField>
            <InputField label="Status" required>
              <select
                className="input-field"
                value={districtForm?.isActive ?? ""}
                onChange={districtHandler}
                name="isActive"
              >
                <option value="">Select</option>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {!districtForm?.isActive && isSubmitting && (
                <p className="input-field-error">Status is required</p>
              )}
            </InputField>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {"Save"}
              </button>

              <button type="button" className="cancel-button" onClick={onCloseTab}>
                Cancel
              </button>
            </div>
          </form>
        );
      }
      case "CITY": {
        return (
          <form className="space-y-4" onSubmit={submitCityHandler}>
            <InputField label="City" required className="mb-3">
              <input
                type="text"
                placeholder="City Name"
                className="input-field"
                onChange={cityHandler}
                value={cityForm?.cityName}
                name="cityName"
              />
              {!cityForm?.cityName && isSubmitting && (
                <p className="input-field-error">City Name is required</p>
              )}
            </InputField>
            <InputField label="Status" required>
              <select
                className="input-field"
                onChange={cityHandler}
                value={cityForm?.isActive ?? ""}
                name={"isActive"}
              >
                <option value="">Select</option>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {!cityForm?.isActive && isSubmitting && (
                <p className="input-field-error">Status is required</p>
              )}
            </InputField>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {"Save"}
              </button>

              <button type="button" className="cancel-button" onClick={onCloseTab}>
                Cancel
              </button>
            </div>
          </form>
        );
      }
      case "PINCODE": {
        return (
          <form className="space-y-4" onSubmit={submitPinCodeHandler}>
            <InputField label="PinCode" required className="mb-3">
              <input
                type="text"
                placeholder="PinCode"
                className="input-field"
                onChange={pinCodeHandler}
                name="pincode"
                value={pinCodeForm?.pincode}
              />
              {!pinCodeForm?.pincode && isSubmitting && (
                <p className="input-field-error">PinCode is required</p>
              )}
            </InputField>

            <InputField label="Status" required>
              <select
                className="input-field"
                onChange={pinCodeHandler}
                value={pinCodeForm?.isActive ?? ""}
                name={"isActive"}
              >
                <option value="">Select</option>
                <option value={1}>Active</option>
                <option value={0}>Select</option>
              </select>
              {!pinCodeForm?.isActive && isSubmitting && (
                <p className="input-field-error">Status is required</p>
              )}
            </InputField>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {"Save"}
              </button>

              <button type="button" className="cancel-button" onClick={onCloseTab}>
                Cancel
              </button>
            </div>
          </form>
        );
      }
    }
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div className={`popup-bg-overlay ${isOpenTab ? "opacity-100 visible" : ""}`} />

      {/* Drawer */}
      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpenTab ? "opacity-full" : ""}`}
      >
        {/* Header */}
        <div className="popup-header">
          <h2 className="popup-helper-text">{headerName}</h2>
          <button onClick={onCloseTab} className="close-drawer-btn">
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error?.message} />}

        {/* render form based on conditions */}
        {renderForm()}
        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </>,
    document.body
  );
};

export default React.memo(LocationMasterDrawer);
