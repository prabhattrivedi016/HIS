import { PageType } from "@/constants/constants";
import { useAssignBranchRight } from "@/store/useAssignBranchRight";

const Buttons = ({
  onButtonClick,
  pageType,
}: {
  onButtonClick: (action: string) => void;
  pageType?: PageType;
}) => {
  const { rights: branchRights } = useAssignBranchRight();
  const isDiscountApprovalRequired =
    Number(branchRights?.IsOPDBillingDiscountApprovalRequired) === 1 ? 1 : 0;
  const isSeparateCollectionCounterEnabled =
    Number(branchRights?.IsSeparateCollectionCounterEnabled) === 1 ? 1 : 0;

  // "Save As Draft" is only applicable to OPD Billing; IPD admission always uses the plain "Save".
  const showSaveAsDraft =
    pageType === PageType?.OPD_BILLING &&
    !(isSeparateCollectionCounterEnabled === 0 && isDiscountApprovalRequired === 0);
  return (
    <div className="fixed bottom-0 left-0 w-full z-20 bg-white shadow-lg p-1 border-t border-gray-200">
      <div className="form-actions-responsive flex-wrap gap-2 justify-end">
        {showSaveAsDraft ? (
          <button type="button" className="save-btn" onClick={() => onButtonClick("saveAsDraft")}>
            Save As Draft
          </button>
        ) : (
          <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
            {"Save"}
          </button>
        )}

        {/* <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
          {"Save"}
        </button> */}

        <button type="button" className="cancel-button" onClick={() => onButtonClick("cancel")}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Buttons;
