import { PageType } from "@/constants/constants";

const Buttons = ({
  onButtonClick,
  pageType,
}: {
  onButtonClick: (action: string) => void;
  pageType?: PageType;
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full z-20 bg-white shadow-lg p-1 border-t border-gray-200">
      <div className="form-actions-responsive flex-wrap gap-2 justify-end">
        {pageType === PageType?.OPD_BILLING && (
          <>
            <button type="button" className="save-btn" onClick={() => onButtonClick("saveAsDraft")}>
              Save As Draft
            </button>
          </>
        )}

        <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
          {"Save"}
        </button>

        <button type="button" className="cancel-button" onClick={() => onButtonClick("cancel")}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Buttons;
