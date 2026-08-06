export const opdAppointmentConfirmation = {
  type: "opdAppointmentConfirmation",

  gridCardView: {
    type: "opdAppointmentConfirmation",
    cardType: "opdAppointmentConfirmationGrid",
    cardViewType: "grid",

    recordIdKey: "AppId",

    gridLeftTop: [{ label: "Status", keyFromApi: "STATUS" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: null }],

    gridId: [{ label: "Token No", keyFromApi: "TokenNo" }],

    gridTitle: [{ label: "Patient Name", keyFromApi: "PatientName" }],

    gridFooterSection: [
      { label: "Service Name", keyFromApi: "ServiceName" },
      { label: "Source Type", keyFromApi: "SourceType" },
      { label: "Amount", keyFromApi: "Amount" },
    ],

    gridButtonSection: [
      { label: "Confirm", action: "toggleAppointmentConfirmation" },
      { label: "Reschedule", action: "toggleAppointmentReschedule" },
      { label: "Cancel", action: "toggleCancelAppointment" },
    ],
  },

  listCardView: {
    type: "opdAppointmentConfirmation",
    cardType: "opdAppointmentConfirmationList",
    cardViewType: "list",

    recordIdKey: "AppId",

    listLeftButton: [{ label: "Action", action: "toggleOpdAppointmentConfirmation" }],

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
      { label: "Status", keyFromApi: "STATUS" },
      { label: "Doctor Name", keyFromApi: "DoctorName" },
      { label: "Service Name", keyFromApi: "ServiceName" },
      { label: "Source Type", keyFromApi: "SourceType" },
      { label: "Amount", keyFromApi: "Amount" },
      { label: "Appointment Date Time", keyFromApi: "AppDateTime" },
      { label: "Is Cancel", keyFromApi: "IsCancel" },
      { label: "Is Reschedule", keyFromApi: "IsReschedule" },
      { label: "Is Confirm", keyFromApi: "IsConfirm" },
      { label: "Confirm By", keyFromApi: "ConfirmBy" },
      { label: "Confirm On", keyFromApi: "ConfirmOn" },
      { label: "Reschedule By", keyFromApi: "RescheduleBy" },
      { label: "Reschedule On", keyFromApi: "RescheduleOn" },
      { label: "Cancel By", keyFromApi: "CancelBy" },
      { label: "Cancel On", keyFromApi: "CancelOn" },
      { label: "Created By", keyFromApi: "CreatedBy" },
      { label: "Created On", keyFromApi: "CreatedOn" },
      { label: "Last Modified By", keyFromApi: "LastModifiedBy" },
      { label: "Last Modified On", keyFromApi: "LastModifiedOn" },
    ],
  },
};
