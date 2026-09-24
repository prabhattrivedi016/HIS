import { useRef } from "react";

const EditableCell = ({
  value,
  field,
  type = "text",
  isRate = false,
  onSave,
}: {
  value: any;
  field: string;
  type?: "text" | "number" | "select";
  isRate?: boolean;
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

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const text = target.innerText;

    if (isRate) {
      const filteredText = text.replace(/[^0-9]/g, "");
      const limitedText = filteredText.slice(0, 8);
      if (text !== limitedText) {
        target.innerText = limitedText;
        // Move caret to end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(target);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    } else {
      const filteredText = text.replace(/[^a-zA-Z\s.]/g, "");
      if (text !== filteredText) {
        target.innerText = filteredText;
        // Move caret to end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(target);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onInput={handleInput}
      className="px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 hover:bg-gray-100 transition text-gray-700 min-h-5"
    >
      {value ?? 0}
    </div>
  );
};

export default EditableCell;
