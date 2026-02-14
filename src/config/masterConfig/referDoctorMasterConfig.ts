export const referDoctorMasterConfig = {
  type: "referDoctorMaster",

  gridCardView: {
    type: "referDoctorMaster",
    cardType: "referDoctorMasterGrid",
    cardViewType: "grid",

    recordIdKey: "referDoctorId",

    gridLeftTop: [{ label: "Status", keyFromApi: "isActive" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: "" }],

    gridId: [{ label: "Doctor Id", keyFromApi: "referDoctorId" }],

    gridTitle: [{ label: "Doctor Name", keyFromApi: "doctorName" }],

    gridFooterSection: [
      { label: "Name", keyFromApi: "name" },
      { label: "Contact", keyFromApi: "contactNo" },
      { label: "Clinic Name", keyFromApi: "clinicName" },
    ],

    gridButtonSection: [
      { label: "Active", action: "toggleReferDoctorActive" },
      { label: "Edit", action: "toggleReferDoctorEdit" },
    ],
  },

  listCardView: {
    type: "referDoctorMaster",
    cardType: "referDoctorMasterList",
    cardViewType: "list",

    recordIdKey: "referDoctorId",

    listLeftButton: [{ label: "Action", action: "toggleReferDoctorActive" }],

    columns: [
      {
        label: "Refer Doctor Id",
        keyFromApi: "referDoctorId",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Refer Doctor Name",
        keyFromApi: "doctorName",
        isSortable: true,
        isSearchable: true,
      },
      { label: "Status", keyFromApi: "isActive" },
      { label: "Contact", keyFromApi: "contactNo" },

      { label: "Clinic Name", keyFromApi: "clinicName" },
      { label: "Address", keyFromApi: "address" },
    ],
  },
};
