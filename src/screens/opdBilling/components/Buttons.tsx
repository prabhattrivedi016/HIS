const Buttons = ({
  onButtonClick,
  saveLabel = "Save",
}: {
  onButtonClick: (action: string) => void;
  saveLabel?: string;
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full z-20 bg-white shadow-lg p-1 border-t border-gray-200">
      <div className="form-actions-responsive flex-wrap gap-2 justify-end">
        <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
          {saveLabel}
        </button>

        <button type="button" className="cancel-button" onClick={() => onButtonClick("cancel")}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Buttons;
