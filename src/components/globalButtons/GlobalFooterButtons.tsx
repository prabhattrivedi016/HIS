import { PageType } from "@/constants/constants";
import { useAssignBranchRight } from "@/store/useAssignBranchRight";
const GlobalFooterButtons = ({
  onButtonClick,
  pageType,
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

  const isOPDRefundApprovalRequired =
    Number(branchRights?.IsOPDRefundApprovalRequired) === 1 ? 1 : 0;

  const isCreditNoteApprovalRequired =
    Number(branchRights?.IsCreditNoteApprovalRequired) === 1 ? 1 : 0;

  const isWiteOffApprovalRequired = Number(branchRights?.IsWriteOffApprovalRequired) === 1 ? 1 : 0;

  return (
    <div
      className="fixed bottom-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{ left: "var(--app-sidebar-width, 0px)" }}
    >
      <div className="flex flex-wrap justify-end gap-2 px-3 py-2.5">
        {/* opd refund */}
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

        {pageType === PageType?.WRITE_OFF && shouldSaveButtonVisible ? (
          <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
            Save
          </button>
        ) : pageType === PageType?.WRITE_OFF && isWiteOffApprovalRequired ? (
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
        ) : null}

        {/* ipd admission */}
        {pageType === PageType?.IPD_ADMISSION ? (
          <>
            <button type="button" className="save-btn" onClick={() => onButtonClick("save")}>
              Save
            </button>
            <button type="button" className="cancel-button" onClick={() => onButtonClick("cancel")}>
              Cancel
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default GlobalFooterButtons;
