export const otBookingDetailsConfig = {
  type: "otBookingDetails",

  gridCardView: {
    type: "otBookingDetails",
    cardType: "otBookingDetailsGrid",
    cardViewType: "grid",

    recordIdKey: "OTBookingId",

    gridLeftTop: [{ label: "Status", keyFromApi: "Status" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: null }],

    gridId: [{ label: "OT No", keyFromApi: "OTBookingNo" }],

    gridTitle: [{ label: "Patient Name", keyFromApi: "PatientName" }],

    gridFooterSection: [
      { label: "UHID", keyFromApi: "UHID" },
      { label: "Booking Date", keyFromApi: "OTBookingDate" },
      { label: "IPD No", keyFromApi: "IPDNo" },
    ],

    gridButtonSection: [
      { label: "Confirm", action: "toggleConfirmOtBookingDetails" },

      { label: "Cancel", action: "toggleCancelOtBookingDetails" },
      { label: "Reschedule", action: "toggleRescheduleOtBookingDetails" },
    ],
  },

  listCardView: {
    type: "otBookingDetails",
    cardType: "otBookingDetailsList",
    cardViewType: "list",

    recordIdKey: "OTBookingId",

    listLeftButton: [
      {
        label: "Action",
        action: "toggleOtPatientList",
      },
    ],

    columns: [
      {
        label: "OT Booking No",
        keyFromApi: "OTBookingNo",
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
      {
        label: "Gender",
        keyFromApi: "Gender",
      },

      {
        label: "UHID",
        keyFromApi: "UHID",
      },
      {
        label: "OT Type",
        keyFromApi: "OTType",
      },
      {
        label: "OT Booking Date",
        keyFromApi: "OTBookingDate",
      },
      {
        label: "OT Start Time",
        keyFromApi: "OTBookingFromTime",
      },
      {
        label: "OT End Time",
        keyFromApi: "OTBookingToTime",
      },
    ],
  },
};
