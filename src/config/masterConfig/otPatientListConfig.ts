export const otPatientListConfig = {
  type: "otPatientList",

  gridCardView: {
    type: "otPatientList",
    cardType: "otPatientListGrid",
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
      { label: "Confirm", action: "toggleConfirmOtPatientList" },
      { label: "Reschedule", action: "toggleRescheduleOtPatientList" },

      { label: "Cancel", action: "toggleCancelOtPatientList" },
    ],
  },

  listCardView: {
    type: "otPatientList",
    cardType: "otPatientListList",
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
