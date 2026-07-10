import DynamicFormRenderer, {
  DynamicFormRendererHandle,
  FieldChangeEvent,
} from "@/components/dynamicForm/DynamicFormRenderer";
import { CardSchema, OptionSchema } from "@/components/dynamicForm/types";
import { showError, showSuccess } from "@/utils/alert";
import { useRef, useState } from "react";

const sampleBlob: CardSchema[] = [
  {
    key: "lobandprimaryaddress",
    type: "Card",
    title: "Please Enter Property Address",
    subtitle: "Let's start with a few questions to get you a Bindable Quote.",
    controls: [
      {
        key: "agencydetails",
        label: "Agency List",
        type: "search-dropdown",
        dataPath: "Agency.Code",
        props: { required: true, placeholder: "Select agency" },
        errorMessage: "Please select agency",
        options: [
          { key: "AGT016", label: "Western Security Surplus (Los Angeles)", value: "AGT016" },
          { key: "AGT017", label: "Cogitate Insurance Brokers", value: "AGT017" },
        ],
      },
      {
        key: "agentdetails",
        label: "Agent List",
        type: "search-dropdown",
        dataPath: "Agent.Reference.0.AIM.ReferenceID",
        props: { required: true, placeholder: "Select agency first" },
        errorMessage: "Please select agent",
        options: [],
      },
      {
        key: "formType",
        label: "Form Type",
        type: "dropdown",
        dataPath: "Attributes.FormType",
        props: { required: true },
        errorMessage: "Please select form type",
        options: [
          { label: "HO3", value: "HO3" },
          { label: "HO5", value: "HO5" },
          { label: "HO6", value: "HO6" },
        ],
      },
      {
        key: "isManualAddress",
        label: "Add Manual Address",
        type: "switch",
        dataPath: "Risks.Properties.0.Address.IsManual",
      },
      {
        key: "addressLine1",
        label: "Street Address 1",
        type: "text",
        dataPath: "Risks.Properties.0.Address.AddressLine1",
        props: { required: true, placeholder: "Street Address" },
        errorMessage: "Please enter Street Address",
        conditionalDisplay: [
          { src: "Risks.Properties.0.Address.IsManual", exp: "==", target: true },
        ],
      },
      {
        key: "manualCity",
        label: "City",
        type: "text",
        dataPath: "Risks.Properties.0.Address.City",
        props: { required: true, placeholder: "City" },
        errorMessage: "Please enter City",
        conditionalDisplay: [
          { src: "Risks.Properties.0.Address.IsManual", exp: "==", target: true },
        ],
      },
      {
        key: "manualState",
        label: "State",
        type: "text",
        // custom classes from JSON: uppercase the typed text, narrow the input
        props: {
          required: true,
          placeholder: "State",
          maxlength: 2,
          class: "uppercase max-w-[100px]",
        },
        errorMessage: "Please enter State",
        dataPath: "Risks.Properties.0.Address.State",
        conditionalDisplay: [
          { src: "Risks.Properties.0.Address.IsManual", exp: "==", target: true },
        ],
      },
      {
        key: "zip",
        label: "Zip",
        type: "number2",
        dataPath: "Risks.Properties.0.Address.Zip",
        props: { required: true, placeholder: "Zip", maxlength: 5 },
        errorMessage: "Please enter Zip",
        conditionalDisplay: [
          { src: "Risks.Properties.0.Address.IsManual", exp: "==", target: true },
        ],
      },
      {
        key: "coverageA",
        label: "Dwelling (Coverage A)",
        type: "currency",
        dataPath: "Risks.Properties.0.Coverages.0.Value",
        // custom class: highlight this field with a colored border
        props: {
          required: true,
          placeholder: "Enter amount",
          class: "border-emerald-400 focus:border-emerald-500",
        },
        // simple layout control — no Tailwind knowledge needed: 2 of the row's 4 columns
        colSpan: 1,
        errorMessage: "Please enter Dwelling Coverage",
      },
    ],
  },
  {
    key: "condoOnly",
    type: "Card",
    title: "Condo Association",
    controls: [
      {
        key: "primaryUnits",
        label: "Primary Units",
        type: "dropdown",
        dataPath: "Risks.Properties.0.PropertyRiskAttributes.PrimaryUnits",
        options: [
          { label: "0", value: "0" },
          { label: "1", value: "1" },
          { label: "2", value: "2" },
        ],
      },
    ],
    // this whole card only shows when Form Type is HO6, demonstrating card-level conditionalDisplay
    conditionalDisplay: [{ src: "Attributes.FormType", exp: "==", target: "HO6" }],
  },
];

/** stand-in for a real lookup — agency-specific form types this agency is licensed to write */
const AGENT_OPTIONS_BY_AGENCY: Record<string, OptionSchema[]> = {
  AGT016: [
    { key: "213971", label: "Shridhara Devadiga", value: "213971" },
    { key: "213972", label: "Fielding Norton", value: "213972" },
  ],
  AGT017: [{ key: "300110", label: "Priya Nair", value: "300110" }],
};

const ControlTest = () => {
  const [blob, setBlob] = useState<CardSchema[]>(sampleBlob);
  const [data, setData] = useState<Record<string, unknown>>({});
  const formRef = useRef<DynamicFormRendererHandle>(null);

  const handleControlChange = (event: FieldChangeEvent) => {
    switch (event.cardKey) {
      case "lobandprimaryaddress": {
        if (event.controlKey === "agencydetails") {
          const newAgentOptions = AGENT_OPTIONS_BY_AGENCY[String(event.value)] ?? [];

          setBlob(prev =>
            prev.map(card => {
              if (card.key !== "lobandprimaryaddress") return card;
              return {
                ...card,
                controls: card.controls.map((control, idx) =>
                  idx === 1 ? { ...control, options: newAgentOptions } : control
                ),
              };
            })
          );

          // the previously-picked agent may not belong to the newly-selected agency — clear it
          setData(prev => ({
            ...prev,
            Agent: { Reference: [{ AIM: { ReferenceID: undefined } }] },
          }));
        }
        break;
      }
      default:
        break;
    }
  };

  const handleSubmit = () => {
    const isValid = formRef.current?.validate();
    if (!isValid) {
      showError("Please fix the highlighted fields");
      return;
    }
    showSuccess("Form is valid — ready to send");
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Dynamic Form Control Test</h1>

      <DynamicFormRenderer
        ref={formRef}
        blob={blob}
        data={data}
        onDataChange={setData}
        onControlChange={handleControlChange}
      />

      <div className="form-actions-responsive mt-4">
        <button type="button" className="save-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      <div className="card mt-4">
        <h2 className="card-title mb-2">Live Data (bound via dataPath)</h2>
        <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ControlTest;
