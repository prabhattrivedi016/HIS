import { ButtonProps } from "../types";

export const SaveButtons = ({ onButtonClick = () => {}, isEdit }: ButtonProps) => {
  const buttonTitle = isEdit ? "Update" : "Create";
  return (
    <div className="fixed bottom-0 left-0 w-full z-20 bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.08)]  border-t border-gray-200">
      <div className="form-actions-responsive mt-0! flex-wrap justify-end gap-2 px-3 py-1.5">
        <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
          {buttonTitle}
        </button>

        <button type="button" className="cancel-button" onClick={() => onButtonClick("cancel")}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SaveButtons;
