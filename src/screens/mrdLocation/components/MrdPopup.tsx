import { ChangeEvent, useEffect, useState } from "react";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { RackItem, RoomItem, ShelfItem } from "../types";

interface MrdPopUpProps {
  isOpenTab: boolean;
  headerName: string;
  onCloseTab: () => void;
  type: "room" | "rack" | "shelf";
  data: RoomItem | RackItem | ShelfItem | null;
  roomId?: number | null;
  rackId?: number | null;
  onSuccess?: () => void;
}

const MrdPopUp = ({
  isOpenTab,
  headerName,
  onCloseTab,
  type,
  data,
  roomId,
  rackId,
  onSuccess,
}: MrdPopUpProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    isActive: "",
    autoCreateShelfs: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      // Update mode - prefill data
      setFormData({
        name: data.name || "",
        isActive: data.isActive?.toString() || "",
        autoCreateShelfs: "",
      });
    } else {
      // Create mode - reset form
      setFormData({
        name: "",
        isActive: "",
        autoCreateShelfs: type === "rack" ? "0" : "",
      });
    }
  }, [data, isOpenTab, type]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Reset validation state when user starts typing
    if (isSubmitting && !loading) {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    const isNameValid = formData.name.trim() !== "";
    const isStatusValid = formData.isActive !== "";

    if (!isNameValid || !isStatusValid) {
      return;
    }

    try {
      let payload: any = {
        name: formData.name.trim(),
        isActive: Number(formData.isActive),
      };

      // Add type-specific fields
      if (type === "room") {
        payload.roomId = data ? (data as RoomItem).roomId : 0;
      } else if (type === "rack") {
        payload.rackId = data ? (data as RackItem).rackId : 0;
        payload.roomId = roomId || 0;

        if (!data) {
          payload.autoCreateShelfs = Number(formData.autoCreateShelfs) || 0;
        }
      } else if (type === "shelf") {
        payload.shelfId = data ? (data as ShelfItem).shelfId : 0;
        payload.roomId = roomId || 0;
        payload.rackId = rackId || 0;
      }

      // Determine endpoint based on type
      let endpoint = "";
      if (type === "room") {
        endpoint = ENDPOINTS.CREATE_UPDATE_MRD_ROOM_MASTER;
      } else if (type === "rack") {
        endpoint = ENDPOINTS.CREATE_UPDATE_MRD_RACK_MASTER;
      } else if (type === "shelf") {
        endpoint = ENDPOINTS.CREATE_UPDATE_MRD_SHELF_MASTER;
      }

      const response = await fetchApi("POST", endpoint, payload);

      if (response) {
        setSuccessMessage(response?.message || "Saved successfully");
        setTimeout(() => {
          onSuccess?.();
          onCloseTab();
        }, 1500);
      }
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  if (!isOpenTab) return null;

  return (
    <>
      {/* Overlay */}
      <div className="drawer-bg-overlay opacity-100 visible" onClick={onCloseTab} />

      {/* Drawer */}
      <div className="central-drawer opacity-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{headerName}</h2>
          <button
            onClick={onCloseTab}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {errorMessage && <ErrorMessage text={errorMessage} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label={`${type.charAt(0).toUpperCase() + type.slice(1)} Name`} required>
            <input
              type="text"
              placeholder={`Enter ${type} name`}
              className="input-field"
              value={formData.name}
              onChange={handleInputChange}
              name="name"
            />
            {!formData.name && !! isSubmitting && (
              <p className="input-field-error">
                {type.charAt(0).toUpperCase() + type.slice(1)} Name is required
              </p>
            )}
          </InputField>
          <InputField label="Status" required>
            <select
              className="input-field"
              value={formData.isActive}
              name="isActive"
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
            {!formData.isActive && !! isSubmitting && (
              <p className="input-field-error">Status is required</p>
            )}
          </InputField>
          {type === "rack" && !data && (
            <InputField label="Auto Create Shelfs">
              <input
                type="text"
                placeholder="Enter number of shelves to auto-create (default: 0)"
                className="input-field"
                value={formData.autoCreateShelfs}
                onChange={handleInputChange}
                name="autoCreateShelfs"
                min="0"
              />
            </InputField>
          )}
          <div className="flex gap-3 mt-6">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? data
                  ? "Updating..."
                  : "Saving..."
                : data
                  ? "Update"
                  : "Save"}
            </button>
            <button type="button" className="cancel-btn" onClick={onCloseTab} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </>
  );
};

export default MrdPopUp;
