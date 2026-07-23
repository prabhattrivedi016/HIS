import { PageType } from "@/constants/constants";
import { useAssignBranchRight } from "@/store/useAssignBranchRight";
const GlobalFooterButtons = ({
  onButtonClick,
  pageType,
  hasDiscountApplied = false,
  paymentCollectionMode = false,
  shouldSaveButtonVisible = false,
}: {
  onButtonClick: (action: string) => void;
  pageType?: PageType;
  hasDiscountApplied?: boolean;
  paymentCollectionMode?: boolean;
  shouldSaveButtonVisible?: boolean;
}) => {
  const { rights: branchRights } = useAssignBranchRight();
  const isDiscountApprovalRequired =
    Number(branchRights?.IsOPDBillingDiscountApprovalRequired) === 1 ? 1 : 0;
  const isSeparateCollectionCounterEnabled =
    Number(branchRights?.IsSeparateCollectionCounterEnabled) === 1 ? 1 : 0;

  const isOPDRefundApprovalRequired =
    Number(branchRights?.IsOPDRefundApprovalRequired) === 1 ? 1 : 0;

  const isCreditNoteApprovalRequired =
    Number(branchRights?.IsCreditNoteApprovalRequired) === 1 ? 1 : 0;

  const isWiteOffApprovalRequired = Number(branchRights?.IsWriteOffApprovalRequired) === 1 ? 1 : 0;

  // "Save As Draft" is only applicable to OPD Billing; IPD admission always uses the plain "Save".
  //   const showSaveAsDraft =
  //     (pageType === PageType?.OPD_BILLING &&
  //       isSeparateCollectionCounterEnabled === 1 &&
  //       isDiscountApprovalRequired === 1) ||
  //     (isSeparateCollectionCounterEnabled === 1 && isDiscountApprovalRequired === 0);

  //   const showDiscountRequest =
  //     pageType === PageType?.OPD_BILLING &&
  //     isDiscountRequestButtonMode(isSeparateCollectionCounterEnabled, isDiscountApprovalRequired);

  //   const showSaveButton =
  //     isSeparateCollectionCounterEnabled === 0 && isDiscountApprovalRequired === 0;

  //   if (paymentCollectionMode) {
  //     return (
  //       <div className="fixed bottom-0 left-0 w-full z-20 bg-white shadow-lg p-1 border-t border-gray-200">
  //         <div className="form-actions-responsive flex-wrap gap-2 justify-end">
  //           <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
  //             Save
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div className="fixed bottom-0 left-0 w-full z-20 bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.08)]">
      <div className="form-actions-responsive mt-0! flex-wrap justify-end gap-2 px-3 py-1.5">
        {pageType === PageType?.OPD_REFUND &&
        isOPDRefundApprovalRequired === 1 &&
        !paymentCollectionMode ? (
          <>
            <button
              type="button"
              className="save-btn"
              onClick={() => onButtonClick("sendForApproval")}
            >
              Send For Approval
            </button>
          </>
        ) : pageType === PageType?.OPD_REFUND ? (
          <>
            <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
              Save
            </button>
            <button type="button" className="cancel-button" onClick={() => onButtonClick("cancel")}>
              Cancel
            </button>
          </>
        ) : (
          <></>
        )}

        {/* credit note */}
        {pageType === PageType?.CREDIT_NOTE && shouldSaveButtonVisible ? (
          <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
            Save
          </button>
        ) : pageType === PageType?.CREDIT_NOTE && isCreditNoteApprovalRequired ? (
          <button
            type="button"
            className="save-btn"
            onClick={() => onButtonClick("sendForApproval")}
          >
            Send For Approval
          </button>
        ) : pageType === PageType?.CREDIT_NOTE ? (
          <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
            Save
          </button>
        ) : null}

        {/* write off isWiteOffApprovalRequired */}

        {pageType === PageType?.WRITE_OFF && isWiteOffApprovalRequired ? (
          <button
            type="button"
            className="save-btn"
            onClick={() => onButtonClick("sendForApproval")}
          >
            Send For Approval
          </button>
        ) : pageType === PageType?.WRITE_OFF ? (
          <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
            Save
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default GlobalFooterButtons;
