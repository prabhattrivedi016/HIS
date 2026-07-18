export const opRefundPaymentConfig = {
  type: "opRefundPayment",

  gridCardView: {
    type: "opRefundPayment",
    cardType: "opRefundPaymentGrid",
    cardViewType: "grid",

    recordIdKey: "RefundId",

    gridLeftTop: [{ label: "Status", keyFromApi: "Status" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: null }],

    gridId: [{ label: "Token No", keyFromApi: "TokenNo" }],

    gridTitle: [{ label: "Patient Name", keyFromApi: "PatientName" }],

    gridFooterSection: [
      { label: "UHID", keyFromApi: "UHID" },
      { label: "Gender", keyFromApi: "Gender" },
      { label: "Total Refund Amount", keyFromApi: "TotalRefundAmount" },
    ],

    gridButtonSection: [
      { label: "Payment Collection", action: "togglePaymentCollection" },
      { label: "Cancel", action: "toggleCancelPayment" },
    ],
  },

  listCardView: {
    type: "opRefundPayment",
    cardType: "opRefundPaymentList",
    cardViewType: "list",

    recordIdKey: "RefundId",

    listLeftButton: [{ label: "Action", action: "togglePaymentCollection" }],

    columns: [
      {
        label: "Token No",
        keyFromApi: "TokenNo",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Patient Name",
        keyFromApi: "PatientName",
        isSortable: true,
        isSearchable: true,
      },
      { label: "Status", keyFromApi: "Status" },
      { label: "UHID", keyFromApi: "UHID" },
      { label: "Gender", keyFromApi: "Gender" },
      { label: "Total Bill Amount", keyFromApi: "TotalBillAmount" },
      { label: "Total Discount Per On Bill", keyFromApi: "TotalDiscountPerOnBill" },
      { label: "Total Discount Amount On Bill", keyFromApi: "TotalDiscountAmountOnBill" },
      { label: "Round Off", keyFromApi: "RoundOff" },
      { label: "Total Refund Amount", keyFromApi: "TotalRefundAmount" },
      { label: "Refund Approved", keyFromApi: "IsRefundApproved" },
      { label: "Refund Collected", keyFromApi: "IsRefundCollected" },
      { label: "Approval Remarks", keyFromApi: "ApprovalRemarks" },
      { label: "Is Cancel", keyFromApi: "IsCancel" },
      { label: "Cancel By", keyFromApi: "CancelBy" },
      { label: "Cancel On", keyFromApi: "CancelOn" },
      { label: "Cancel Reason", keyFromApi: "CancelReason" },
      { label: "Created By", keyFromApi: "CreatedBy" },
      { label: "Created On", keyFromApi: "CreatedOn" },
      { label: "Refund Approved Name", keyFromApi: "RefundApprovedName" },
      { label: "Refund Reason", keyFromApi: "RefundReason" },
      { label: "Refund Remark", keyFromApi: "RefundRemark" },
    ],
  },
};
