import { useRef } from "react";

const EditableCell = ({
  value,
  field,
  type = "text",
  onSave,
}: {
  value: any;
  field: string;
  type?: "text" | "number" | "select";
  onSave: (field: string, value: any) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleBlur = () => {
    let newValue = ref.current?.innerText ?? "";

    if (type === "number") {
      newValue = newValue ?? "";
    }

    onSave(field, newValue);
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className="px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 hover:bg-gray-100 transition text-gray-700 min-h-5"
    >
      {value ?? 0}
    </div>
  );
};

export default EditableCell;
