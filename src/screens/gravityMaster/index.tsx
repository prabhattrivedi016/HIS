import DynamicFormRenderer, {
  DynamicFormRendererHandle,
} from "@/components/dynamicForm/DynamicFormRenderer";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess } from "@/utils/alert";
import { useRef, useState } from "react";
import dummyGravityFormSchema from "./dummyFormData";

const GravityMaster = () => {
  const [data, setData] = useState<Record<string, unknown>>({});
  const formRef = useRef<DynamicFormRendererHandle>(null);
  const { loading, fetchApi } = useGlobalApi();

  const handleSave = async () => {
    const isValid = formRef.current?.validate();
    if (!isValid) return;

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_GRAVITY_MASTER,
      data,
      {},
      { component: "GravityMaster" }
    );

    if (resp?.result) {
      showSuccess("Saved successfully");
      setData({});
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Gravity Master</h1>

      <DynamicFormRenderer
        ref={formRef}
        blob={[dummyGravityFormSchema]}
        data={data}
        onDataChange={setData}
      />

      <div className="form-actions-responsive mt-4">
        <button
          type="button"
          className={loading ? "disabled-btn px-6" : "save-btn px-6"}
          disabled={loading}
          onClick={handleSave}
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default GravityMaster;
