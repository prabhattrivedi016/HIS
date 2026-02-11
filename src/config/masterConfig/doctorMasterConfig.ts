export const doctorMasterConfig = {
  type: "doctorMaster",

  gridCardView: {
    type: "doctorMaster",
    cardType: "doctorMasterGrid",
    cardViewType: "grid",

    recordIdKey: "doctorId",

    gridLeftTop: [{ label: "Status", keyFromApi: "isActive" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: "doctorSignFilePath" }],

    gridId: [{ label: "Doctor Id", keyFromApi: "doctorId" }],

    gridTitle: [{ label: "Doctor Name", keyFromApi: "name" }],

    gridFooterSection: [
      { label: "Gender", keyFromApi: "gender" },
      { label: "Department", keyFromApi: "department" },
      { label: "Specialization", keyFromApi: "specialization" },
    ],

    gridButtonSection: [
      { label: "Active", action: "toggleDoctorActive" },
      { label: "Edit", action: "toggleDoctorEdit" },
    ],
  },

  listCardView: {
    type: "doctorMaster",
    cardType: "doctorMasterList",
    cardViewType: "list",

    recordIdKey: "doctorId",

    listLeftButton: [{ label: "Action", action: "toggleDoctorActive" }],

    columns: [
      {
        label: "Doctor Id",
        keyFromApi: "doctorId",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Doctor Name",
        keyFromApi: "name",
        isSortable: true,
        isSearchable: true,
      },
      { label: "Status", keyFromApi: "isActive" },
      { label: "contact", keyFromApi: "contactNo" },
      { label: "Email", keyFromApi: "emailId" },
      { label: "Address", keyFromApi: "address" },
      { label: "User Name", keyFromApi: "userName" },
      { label: "Gender", keyFromApi: "gender" },
      { label: "Profile Summery", keyFromApi: "profileSummery" },
      { label: "Registration No", keyFromApi: "registrationNo" },
      { label: "Department", keyFromApi: "department" },
      { label: " Specialization", keyFromApi: "specialization" },
      { label: "Room", keyFromApi: "roomNo" },
      { label: "Created By", keyFromApi: "createdBy" },
      { label: "Created On", keyFromApi: "createdOn" },
      { label: "IP Address", keyFromApi: "ipAddress" },
    ],
  },
};
