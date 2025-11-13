import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
// import { buildYupSchema } from "../../validation/formSchemaBuilder";
import { formValidator } from "../../validation/formValidator";
import InputField from "../customInputField";

const FormComponent = ({ formConfig = [], open, onClose }) => {
  //   console.log("form config of form component :", formConfig);
  //   const schema = useMemo(() => buildYupSchema(formConfig), [formConfig]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: formConfig.reduce((acc, f) => {
      if (f.fieldId) acc[f.fieldId] = f.defaultValue ?? "";
      return acc;
    }, {}),
  });
  const onSubmit = async data => {
    console.log("form data", data);
  };

  console.log("errorserrors", errors);

  const renderComponent = (component, index) => {
    const { type, label, required } = component ?? {};
    switch (type) {
      case "text":
        return (
          <div>
            <InputField required={required} label={label} key={index}>
              <input
                type="text"
                {...register(component.fieldId, formValidator(component))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>
            {errors[component.fieldId] && (
              <p className="text-red-500 text-sm">{errors[component.fieldId].message}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div>
            <InputField label={label} required={required}>
              <div className="relative">
                <select
                  {...register(component.fieldId)}
                  className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </InputField>
            {errors[component.fieldId] && (
              <p className="text-red-500 text-sm">{errors[component.fieldId].message}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div>
            <InputField required={required} label={label} key={index}>
              <input
                type="date"
                {...register(component.fieldId, {})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>
            {errors[component.fieldId] && (
              <p className="text-red-500 text-sm">{errors[component.fieldId].message}</p>
            )}
          </div>
        );
      default:
        return <div key={index} />;
    }
  };

  if (!formConfig?.length) return <></>;
  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[600px] lg:w-[700px] bg-gray-100 shadow-xl z-50 transition-transform duration-300 overflow-y-auto ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex  justify-between items-center p-4 border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
        <div className="flex flex-col"></div>
        <button onClick={onClose} className="text-gray-600 hover:text-black text-2xl leading-none">
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 p-2 m-2">
          {formConfig?.map((component, index) => {
            return renderComponent(component, index);
          })}
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FormComponent;
