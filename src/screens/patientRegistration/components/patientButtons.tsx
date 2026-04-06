import { ButtonProps } from "../types";

export const SaveButtons = ({ onButtonClick = () => {}, isEdit }: ButtonProps) => {
  const buttonTitle = isEdit ? "Update" : "Create";
  return (
    <div className="fixed bottom-0 left-0 w-full z-20 bg-white shadow-lg p-2 border-t border-gray-200">
      <div className="form-actions-responsive flex-wrap gap-2 justify-end">
        <button type="submit" className="save-btn" onClick={() => onButtonClick("save")}>
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
